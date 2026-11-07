-- MotoLog 초기 데이터베이스 구성 SQL
-- 새 Supabase 프로젝트의 SQL Editor에서 한 번만 실행하세요.
-- 이 파일은 기존 테이블이나 데이터를 삭제하지 않습니다.

begin;

create extension if not exists pgcrypto;

-- 계정 비활성화 여부는 Auth의 관리자 전용 app_metadata.account_status로 판단합니다.
-- 값이 없으면 기존/신규 사용자가 계속 사용할 수 있도록 active로 취급합니다.
create function public.is_current_account_active()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select auth.uid() is not null
     and coalesce(
       (
         select u.raw_app_meta_data ->> 'account_status'
         from auth.users as u
         where u.id = auth.uid()
       ),
       'active'
     ) = 'active';
$$;

revoke all on function public.is_current_account_active() from public, anon, authenticated;
grant execute on function public.is_current_account_active() to authenticated;

create table public.bikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete restrict,
  nickname text,
  manufacturer text not null,
  model text not null,
  model_year integer,
  purchase_date date,
  current_odometer_km integer not null,
  odometer_recorded_at timestamptz not null default now(),
  status text not null default 'active',
  photo_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bikes_id_user_id_key unique (id, user_id),
  constraint bikes_nickname_length_check check (nickname is null or char_length(nickname) between 1 and 50),
  constraint bikes_manufacturer_check check (char_length(btrim(manufacturer)) between 1 and 50),
  constraint bikes_model_check check (char_length(btrim(model)) between 1 and 50),
  constraint bikes_model_year_check check (model_year is null or model_year between 1000 and 9999),
  constraint bikes_odometer_check check (current_odometer_km >= 0),
  constraint bikes_status_check check (status in ('active', 'archived')),
  constraint bikes_notes_length_check check (notes is null or char_length(notes) <= 2000)
);

create table public.riding_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  bike_id uuid not null,
  title text not null,
  ride_date date not null,
  start_location text not null,
  waypoints jsonb not null default '[]'::jsonb,
  end_location text not null,
  distance_km integer not null,
  started_at timestamptz,
  ended_at timestamptz,
  ride_type text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint riding_logs_bike_owner_fkey foreign key (bike_id, user_id)
    references public.bikes(id, user_id) on delete restrict,
  constraint riding_logs_title_check check (char_length(btrim(title)) between 1 and 100),
  constraint riding_logs_start_check check (char_length(btrim(start_location)) between 1 and 100),
  constraint riding_logs_end_check check (char_length(btrim(end_location)) between 1 and 100),
  constraint riding_logs_distance_check check (distance_km > 0),
  constraint riding_logs_type_check check (ride_type ~ '^R[1-9][0-9]*$'),
  constraint riding_logs_notes_check check (notes is null or char_length(notes) <= 2000),
  constraint riding_logs_times_together_check check (
    (started_at is null and ended_at is null)
    or (started_at is not null and ended_at is not null and ended_at > started_at)
  )
);

create table public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  bike_id uuid not null,
  maintenance_date date not null,
  items jsonb not null,
  title text not null,
  odometer_km integer,
  cost_krw integer not null default 0,
  service_type text not null default 'unknown',
  shop_name text,
  next_due_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_logs_bike_owner_fkey foreign key (bike_id, user_id)
    references public.bikes(id, user_id) on delete restrict,
  constraint maintenance_logs_title_check check (char_length(btrim(title)) between 1 and 100),
  constraint maintenance_logs_odometer_check check (odometer_km is null or odometer_km >= 0),
  constraint maintenance_logs_cost_check check (cost_krw >= 0),
  constraint maintenance_logs_service_type_check check (service_type in ('shop', 'self', 'unknown')),
  constraint maintenance_logs_shop_name_check check (shop_name is null or char_length(shop_name) between 1 and 100),
  constraint maintenance_logs_notes_check check (notes is null or char_length(notes) <= 2000)
);

create index bikes_user_id_idx on public.bikes (user_id);
create index riding_logs_user_bike_date_idx on public.riding_logs (user_id, bike_id, ride_date desc);
create index maintenance_logs_user_bike_date_idx on public.maintenance_logs (user_id, bike_id, maintenance_date desc);

