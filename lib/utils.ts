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

export function formatDateLocalYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 既存の静的講師リストは不要になったため削除 (Supabase から取得するよう移行)

// フォールバック用のスタブ (オンライン時は Supabase から取得)
export function getInitialTeachers() {
  return [];
}