-- MotoLog 대표 사진 Storage 설정
-- database.sql을 먼저 실행한 뒤, Supabase SQL Editor에서 한 번 실행하세요.
-- 새 버킷인 bike-photos를 만들고 JPEG/PNG/WebP, 최대 5MB만 허용합니다.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bike-photos',
  'bike-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 경로 형식: {user_id}/{bike_id}/{고유파일명}
-- 활성 계정이 소유한 활성 바이크의 사진만 업로드할 수 있습니다.
create policy "MotoLog 사용자는 자신의 바이크 사진을 업로드"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'bike-photos'
  and public.is_current_account_active()
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.bikes as b
    where b.user_id = auth.uid()
      and b.id::text = (storage.foldername(name))[2]
      and b.status = 'active'
  )
);

-- 비공개 버킷이므로 본인 바이크 사진만 짧은 서명 URL로 읽습니다.
create policy "MotoLog 사용자는 자신의 바이크 사진을 조회"
on storage.objects for select to authenticated
using (
  bucket_id = 'bike-photos'
  and public.is_current_account_active()
  and (storage.foldername(name))[1] = auth.uid()::text
  and exists (
    select 1
    from public.bikes as b
    where b.user_id = auth.uid()
      and b.id::text = (storage.foldername(name))[2]
  )
);

commit;

-- 이 단계에서는 기존 사진 삭제·교체를 구현하지 않았으므로 DELETE/UPDATE 정책을 만들지 않습니다.
