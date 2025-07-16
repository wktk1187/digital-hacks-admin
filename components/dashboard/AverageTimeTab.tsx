"use client";

import React from 'react';
import { Clock, Users } from 'lucide-react';
import { MeetingData } from '@/types/dashboard';

interface AverageTimeTabProps {
  meetingData: MeetingData;
  currentDate: Date;
}

const AvgTimeCard = ({ 
  title, 
  avgMinutes, 
  color 
}: { 
  title: string; 
  avgMinutes: number; 
  color: string; 
}) => (
  <div className="bg-white rounded-lg border p-3">
    <h3 className={`text-sm font-medium mb-2 ${color}`}>{title}</h3>
    <div className="text-center">
      <div className="text-xl font-bold text-gray-800">{avgMinutes}</div>
      <div className="text-xs text-gray-600">分</div>
    </div>
  </div>
);

export default function AverageTimeTab({ meetingData, currentDate }: AverageTimeTabProps) {
  // 全体平均時間を計算（講師面談と受講開始面談を合わせた累計）
  const calculateOverallAverage = () => {
    const teacherTotalMinutes = meetingData.teacherStats.reduce((sum, teacher) => 
      sum + (teacher.avgMinutes.teacher.total * teacher.teacher.total), 0);
    const teacherTotalCount = meetingData.teacherStats.reduce((sum, teacher) => 
      sum + teacher.teacher.total, 0);
    
    const entryTotalMinutes = meetingData.teacherStats.reduce((sum, teacher) => 
      sum + (teacher.avgMinutes.entry.total * teacher.entry.total), 0);
    const entryTotalCount = meetingData.teacherStats.reduce((sum, teacher) => 
      sum + teacher.entry.total, 0);
    
    const totalMinutes = teacherTotalMinutes + entryTotalMinutes;
    const totalCount = teacherTotalCount + entryTotalCount;
    
    return totalCount > 0 ? Math.round((totalMinutes / totalCount) * 10) / 10 : 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          平均面談時間 (分)
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</span>
        </div>
      </div>

      {/* 全体平均 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">全体平均</h3>
        <div className="w-48">
          <AvgTimeCard 
            title="全面談（累計）" 
            avgMinutes={calculateOverallAverage()}
            color="text-purple-600"
          />
        </div>
      </div>

      {/* 講師別平均 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Users className="w-4 h-4 mr-1" />
          講師別平均
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {meetingData.teacherStats.map((teacher, index) => {
            // 講師ごとの全面談平均時間を計算
            const teacherTotalMinutes = (teacher.avgMinutes.teacher.total * teacher.teacher.total) + 
                                       (teacher.avgMinutes.entry.total * teacher.entry.total);
            const teacherTotalCount = teacher.teacher.total + teacher.entry.total;
            const teacherOverallAvg = teacherTotalCount > 0 ? 
              Math.round((teacherTotalMinutes / teacherTotalCount) * 10) / 10 : 0;

            return (
              <div key={teacher.id} className="bg-white rounded-lg border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-sm">{teacher.name}</h4>
                </div>
                
                <AvgTimeCard 
                  title="全面談（累計）" 
                  avgMinutes={teacherOverallAvg}
                  color="text-purple-600"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 