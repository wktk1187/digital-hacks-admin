"use client";

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  FileText, 
  Video, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MeetingHistoryItem, MeetingHistoryResponse } from '@/types/dashboard';

interface MeetingHistoryTabProps {
  currentDate: Date;
}

export default function MeetingHistoryTab({ currentDate }: MeetingHistoryTabProps) {
  const [meetings, setMeetings] = useState<MeetingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  
  // フィルター状態
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'teacher' | 'entry'>('all');
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 初期日付設定（過去30日間）
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // データ取得
  const fetchMeetingHistory = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '25');
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (organizerEmail) params.append('organizerEmail', organizerEmail);
      if (attendeeName) params.append('attendeeName', attendeeName);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      
      const response = await fetch(`/api/meeting-history?${params}`);
      const data: MeetingHistoryResponse = await response.json();
      
      if (data.success) {
        setMeetings(data.data);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
        setHasNextPage(data.pagination.hasNextPage);
        setHasPreviousPage(data.pagination.hasPreviousPage);
      } else {
        setError(data.message || 'データの取得に失敗しました');
      }
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // フィルター変更時にページを1にリセットして検索
  useEffect(() => {
    if (startDate && endDate) {
      setCurrentPage(1);
      fetchMeetingHistory(1);
    }
  }, [startDate, endDate, organizerEmail, attendeeName, categoryFilter]);

  // ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMeetingHistory(page);
  };

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    return category === '講師面談' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  // ページネーションコンポーネント
  const Pagination = () => {
    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisible - 1);
        
        if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push('...');
        }
        
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        if (end < totalPages) {
          if (end < totalPages - 1) pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
        <div className="flex items-center text-sm text-gray-700">
          <span>
            {totalItems === 0 ? '0' : `${(currentPage - 1) * 25 + 1}-${Math.min(currentPage * 25, totalItems)}`} / {totalItems}件
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            前へ
          </button>
          
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 text-sm border rounded ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : page === '...'
                  ? 'cursor-default'
                  : 'hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            次へ
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center">
          <History className="w-5 h-5 mr-2" />
          面談履歴
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>総件数: {totalItems}</span>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 開始日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 終了日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* カテゴリフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべて</option>
              <option value="teacher">講師面談</option>
              <option value="entry">受講開始面談</option>
            </select>
          </div>

          {/* 主催者メール */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">主催者メール</label>
            <input
              type="email"
              placeholder="メールアドレスで検索"
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 予約者名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">予約者名</label>
            <input
              type="text"
              placeholder="予約者名で検索"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 履歴テーブル */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchMeetingHistory(currentPage)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              再試行
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            該当する面談履歴がありません
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      面談情報
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      予約者
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日時
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時間
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ファイル
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      詳細
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meetings.map((meeting) => (
                    <React.Fragment key={meeting.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">{meeting.title}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(meeting.category)}`}>
                              {meeting.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-sm font-medium">{meeting.attendeeName || '未設定'}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-xs text-gray-500">{meeting.organizerEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-sm">{meeting.date}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-xs text-gray-500">{meeting.time}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{meeting.duration}分</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {meeting.documentUrls.length > 0 && (
                              <div className="flex items-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-gray-500 ml-1">{meeting.documentUrls.length}</span>
                              </div>
                            )}
                            {meeting.videoUrls.length > 0 && (
                              <div className="flex items-center">
                                <Video className="w-4 h-4 text-red-600" />
                                <span className="text-xs text-gray-500 ml-1">{meeting.videoUrls.length}</span>
                              </div>
                            )}
                            {meeting.documentUrls.length === 0 && meeting.videoUrls.length === 0 && (
                              <span className="text-xs text-gray-400">なし</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRowExpansion(meeting.id)}
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {expandedRows.has(meeting.id) ? (
                              <>
                                <ChevronUp className="w-4 h-4 mr-1" />
                                閉じる
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 mr-1" />
                                詳細
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                      
                      {/* 展開行 */}
                      {expandedRows.has(meeting.id) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 bg-gray-50">
                            <div className="space-y-3">
                              {/* 説明 */}
                              {meeting.description && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-1">説明</h4>
                                  <p className="text-sm text-gray-600">{meeting.description}</p>
                                </div>
                              )}
                              
                              {/* ファイル */}
                              {(meeting.documentUrls.length > 0 || meeting.videoUrls.length > 0) && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">添付ファイル</h4>
                                  <div className="space-y-2">
                                    {meeting.documentUrls.map((url, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                          ドキュメント {index + 1}
                                          <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                      </div>
                                    ))}
                                    {meeting.videoUrls.map((url, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <Video className="w-4 h-4 text-red-600" />
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                                        >
                                          動画 {index + 1}
                                          <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* リンク */}
                              <div className="flex items-center space-x-4">
                                {meeting.meetLink && (
                                  <a
                                    href={meeting.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                  >
                                    <Video className="w-4 h-4 mr-1" />
                                    Google Meet
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                )}
                                {meeting.calendarEventUrl && (
                                  <a
                                    href={meeting.calendarEventUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                                  >
                                    <Calendar className="w-4 h-4 mr-1" />
                                    カレンダーで開く
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* ページネーション */}
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
} 