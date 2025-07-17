export const getTeachers = async () => {
  const res = await fetch('/api/teachers');
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
};

export const addTeacherApi = async (teacher: any) => {
  await fetch('/api/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teacher),
  });
};

export const deleteTeacherApi = async (teacherId: string) => {
  const res = await fetch(`/api/teachers/${encodeURIComponent(teacherId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    let msg = '講師の削除に失敗しました';
    try {
      const data = await res.json();
      msg = data?.error?.message ?? msg;
    } catch (_) {}
    throw new Error(msg);
  }
};

export const getAllStats = async (category: string = 'teacher') => {
  const res = await fetch(`/api/meeting-stats?category=${encodeURIComponent(category)}`);
  return res.json();
};

export const getTeacherStats = async (email: string, category: string = 'teacher') => {
  const res = await fetch(`/api/meeting-stats?email=${encodeURIComponent(email)}&category=${encodeURIComponent(category)}`);
  return res.json();
};

export const loginApi = async (email: string, password: string) => {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

// 検索: メールアドレスまたは顧客名で面談回数を取得
export const searchMeetingCount = async (query: string) => {
  const res = await fetch(`/api/meeting-count?query=${encodeURIComponent(query)}`);
  return res.json();
};

// 両カテゴリを並列取得し、CategoryStats 形式で返す
export const getAllStatsWithCategories = async () => {
  const [teacherRes, entryRes] = await Promise.all([
    fetch('/api/meeting-stats?category=teacher'),
    fetch('/api/meeting-stats?category=entry')
  ]);
  
  const teacher = await teacherRes.json();
  const entry = await entryRes.json();
  
  return {
    teacher: {
      daily: teacher.day_total || 0,
      monthly: teacher.month_total || 0,
      yearly: teacher.year_total || 0,
      total: teacher.total_all || 0  // 後で API 側で実装
    },
    entry: {
      daily: entry.day_total || 0,
      monthly: entry.month_total || 0,
      yearly: entry.year_total || 0,
      total: entry.total_all || 0
    }
  };
};

// 講師別統計を両カテゴリで取得
export const getTeacherStatsWithCategories = async (email: string) => {
  const [teacherRes, entryRes] = await Promise.all([
    fetch(`/api/meeting-stats?email=${encodeURIComponent(email)}&category=teacher`),
    fetch(`/api/meeting-stats?email=${encodeURIComponent(email)}&category=entry`)
  ]);
  
  const teacher = await teacherRes.json();
  const entry = await entryRes.json();
  
  return {
    teacher: {
      daily: teacher.day_total || 0,
      monthly: teacher.month_total || 0,
      yearly: teacher.year_total || 0,
      total: teacher.total_all || 0
    },
    entry: {
      daily: entry.day_total || 0,
      monthly: entry.month_total || 0,
      yearly: entry.year_total || 0,
      total: entry.total_all || 0
    },
    avgMinutes: {
      teacher: {
        daily: teacher.avg_minutes || 0,
        monthly: teacher.avg_minutes_month || 0,
        yearly: teacher.avg_minutes_year || 0,
        total: teacher.avg_minutes_total || 0
      },
      entry: {
        daily: entry.avg_minutes || 0,
        monthly: entry.avg_minutes_month || 0,
        yearly: entry.avg_minutes_year || 0,
        total: entry.avg_minutes_total || 0
      }
    }
  };
};

// 面談履歴を取得
export const getMeetingHistory = async (params?: {
  startDate?: string;
  endDate?: string;
  organizerEmail?: string;
  attendeeName?: string;
  category?: string;
  page?: number;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.append('startDate', params.startDate);
  if (params?.endDate) searchParams.append('endDate', params.endDate);
  if (params?.organizerEmail) searchParams.append('organizerEmail', params.organizerEmail);
  if (params?.attendeeName) searchParams.append('attendeeName', params.attendeeName);
  if (params?.category) searchParams.append('category', params.category);
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  
  const res = await fetch(`/api/meeting-history?${searchParams}`);
  return res.json();
}; 