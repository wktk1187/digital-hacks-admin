-- Function with SECURITY DEFINER to bypass RLS
create or replace function public.update_meeting_stats(
  p_email text,
  p_duration int default 0,
  p_delta int default 1
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_now_jst  timestamptz := now() at time zone 'Asia/Tokyo';
  v_today    date        := v_now_jst::date;
  v_month    int         := extract(month from v_now_jst);
  v_year     int         := extract(year  from v_now_jst);
begin
  insert into stats_all(key_year, key_month, key_date,
                        day_total, month_total, year_total, total_minutes)
  values (v_year, v_month, v_today, p_delta, p_delta, p_delta, p_duration)
  on conflict (key_date) do update
    set day_total     = stats_all.day_total     + p_delta,
        month_total   = stats_all.month_total   + p_delta,
        year_total    = stats_all.year_total    + p_delta,
        total_minutes = stats_all.total_minutes + p_duration;

  insert into stats_teacher(email, key_year, key_month, key_date,
                            day_total, month_total, year_total, total_minutes)
  values (p_email, v_year, v_month, v_today, p_delta, p_delta, p_delta, p_duration)
  on conflict (email, key_date) do update
    set day_total     = stats_teacher.day_total     + p_delta,
        month_total   = stats_teacher.month_total   + p_delta,
        year_total    = stats_teacher.year_total    + p_delta,
        total_minutes = stats_teacher.total_minutes + p_duration;
end;
$$; 