"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Save } from 'lucide-react';
import { SettingsData } from '@/types/dashboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsData;
  onSave: (settings: SettingsData) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">設定</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              通知設定
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.emailNotifications}
                  onChange={(e) => setLocalSettings({...localSettings, emailNotifications: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">メール通知を受け取る</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.dailyReport}
                  onChange={(e) => setLocalSettings({...localSettings, dailyReport: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">日次レポートを受け取る</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.weeklyReport}
                  onChange={(e) => setLocalSettings({...localSettings, weeklyReport: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm">週次レポートを受け取る</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Save className="w-4 h-4" />
              データ設定
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoSave}
                onChange={(e) => setLocalSettings({...localSettings, autoSave: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm">変更を自動保存する</span>
            </label>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}