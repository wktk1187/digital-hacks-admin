export interface DayData {
    date: number;
    count: number;
    hasData: boolean;
  }
  
  export interface TeacherStats {
    id: string;
    name: string;
    dailyCount: number;
    monthlyCount: number;
    yearlyCount: number;
    avgMinutes: number;
  }
  
  export interface MeetingData {
    totalDaily: number;
    totalMonthly: number;
    totalYearly: number;
    avgMinutes: number;
    calendarData: DayData[];
    teacherStats: TeacherStats[];
  }
  
  export interface UserData {
    name: string;
    email: string;
    role: 'admin';
  }
  
  export interface SettingsData {
    emailNotifications: boolean;
    dailyReport: boolean;
    weeklyReport: boolean;
    autoSave: boolean;
  }
  
  export interface CalendarDay {
    date: Date;
    count: number;
    hasData: boolean;
  }
  
  export type TabType = 'month' | 'teacher' | 'spreadsheet';