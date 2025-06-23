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
  await fetch(`/api/teachers/${encodeURIComponent(teacherId)}`, {
    method: 'DELETE',
  });
};

export const getAllStats = async () => {
  const res = await fetch('/api/meeting-stats');
  return res.json();
};

export const getTeacherStats = async (email: string) => {
  const res = await fetch(`/api/meeting-stats?email=${encodeURIComponent(email)}`);
  return res.json();
}; 