-- JSON 경유지는 비어 있지 않은 장소명 배열만 허용합니다.
create function public.is_valid_waypoints(p_waypoints jsonb)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  point jsonb;
begin
  if jsonb_typeof(p_waypoints) <> 'array' then return false; end if;
  for point in select value from jsonb_array_elements(p_waypoints)
  loop
    if jsonb_typeof(point) <> 'string'
       or char_length(btrim(point #>> '{}')) not between 1 and 100 then
      return false;
    end if;
  end loop;
  return true;
end;
$$;

alter table public.riding_logs
  add constraint riding_logs_waypoints_check check (public.is_valid_waypoints(waypoints));

-- 정비 항목 JSON을 검증하고, 항목 비용 합계를 반환합니다.
create function public.maintenance_items_total(p_items jsonb)
returns integer
language plpgsql
immutable
set search_path = pg_catalog
as $$
declare
  item jsonb;
  item_cost numeric;
  total_cost numeric := 0;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception '정비 항목은 한 개 이상 필요합니다.';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(item) <> 'object'
       or not (item ? 'type_code' and item ? 'name' and item ? 'cost_krw')
       or jsonb_typeof(item -> 'type_code') <> 'string'
       or jsonb_typeof(item -> 'name') <> 'string'
       or jsonb_typeof(item -> 'cost_krw') <> 'number'
       or (item ? 'notes' and jsonb_typeof(item -> 'notes') <> 'string')
       or (item ? 'affects_next_due' and jsonb_typeof(item -> 'affects_next_due') <> 'boolean') then
      raise exception '정비 항목 형식이 올바르지 않습니다.';
    end if;

    if (item ->> 'type_code') !~ '^F[1-9][0-9]*$'
       or char_length(btrim(item ->> 'name')) not between 1 and 100
       or (item ? 'notes' and char_length(item ->> 'notes') > 2000) then
      raise exception '정비 항목의 코드, 이름 또는 메모가 올바르지 않습니다.';
    end if;

    begin
      item_cost := (item ->> 'cost_krw')::numeric;
    exception when others then
      raise exception '정비 항목 비용은 정수여야 합니다.';
    end;
    if item_cost < 0 or trunc(item_cost) <> item_cost or item_cost > 2147483647 then
      raise exception '정비 항목 비용은 0 이상 정수여야 합니다.';
    end if;
    total_cost := total_cost + item_cost;
    if total_cost > 2147483647 then
      raise exception '정비 방문 총비용이 허용 범위를 초과했습니다.';
    end if;
  end loop;
  return total_cost::integer;
end;
$$;

-- 수정 시각, 빈 선택 문자열, 날짜·시각 및 정비 합계를 서버에서 처리합니다.
create function public.prepare_bike_write()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.nickname := nullif(btrim(new.nickname), '');
  new.notes := nullif(btrim(new.notes), '');
  new.photo_path := nullif(btrim(new.photo_path), '');
  new.manufacturer := btrim(new.manufacturer);
  new.model := btrim(new.model);
  if new.purchase_date is not null and new.purchase_date > (now() at time zone 'Asia/Seoul')::date then
    raise exception '구매일은 오늘 이후로 입력할 수 없습니다.';
  end if;
  new.updated_at := now();
  if tg_op = 'UPDATE' and new.current_odometer_km is distinct from old.current_odometer_km then
    new.odometer_recorded_at := now();
  end if;
  return new;
end;
$$;

create function public.prepare_riding_log_write()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.title := btrim(new.title);
  new.start_location := btrim(new.start_location);
  new.end_location := btrim(new.end_location);
  new.notes := nullif(btrim(new.notes), '');
  new.updated_at := now();
  if new.ride_date > (now() at time zone 'Asia/Seoul')::date then
    raise exception '라이딩 날짜는 오늘 이후로 입력할 수 없습니다.';
  end if;
  if new.started_at is not null then
    if new.started_at > now() or new.ended_at > now() then
      raise exception '미래 시각의 라이딩 기록은 저장할 수 없습니다.';
    end if;
    if (new.started_at at time zone 'Asia/Seoul')::date <> new.ride_date then
      raise exception '라이딩 날짜와 출발 시각의 한국 날짜가 일치해야 합니다.';
    end if;
  end if;
  return new;
end;
$$;

create function public.prepare_maintenance_log_write()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.title := btrim(new.title);
  new.shop_name := nullif(btrim(new.shop_name), '');
  new.notes := nullif(btrim(new.notes), '');
  if new.maintenance_date > (now() at time zone 'Asia/Seoul')::date then
    raise exception '정비일은 오늘 이후로 입력할 수 없습니다.';
  end if;
  new.cost_krw := public.maintenance_items_total(new.items);
  new.next_due_date := (new.maintenance_date + interval '6 months')::date;
  new.updated_at := now();
  return new;
end;
$$;

create trigger bikes_prepare_write
before insert or update on public.bikes
for each row execute function public.prepare_bike_write();

create trigger riding_logs_prepare_write
before insert or update on public.riding_logs
for each row execute function public.prepare_riding_log_write();

create trigger maintenance_logs_prepare_write
before insert or update on public.maintenance_logs
for each row execute function public.prepare_maintenance_log_write();

-- 동시 요청에도 보관 바이크에 기록이 추가·변경되지 않도록 바이크 행을 잠근 뒤 확인합니다.
create function public.assert_active_owned_bike()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  bike_is_active boolean;
begin
  select (b.status = 'active') into bike_is_active
  from public.bikes as b
  where b.id = new.bike_id and b.user_id = new.user_id
  for update;
  if bike_is_active is distinct from true then
    raise exception '활성 상태인 본인 바이크에만 기록을 저장할 수 있습니다.';
  end if;
  return new;
end;
$$;

create trigger riding_logs_assert_active_bike
before insert or update on public.riding_logs
for each row execute function public.assert_active_owned_bike();

create trigger maintenance_logs_assert_active_bike
before insert or update on public.maintenance_logs
for each row execute function public.assert_active_owned_bike();

-- 보관 바이크는 일반 수정 정책으로 복원하지 않고, 이 함수로 상태만 안전하게 변경합니다.
create function public.set_bike_archive_status(p_bike_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not public.is_current_account_active() then
    raise exception '활성 계정만 바이크 상태를 변경할 수 있습니다.';
  end if;
  if p_status not in ('active', 'archived') then
    raise exception '바이크 상태가 올바르지 않습니다.';
  end if;

  update public.bikes
  set status = p_status
  where id = p_bike_id and user_id = auth.uid();

  if not found then
    raise exception '본인 바이크를 찾을 수 없습니다.';
  end if;
end;
$$;

revoke all on function public.set_bike_archive_status(uuid, text) from public, anon, authenticated;
grant execute on function public.set_bike_archive_status(uuid, text) to authenticated;

alter table public.bikes enable row level security;
alter table public.riding_logs enable row level security;
alter table public.maintenance_logs enable row level security;

revoke all on table public.bikes, public.riding_logs, public.maintenance_logs from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.bikes, public.riding_logs, public.maintenance_logs to authenticated;

create policy "활성 계정은 자신의 바이크를 조회"
on public.bikes for select to authenticated
using (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 자신의 바이크를 등록"
on public.bikes for insert to authenticated
with check (public.is_current_account_active() and auth.uid() = user_id and status = 'active');

create policy "활성 계정은 자신의 활성 바이크를 수정"
on public.bikes for update to authenticated
using (public.is_current_account_active() and auth.uid() = user_id and status = 'active')
with check (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 자신의 로그를 조회"
on public.riding_logs for select to authenticated
using (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 활성 바이크에 라이딩을 등록"
on public.riding_logs for insert to authenticated
with check (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 활성 바이크의 라이딩을 수정"
on public.riding_logs for update to authenticated
using (
  public.is_current_account_active() and auth.uid() = user_id
  and exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = user_id and b.status = 'active')
)
with check (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 활성 바이크의 라이딩을 삭제"
on public.riding_logs for delete to authenticated
using (
  public.is_current_account_active() and auth.uid() = user_id
  and exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = user_id and b.status = 'active')
);

create policy "활성 계정은 자신의 정비 기록을 조회"
on public.maintenance_logs for select to authenticated
using (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 활성 바이크에 정비를 등록"
on public.maintenance_logs for insert to authenticated
with check (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 활성 바이크의 정비를 수정"
on public.maintenance_logs for update to authenticated
using (
  public.is_current_account_active() and auth.uid() = user_id
  and exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = user_id and b.status = 'active')
)
with check (public.is_current_account_active() and auth.uid() = user_id);

create policy "활성 계정은 활성 바이크의 정비를 삭제"
on public.maintenance_logs for delete to authenticated
using (
  public.is_current_account_active() and auth.uid() = user_id
  and exists (select 1 from public.bikes b where b.id = bike_id and b.user_id = user_id and b.status = 'active')
);

commit;

-- 사진 버킷/Storage 정책과 계정 비활성화를 실행하는 Edge Function은 이후 단계에서 추가합니다.
