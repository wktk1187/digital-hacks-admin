-- 管理者ログイン用テーブル
-- 実行例: Supabase SQL Editor に貼り付け

begin;

create table if not exists public.admins (
  email text primary key,
  password_hash text not null
);

-- 初期ユーザー
insert into public.admins(email, password_hash)
values ('info@digital-hacks.com', 'ub3515-dh')
on conflict (email) do update set password_hash = excluded.password_hash;

commit; 