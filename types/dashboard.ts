export interface DayData {
    date: number;
    count: number;
    hasData: boolean;
  }
  
  export interface CategoryStats {
    daily: number;    // 本日
    monthly: number;  // 今月
    yearly: number;   // 今年
    total: number;    // 累計（全期間）
  }
  
  export interface TeacherStats {
    id: string;
    name: string;
    teacher: CategoryStats;  // 講師面談
    entry: CategoryStats;    // 受講開始面談
    avgMinutes: {
      teacher: CategoryStats;  // 講師面談の平均時間
      entry: CategoryStats;    // 受講開始面談の平均時間
    };
  }
  
  export interface MeetingData {
    teacher: CategoryStats;   // 講師面談
    entry: CategoryStats;     // 受講開始面談
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
  
  export type TabType = 'month' | 'teacher' | 'average' | 'spreadsheet';