-- 統計テーブルを初期化し、2025/07/01〜07/07 のデータを登録するスクリプト
-- admins, teachers テーブルは変更しない

begin;

-- 1) 既存データ削除 ------------------------------------------------------
truncate table
  stats_all_day,
  stats_all_month,
  stats_all_year,
  stats_teacher_day,
  stats_teacher_month,
  stats_teacher_year;

-- 2) 受講データ登録 --------------------------------------------------------
-- update_meeting_stats(p_email text, p_date_str text, p_duration_minutes int, p_delta_count int)
-- p_delta_count は常に 1 で固定（1 面談分の加算）

-- 2025/07/01 -------------------------------------------------------------
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/01', 40, 1);
select update_meeting_stats('k.sekiguchi@digital-hacks.com', '2025/07/01', 26, 1);
select update_meeting_stats('y.mikami@digital-hacks.com',   '2025/07/01', 81, 1);
select update_meeting_stats('t.ueyama@digital-hacks.com',    '2025/07/01', 54, 1);
select update_meeting_stats('y.hirao@digital-hacks.com',     '2025/07/01', 60, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/01', 90, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/01', 55, 1);
select update_meeting_stats('y.mikami@digital-hacks.com',    '2025/07/01', 62, 1);
select update_meeting_stats('k.morishita@digital-hacks.com', '2025/07/01', 71, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/01', 49, 1);
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/01', 58, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/01', 53, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/01', 52, 1);
select update_meeting_stats('t.ueyama@digital-hacks.com',    '2025/07/01', 61, 1);
select update_meeting_stats('y.okamoto@digital-hacks.com',   '2025/07/01', 60, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/01', 58, 1);
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/01', 68, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/01', 64, 1);
select update_meeting_stats('t.ueyama@digital-hacks.com',    '2025/07/01', 70, 1);

-- 2025/07/02 -------------------------------------------------------------
select update_meeting_stats('k.morishita@digital-hacks.com', '2025/07/02', 59, 1);
select update_meeting_stats('k.sekiguchi@digital-hacks.com', '2025/07/02', 50, 1);
select update_meeting_stats('k.sekiguchi@digital-hacks.com', '2025/07/02', 40, 1);
select update_meeting_stats('k.ishisone@digital-hacks.com',  '2025/07/02', 45, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/02', 36, 1);
select update_meeting_stats('k.sekiguchi@digital-hacks.com', '2025/07/02', 40, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/02', 47, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/02', 16, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/02', 57, 1);
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/02', 75, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/02', 31, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/02', 55, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/02', 66, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/02', 63, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/02', 53, 1);
select update_meeting_stats('k.sekiguchi@digital-hacks.com', '2025/07/02', 69, 1);

-- 2025/07/03 -------------------------------------------------------------
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/03', 60, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/03', 33, 1);
select update_meeting_stats('k.ishisone@digital-hacks.com',  '2025/07/03', 50, 1);
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/03', 45, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/03', 20, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/03', 50, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/03', 30, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/03', 55, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/03', 32, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/03', 53, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/03', 32, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/03', 41, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/03', 42, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/03', 46, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/03', 48, 1);
select update_meeting_stats('y.mikami@digital-hacks.com',    '2025/07/03', 45, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/03', 55, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/03', 46, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/03', 58, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/03', 119, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/03', 55, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/03', 62, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/03', 32, 1);

-- 2025/07/04 -------------------------------------------------------------
select update_meeting_stats('k.morishita@digital-hacks.com', '2025/07/04', 60, 1);
select update_meeting_stats('y.hirao@digital-hacks.com',     '2025/07/04', 48, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/04', 44, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/04', 44, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/04', 50, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/04', 52, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/04', 55, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/04', 56, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/04', 63, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/04', 46, 1);
select update_meeting_stats('t.iwatani@digital-hacks.com',   '2025/07/04', 47, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/04', 57, 1);

-- 2025/07/05 -------------------------------------------------------------
select update_meeting_stats('y.mikami@digital-hacks.com',    '2025/07/05', 42, 1);
select update_meeting_stats('k.sekiguchi@digital-hacks.com', '2025/07/05', 38, 1);
select update_meeting_stats('k.ishisone@digital-hacks.com',  '2025/07/05', 55, 1);
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/05', 56, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/05', 21, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/05', 58, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/05', 29, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/05', 60, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/05', 50, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/05', 45, 1);
select update_meeting_stats('k.minato@digital-hacks.com',    '2025/07/05', 60, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/05', 20, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/05', 29, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/05', 28, 1);
select update_meeting_stats('k.ishisone@digital-hacks.com',  '2025/07/05', 81, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/05', 73, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/05', 45, 1);

-- 2025/07/06 -------------------------------------------------------------
select update_meeting_stats('y.hirao@digital-hacks.com',     '2025/07/06', 69, 1);
select update_meeting_stats('k.sekiguchi@digital-hacks.com', '2025/07/06', 53, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/06', 50, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/06', 48, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/06', 39, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/06', 52, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/06', 60, 1);
select update_meeting_stats('k.ishisone@digital-hacks.com',  '2025/07/06', 47, 1);
select update_meeting_stats('y.hirao@digital-hacks.com',     '2025/07/06', 52, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/06', 14, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/06', 40, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/06', 43, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/06', 64, 1);
select update_meeting_stats('k.ishisone@digital-hacks.com',  '2025/07/06', 68, 1);
select update_meeting_stats('s.hayama@digital-hacks.com',    '2025/07/06', 53, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/06', 33, 1);

-- 2025/07/07 -------------------------------------------------------------
select update_meeting_stats('y.mikami@digital-hacks.com',    '2025/07/07', 28, 1);
select update_meeting_stats('k.morishita@digital-hacks.com', '2025/07/07', 51, 1);
select update_meeting_stats('k.morishita@digital-hacks.com', '2025/07/07', 45, 1);
select update_meeting_stats('m.masuko@digital-hacks.com',    '2025/07/07', 71, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/07', 31, 1);
select update_meeting_stats('k.morishita@digital-hacks.com', '2025/07/07', 59, 1);
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/07', 57, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/07', 55, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/07', 10, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/07', 61, 1);
select update_meeting_stats('y.mikami@digital-hacks.com',    '2025/07/07', 89, 1);
select update_meeting_stats('y.nishimoto@digital-hacks.com', '2025/07/07', 36, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/07', 27, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/07', 70, 1);
select update_meeting_stats('k.morishita@digital-hacks.com', '2025/07/07', 77, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/07', 50, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/07', 41, 1);
select update_meeting_stats('k.yanaidani@digital-hacks.com', '2025/07/07', 66, 1);
select update_meeting_stats('k.nasu@digital-hacks.com',      '2025/07/07', 46, 1);
select update_meeting_stats('h.wanita@digital-hacks.com',    '2025/07/07', 46, 1);

commit; 