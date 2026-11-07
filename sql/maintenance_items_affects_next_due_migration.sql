-- 기존 MotoLog DB용 마이그레이션입니다.
-- Supabase SQL Editor에서 database.sql을 이미 실행한 프로젝트에 한 번만 실행하세요.
-- 기존 items에 affects_next_due가 없는 데이터는 수정하지 않으며, 앱에서는 true로 해석합니다.

begin;

create or replace function public.maintenance_items_total(p_items jsonb)
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

commit;
