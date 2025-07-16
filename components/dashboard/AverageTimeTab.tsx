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
  <div className="bg-white rounded-lg border p-6">
    <h3 className={`text-lg font-semibold mb-3 ${color}`}>{title}</h3>
    <div className="text-center">
      <div className="text-3xl font-bold text-gray-800">{avgMinutes}</div>
      <div className="text-sm text-gray-600">分</div>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Clock className="w-6 h-6 mr-2" />
          平均面談時間 (分)
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</span>
        </div>
      </div>

      {/* 全体平均 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">全体平均</h3>
        <div className="max-w-md mx-auto">
          <AvgTimeCard 
            title="全面談（累計）" 
            avgMinutes={calculateOverallAverage()}
            color="text-purple-600"
          />
        </div>
      </div>

      {/* 講師別平均 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          講師別平均
        </h3>
        <div className="space-y-4">
          {meetingData.teacherStats.map((teacher, index) => {
            // 講師ごとの全面談平均時間を計算
            const teacherTotalMinutes = (teacher.avgMinutes.teacher.total * teacher.teacher.total) + 
                                       (teacher.avgMinutes.entry.total * teacher.entry.total);
            const teacherTotalCount = teacher.teacher.total + teacher.entry.total;
            const teacherOverallAvg = teacherTotalCount > 0 ? 
              Math.round((teacherTotalMinutes / teacherTotalCount) * 10) / 10 : 0;

            return (
              <div key={teacher.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-lg">{teacher.name}</h4>
                </div>
                
                <div className="max-w-md mx-auto">
                  <AvgTimeCard 
                    title="全面談（累計）" 
                    avgMinutes={teacherOverallAvg}
                    color="text-purple-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 