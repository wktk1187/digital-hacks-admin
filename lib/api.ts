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