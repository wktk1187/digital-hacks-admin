"use client";

import React from 'react';
import { Calendar } from 'lucide-react';
import EditableCell from './EditableCell';
import { MeetingData, CategoryStats } from '@/types/dashboard';

interface StatsCardProps {
  meetingData: MeetingData;
  currentDate: Date;
  onUpdateStats: (category: 'teacher' | 'entry', field: keyof CategoryStats, value: number) => void;
}

const MetricCard = ({ 
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
  <div className="text-center p-4 bg-gray-50 rounded-lg">
    <div className={`text-2xl ${color}`}>
      <EditableCell value={value} onSave={onUpdate} />
    </div>
    <div className="text-sm text-gray-600 mt-1">{label}</div>
  </div>
);

export default function StatsCard({ meetingData, currentDate, onUpdateStats }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">面談統計</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* 講師面談 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">講師面談</h3>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard 
              label="本日" 
              value={meetingData.teacher.daily} 
              color="text-blue-600"
              onUpdate={(v) => onUpdateStats('teacher', 'daily', v)}
            />
            <MetricCard 
              label="今月" 
              value={meetingData.teacher.monthly} 
              color="text-green-600"
              onUpdate={(v) => onUpdateStats('teacher', 'monthly', v)}
            />
            <MetricCard 
              label="今年" 
              value={meetingData.teacher.yearly} 
              color="text-purple-600"
              onUpdate={(v) => onUpdateStats('teacher', 'yearly', v)}
            />
            <MetricCard 
              label="累計" 
              value={meetingData.teacher.total} 
              color="text-orange-600"
              onUpdate={(v) => onUpdateStats('teacher', 'total', v)}
            />
          </div>
        </div>

        {/* 受講開始面談 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">受講開始面談</h3>
          <div className="grid grid-cols-4 gap-4">
            <MetricCard 
              label="本日" 
              value={meetingData.entry.daily} 
              color="text-blue-600"
              onUpdate={(v) => onUpdateStats('entry', 'daily', v)}
            />
            <MetricCard 
              label="今月" 
              value={meetingData.entry.monthly} 
              color="text-green-600"
              onUpdate={(v) => onUpdateStats('entry', 'monthly', v)}
            />
            <MetricCard 
              label="今年" 
              value={meetingData.entry.yearly} 
              color="text-purple-600"
              onUpdate={(v) => onUpdateStats('entry', 'yearly', v)}
            />
            <MetricCard 
              label="累計" 
              value={meetingData.entry.total} 
              color="text-orange-600"
              onUpdate={(v) => onUpdateStats('entry', 'total', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}