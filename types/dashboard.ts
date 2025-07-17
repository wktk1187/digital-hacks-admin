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

  export interface MeetingHistoryItem {
    id: string;
    title: string;
    category: '講師面談' | '受講開始面談';
    organizerEmail: string;
    attendeeName: string;
    attendeeEmail: string;
    startTime: string;
    endTime: string;
    duration: number;
    date: string;
    time: string;
    description: string;
    location: string;
    documentUrls: string[];
    videoUrls: string[];
    meetLink: string;
    calendarEventUrl: string;
  }

  export interface MeetingHistoryResponse {
    success: boolean;
    data: MeetingHistoryItem[];
    message?: string;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
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
  
  export type TabType = 'month' | 'teacher' | 'average' | 'history' | 'spreadsheet';