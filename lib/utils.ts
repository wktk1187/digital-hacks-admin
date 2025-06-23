import { DayData } from '@/types/dashboard';

export function generateCalendarData(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const calendarData: DayData[] = [];
  
  // 前月の空白日
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarData.push({ date: 0, count: 0, hasData: false });
  }
  
  // 当月の日付
  for (let i = 1; i <= daysInMonth; i++) {
    calendarData.push({
      date: i,
      count: 0,
      hasData: false
    });
  }
  
  return calendarData;
}

export function getInitialTeachers() {
  return [
    { id: 's.hayama@digital-hacks.com', name: '羽山さつき' },
    { id: 'info@digital-hacks.com', name: 'デジハクサポートチーム' },
    { id: 'y.hirao@digital-hacks.com', name: '平尾友里香' },
    { id: 'y.nishimoto@digital-hacks.com', name: '西本吉孝' },
    { id: 'k.nasu@digital-hacks.com', name: '那須和明' },
    { id: 'k.sekiguchi@digital-hacks.com', name: '関口幸平' },
    { id: 'k.morishita@digital-hacks.com', name: '森下幸貴' },
    { id: 'y.okamoto@digital-hacks.com', name: '岡本庸祐' },
    { id: 'k.ishisone@digital-hacks.com', name: '石曾根昂平' },
    { id: 'k.minato@digital-hacks.com', name: '湊昂輔' },
    { id: 't.iwatani@digital-hacks.com', name: '岩谷毅志' },
    { id: 'k.yanaidani@digital-hacks.com', name: '柳井谷浩太' },
    { id: 'm.masuko@digital-hacks.com', name: '増子真也子' },
    { id: 'm.yamaguchi@digital-hacks.com', name: '山口美紗子' },
    { id: 'y.mikami@digital-hacks.com', name: '三上裕太' },
    { id: 't.ueyama@digital-hacks.com', name: '植山透' },
    { id: 'h.wanita@digital-hacks.com', name: '鰐田鵬文' },
    { id: 's.kasugai@digital-hacks.com', name: '春日井爽太' }
  ];
}