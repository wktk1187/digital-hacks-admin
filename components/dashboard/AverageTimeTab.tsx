"use client";

import React from 'react';
import { Clock, Users } from 'lucide-react';
import { MeetingData, CategoryStats } from '@/types/dashboard';

interface AverageTimeTabProps {
  meetingData: MeetingData;
  currentDate: Date;
}

const AvgTimeCard = ({ 
  title, 
  stats, 
  color 
}: { 
  title: string; 
  stats: CategoryStats; 
  color: string; 
}) => (
  <div className="bg-white rounded-lg border p-4">
    <h3 className={`text-lg font-semibold mb-3 ${color}`}>{title}</h3>
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{stats.daily}</div>
        <div className="text-sm text-gray-600">本日</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{stats.monthly}</div>
        <div className="text-sm text-gray-600">今月</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{stats.yearly}</div>
        <div className="text-sm text-gray-600">今年</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
        <div className="text-sm text-gray-600">累計</div>
      </div>
    </div>
  </div>
);

export default function AverageTimeTab({ meetingData, currentDate }: AverageTimeTabProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AvgTimeCard 
            title="講師面談" 
            stats={{
              daily: 0,   // TODO: 実際の平均時間を計算
              monthly: 0,
              yearly: 0,
              total: 0
            }}
            color="text-blue-600"
          />
          <AvgTimeCard 
            title="受講開始面談" 
            stats={{
              daily: 0,
              monthly: 0,
              yearly: 0,
              total: 0
            }}
            color="text-green-600"
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
          {meetingData.teacherStats.map((teacher, index) => (
            <div key={teacher.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h4 className="font-medium text-lg">{teacher.name}</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AvgTimeCard 
                  title="講師面談" 
                  stats={teacher.avgMinutes.teacher}
                  color="text-blue-600"
                />
                <AvgTimeCard 
                  title="受講開始面談" 
                  stats={teacher.avgMinutes.entry}
                  color="text-green-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 