"use client";

import React from 'react';
import { Calendar } from 'lucide-react';
import EditableCell from './EditableCell';
import { MeetingData } from '@/types/dashboard';

interface StatsCardProps {
  meetingData: MeetingData;
  currentDate: Date;
  onUpdateStats: (field: keyof MeetingData, value: number) => void;
}

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
      
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl text-blue-600">
            <EditableCell 
              value={meetingData.totalDaily} 
              onSave={(v) => onUpdateStats('totalDaily', v)}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">本日</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl text-green-600">
            <EditableCell 
              value={meetingData.totalMonthly} 
              onSave={(v) => onUpdateStats('totalMonthly', v)}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">今月</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl text-purple-600">
            <EditableCell 
              value={meetingData.totalYearly} 
              onSave={(v) => onUpdateStats('totalYearly', v)}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">今年</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl text-orange-600">
            <EditableCell 
              value={meetingData.avgMinutes} 
              onSave={(v) => onUpdateStats('avgMinutes', v)}
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">平均時間 (分)</div>
        </div>
      </div>
    </div>
  );
}