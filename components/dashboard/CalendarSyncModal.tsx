"use client";

import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalendarSyncModal({ isOpen, onClose }: CalendarSyncModalProps) {
  const [syncType, setSyncType] = useState<'daily' | 'bulk'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: syncType,
          startDate: syncType === 'bulk' ? startDate : undefined,
          endDate: syncType === 'bulk' ? endDate : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setSyncType('daily');
    setStartDate('');
    setEndDate('');
    setResult(null);
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Google Calendar 同期
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 同期タイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              同期タイプ
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="daily"
                  checked={syncType === 'daily'}
                  onChange={(e) => setSyncType(e.target.value as 'daily')}
                  className="mr-2"
                />
                本日分の同期
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="bulk"
                  checked={syncType === 'bulk'}
                  onChange={(e) => setSyncType(e.target.value as 'bulk')}
                  className="mr-2"
                />
                期間指定同期
              </label>
            </div>
          </div>

          {/* 期間指定（bulkの場合のみ） */}
          {syncType === 'bulk' && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* 結果表示 */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-700">同期完了</span>
              </div>
              <div className="text-sm text-green-600 space-y-1">
                <div>総イベント数: {result.totalEvents}</div>
                <div>成功: {result.successCount}</div>
                <div>エラー: {result.errorCount}</div>
              </div>
            </div>
          )}

          {/* 実行ボタン */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSync}
              disabled={isLoading || (syncType === 'bulk' && (!startDate || !endDate))}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
            >
              {isLoading && <Clock className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? '同期中...' : '同期実行'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 