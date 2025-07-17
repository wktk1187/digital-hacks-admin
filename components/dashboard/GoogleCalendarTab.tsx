"use client";

import React from 'react';
import { Calendar } from 'lucide-react';

export default function GoogleCalendarTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Googleカレンダー
        </h2>
        <div className="flex gap-2">
          <a
            href="https://calendar.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新しいタブで開く
          </a>
        </div>
      </div>

      {/* カレンダー埋め込み */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <iframe 
          src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FTokyo&showPrint=0&src=aW5mb0BkaWdpdGFsLWhhY2tzLmNvbQ&color=%23039be5" 
          style={{ border: "solid 1px #777" }} 
          width="100%" 
          height="600" 
          frameBorder="0" 
          scrolling="no"
          title="Google Calendar"
          className="w-full"
        />
      </div>

      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">📅 カレンダー機能:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>面談予定の確認・編集</li>
          <li>新しい面談の予約</li>
          <li>参加者への通知送信</li>
          <li>会議室の予約状況確認</li>
        </ul>
      </div>
    </div>
  );
} 