"use client";

import React from 'react';
import { Users, Plus, Trash2, BarChart2 } from 'lucide-react';
import EditableCell from './EditableCell';
import { TeacherStats as TeacherStatsType, MeetingData } from '@/types/dashboard';

interface TeacherStatsProps {
  teacherStats: TeacherStatsType[];
  onUpdateTeacher: (teacherId: string, field: keyof TeacherStatsType, value: number) => void;
  onAddTeacher: (teacher: TeacherStatsType) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

export default function TeacherStats({ 
  teacherStats, 
  onUpdateTeacher, 
  onAddTeacher,
  onDeleteTeacher 
}: TeacherStatsProps) {
  const handleAddTeacher = () => {
    const input = prompt('追加する講師を「メールアドレス,名前」の形式で入力してください\n例: teacher@example.com,山田太郎');
    if (!input) return;
    const [emailRaw, nameRaw] = input.split(',');
    const email = emailRaw?.trim();
    const name = nameRaw?.trim();
    if (!email || !name) {
      alert('入力形式が正しくありません。メールアドレスと名前をカンマ区切りで入力してください。');
      return;
    }
    const newTeacher: TeacherStatsType = {
      id: email,
      name,
      dailyCount: 0,
      monthlyCount: 0,
      yearlyCount: 0,
      avgMinutes: 0
    };
    onAddTeacher(newTeacher);
  };

  const handleDeleteTeacher = (teacher: TeacherStatsType) => {
    if (confirm(`${teacher.name}を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      onDeleteTeacher(teacher.id);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <Users className="w-6 h-6 mr-2" />
          講師別面談数
        </h2>
        <button
          onClick={handleAddTeacher}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          講師を追加
        </button>
      </div>
      
      <div className="space-y-4">
        {teacherStats.map((teacher, index) => (
          <div key={teacher.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="font-medium text-lg">{teacher.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-gray-400" />
                <button
                  onClick={() => handleDeleteTeacher(teacher)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                  title="講師を削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded p-3">
                <div className="text-2xl text-blue-600">
                  <EditableCell
                    value={teacher.dailyCount}
                    onSave={(v) => onUpdateTeacher(teacher.id, 'dailyCount', v)}
                  />
                </div>
                <div className="text-xs text-gray-600">本日</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-2xl text-green-600">
                  <EditableCell
                    value={teacher.monthlyCount}
                    onSave={(v) => onUpdateTeacher(teacher.id, 'monthlyCount', v)}
                  />
                </div>
                <div className="text-xs text-gray-600">今月</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-2xl text-purple-600">
                  <EditableCell
                    value={teacher.yearlyCount}
                    onSave={(v) => onUpdateTeacher(teacher.id, 'yearlyCount', v)}
                  />
                </div>
                <div className="text-xs text-gray-600">今年</div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-2xl text-orange-600">
                  <EditableCell
                    value={teacher.avgMinutes}
                    onSave={(v) => onUpdateTeacher(teacher.id, 'avgMinutes', v)}
                  />
                </div>
                <div className="text-xs text-gray-600">平均時間 (分)</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}