-- stats 日次テーブルの変更を検知して月次・年次テーブルに total_cnt / total_minutes を反映するトリガー
--
-- stats_all_day           → stats_all_month / stats_all_year
-- stats_teacher_day       → stats_teacher_month / stats_teacher_year
--
-- admins, teachers には影響なし

-- ****************************************************
-- 全体統計用トリガー
-- ****************************************************

create or replace function public.sync_stats_all_month_year()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  cnt_diff  int;
  min_diff  int;
  v_date    date;
  v_year    int;
  v_month   int;
  v_cat     text;
begin
  -- INSERT / UPDATE / DELETE で差分を計算
  if TG_OP = 'INSERT' then
    cnt_diff := NEW.total_cnt;
    min_diff := NEW.total_minutes;
    v_date   := NEW.key_date;
    v_cat    := NEW.category;
  elsif TG_OP = 'UPDATE' then
    cnt_diff := NEW.total_cnt  - COALESCE(OLD.total_cnt, 0);
    min_diff := NEW.total_minutes - COALESCE(OLD.total_minutes, 0);
    v_date   := NEW.key_date;
    v_cat    := NEW.category;
  elsif TG_OP = 'DELETE' then
    cnt_diff := - OLD.total_cnt;
    min_diff := - OLD.total_minutes;
    v_date   := OLD.key_date;
    v_cat    := OLD.category;
  end if;

  -- 変化がなければ終了
  if cnt_diff = 0 and min_diff = 0 then
    if TG_OP = 'DELETE' then
      return OLD;
    else
      return NEW;
    end if;
  end if;

  v_year  := extract(year  from v_date);
  v_month := extract(month from v_date);

  -- 月次テーブルを更新 (upsert)
  insert into stats_all_month(key_year, key_month, category, total_cnt, total_minutes)
  values (v_year, v_month, v_cat, cnt_diff, min_diff)
  on conflict (key_year, key_month, category) do update
    set total_cnt     = stats_all_month.total_cnt     + EXCLUDED.total_cnt,
        total_minutes = stats_all_month.total_minutes + EXCLUDED.total_minutes;

  -- 年次テーブルを更新 (upsert)
  insert into stats_all_year(key_year, category, total_cnt, total_minutes)
  values (v_year, v_cat, cnt_diff, min_diff)
  on conflict (key_year, category) do update
    set total_cnt     = stats_all_year.total_cnt     + EXCLUDED.total_cnt,
        total_minutes = stats_all_year.total_minutes + EXCLUDED.total_minutes;

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

-- トリガー作成 / 置き換え
-- (既存トリガーがあれば削除してから作成)

drop trigger if exists trg_sync_stats_all_month_year on stats_all_day;
create trigger trg_sync_stats_all_month_year
after insert or update or delete on stats_all_day
for each row execute function sync_stats_all_month_year();


-- ****************************************************
-- 講師別統計用トリガー
-- ****************************************************

create or replace function public.sync_stats_teacher_month_year()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  cnt_diff  int;
  min_diff  int;
  v_date    date;
  v_year    int;
  v_month   int;
  v_email   text;
  v_cat     text;
begin
  if TG_OP = 'INSERT' then
    cnt_diff := NEW.total_cnt;
    min_diff := NEW.total_minutes;
    v_date   := NEW.key_date;
    v_email  := NEW.email;
    v_cat    := NEW.category;
  elsif TG_OP = 'UPDATE' then
    cnt_diff := NEW.total_cnt  - COALESCE(OLD.total_cnt, 0);
    min_diff := NEW.total_minutes - COALESCE(OLD.total_minutes, 0);
    v_date   := NEW.key_date;
    v_email  := NEW.email;
    v_cat    := NEW.category;
  elsif TG_OP = 'DELETE' then
    cnt_diff := - OLD.total_cnt;
    min_diff := - OLD.total_minutes;
    v_date   := OLD.key_date;
    v_email  := OLD.email;
    v_cat    := OLD.category;
  end if;

  if cnt_diff = 0 and min_diff = 0 then
    if TG_OP = 'DELETE' then
      return OLD;
    else
      return NEW;
    end if;
  end if;

  v_year  := extract(year  from v_date);
  v_month := extract(month from v_date);

  -- 月次
  insert into stats_teacher_month(email, key_year, key_month, category, total_cnt, total_minutes)
  values (v_email, v_year, v_month, v_cat, cnt_diff, min_diff)
  on conflict (email, key_year, key_month, category) do update
    set total_cnt     = stats_teacher_month.total_cnt     + EXCLUDED.total_cnt,
        total_minutes = stats_teacher_month.total_minutes + EXCLUDED.total_minutes;

  -- 年次
  insert into stats_teacher_year(email, key_year, category, total_cnt, total_minutes)
  values (v_email, v_year, v_cat, cnt_diff, min_diff)
  on conflict (email, key_year, category) do update
    set total_cnt     = stats_teacher_year.total_cnt     + EXCLUDED.total_cnt,
        total_minutes = stats_teacher_year.total_minutes + EXCLUDED.total_minutes;

  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$;

drop trigger if exists trg_sync_stats_teacher_month_year on stats_teacher_day;
create trigger trg_sync_stats_teacher_month_year
after insert or update or delete on stats_teacher_day
for each row execute function sync_stats_teacher_month_year(); 