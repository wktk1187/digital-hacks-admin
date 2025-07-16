"use client";

import React, { useState } from 'react';
import { Users, Plus, Trash2, BarChart2 } from 'lucide-react';
import EditableCell from './EditableCell';
import { TeacherStats as TeacherStatsType, CategoryStats } from '@/types/dashboard';
import AddTeacherModal from './AddTeacherModal';
import DeleteTeacherModal from './DeleteTeacherModal';

interface TeacherStatsProps {
  teacherStats: TeacherStatsType[];
  onUpdateTeacher: (teacherId: string, category: 'teacher' | 'entry', field: keyof CategoryStats, value: number) => void;
  onAddTeacher: (teacher: TeacherStatsType) => void;
  onDeleteTeacher: (teacherId: string) => void;
}

const TeacherMetricCard = ({ 
  label, 
  value, 
  color, 
  onUpdate 
}: { 
  label: string; 
  value: number; 
  color: string; 
  onUpdate: (v: number) => void; 
}) => (
  <div className="bg-gray-50 rounded p-2 text-center">
    <div className={`text-lg ${color}`}>
      <EditableCell value={value} onSave={onUpdate} />
    </div>
    <div className="text-xs text-gray-600">{label}</div>
  </div>
);

export default function TeacherStats({ 
  teacherStats, 
  onUpdateTeacher, 
  onAddTeacher,
  onDeleteTeacher 
}: TeacherStatsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherStatsType | null>(null);

  const handleAddTeacher = () => {
    setShowAdd(true);
  };

  const handleDeleteTeacherClick = (teacher: TeacherStatsType) => {
    setTeacherToDelete(teacher);
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
                  onClick={() => handleDeleteTeacherClick(teacher)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                  title="講師を削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {/* 講師面談 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">講師面談</h4>
                <div className="grid grid-cols-4 gap-2">
                  <TeacherMetricCard 
                    label="本日" 
                    value={teacher.teacher.daily} 
                    color="text-blue-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'teacher', 'daily', v)}
                  />
                  <TeacherMetricCard 
                    label="今月" 
                    value={teacher.teacher.monthly} 
                    color="text-green-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'teacher', 'monthly', v)}
                  />
                  <TeacherMetricCard 
                    label="今年" 
                    value={teacher.teacher.yearly} 
                    color="text-purple-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'teacher', 'yearly', v)}
                  />
                  <TeacherMetricCard 
                    label="累計" 
                    value={teacher.teacher.total} 
                    color="text-orange-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'teacher', 'total', v)}
                  />
                </div>
              </div>

              {/* 受講開始面談 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">受講開始面談</h4>
                <div className="grid grid-cols-4 gap-2">
                  <TeacherMetricCard 
                    label="本日" 
                    value={teacher.entry.daily} 
                    color="text-blue-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'entry', 'daily', v)}
                  />
                  <TeacherMetricCard 
                    label="今月" 
                    value={teacher.entry.monthly} 
                    color="text-green-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'entry', 'monthly', v)}
                  />
                  <TeacherMetricCard 
                    label="今年" 
                    value={teacher.entry.yearly} 
                    color="text-purple-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'entry', 'yearly', v)}
                  />
                  <TeacherMetricCard 
                    label="累計" 
                    value={teacher.entry.total} 
                    color="text-orange-600"
                    onUpdate={(v) => onUpdateTeacher(teacher.id, 'entry', 'total', v)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AddTeacherModal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={(t) => {
          onAddTeacher(t);
          setShowAdd(false);
        }}
      />

      {/* 削除確認モーダル */}
      <DeleteTeacherModal
        isOpen={teacherToDelete !== null}
        teacherName={teacherToDelete?.name ?? ''}
        onCancel={() => setTeacherToDelete(null)}
        onConfirm={() => {
          if (teacherToDelete) {
            onDeleteTeacher(teacherToDelete.id);
          }
          setTeacherToDelete(null);
        }}
      />
    </>
  );
}