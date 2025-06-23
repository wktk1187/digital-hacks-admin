"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EditableCell from './EditableCell';
import { DayData } from '@/types/dashboard';

interface MonthlyCalendarProps {
  calendarData: DayData[];
  currentDate: Date;
  onChangeMonth: (increment: number) => void;
  onUpdateDay: (index: number, count: number) => void;
}

export default function MonthlyCalendar({ 
  calendarData, 
  currentDate, 
  onChangeMonth, 
  onUpdateDay 
}: MonthlyCalendarProps) {
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onChangeMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
        </h2>
        <button
          onClick={() => onChangeMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div key={day} className="text-center py-2 text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
        
        {calendarData.map((day, index) => (
          <div
            key={index}
            className={`
              aspect-square p-2 border rounded-lg relative
              ${day.date === 0 ? 'invisible' : ''}
              ${day.hasData ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
              ${day.date === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear() 
                ? 'ring-2 ring-blue-500' : ''}
              hover:shadow-md transition-shadow
            `}
          >
            {day.date > 0 && (
              <>
                <div className="text-sm font-medium mb-1">{day.date}</div>
                <div className="absolute bottom-1 right-1 left-1">
                  <EditableCell
                    value={day.count}
                    onSave={(v) => onUpdateDay(index, v)}
                    className="text-xs text-blue-600 justify-center"
                    suffix="件"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}