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

export const getAllStats = async () => {
  const res = await fetch('/api/meeting-stats');
  return res.json();
};

export const getTeacherStats = async (email: string) => {
  const res = await fetch(`/api/meeting-stats?email=${encodeURIComponent(email)}`);
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