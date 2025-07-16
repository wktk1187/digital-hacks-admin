-- 2025-07 category 拡張マイグレーション
-- stats_* テーブルに category 列を追加 ('teacher'|'entry' など)
-- 既存レコードは 'teacher' をセット

begin;

alter table stats_all_day   add column if not exists category text not null default 'teacher';
alter table stats_all_month add column if not exists category text not null default 'teacher';
alter table stats_all_year  add column if not exists category text not null default 'teacher';

alter table stats_teacher_day   add column if not exists category text not null default 'teacher';
alter table stats_teacher_month add column if not exists category text not null default 'teacher';
alter table stats_teacher_year  add column if not exists category text not null default 'teacher';

-- 一意制約 (key_date, category) などを追加
alter table stats_all_day
  drop constraint if exists stats_all_day_category_uniq;
alter table stats_all_day
  add constraint stats_all_day_category_uniq unique (key_date, category);

alter table stats_all_month
  drop constraint if exists stats_all_month_category_uniq;
alter table stats_all_month
  add constraint stats_all_month_category_uniq unique (key_year, key_month, category);

alter table stats_all_year
  drop constraint if exists stats_all_year_category_uniq;
alter table stats_all_year
  add constraint stats_all_year_category_uniq unique (key_year, category);

alter table stats_teacher_day
  drop constraint if exists stats_teacher_day_category_uniq;
alter table stats_teacher_day
  add constraint stats_teacher_day_category_uniq unique (email, key_date, category);

alter table stats_teacher_month
  drop constraint if exists stats_teacher_month_category_uniq;
alter table stats_teacher_month
  add constraint stats_teacher_month_category_uniq unique (email, key_year, key_month, category);

alter table stats_teacher_year
  drop constraint if exists stats_teacher_year_category_uniq;
alter table stats_teacher_year
  add constraint stats_teacher_year_category_uniq unique (email, key_year, category);

commit; 