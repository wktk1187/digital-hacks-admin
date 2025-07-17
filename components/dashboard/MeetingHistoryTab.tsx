"use client";

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Mail, 
  FileText, 
  Video, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
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
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'teacher' | 'entry'>('all');

  // 講師リスト
  const teachers = [
    { email: 's.hayama@digital-hacks.com', name: '羽山さつき' },
    { email: 'info@digital-hacks.com', name: 'デジハクサポートチーム' },
    { email: 'y.hirao@digital-hacks.com', name: '平尾友里香' },
    { email: 'y.nishimoto@digital-hacks.com', name: '西本吉孝' },
    { email: 'k.nasu@digital-hacks.com', name: '那須和明' },
    { email: 'k.sekiguchi@digital-hacks.com', name: '関口幸平' },
    { email: 'k.morishita@digital-hacks.com', name: '森下幸貴' },
    { email: 'y.okamoto@digital-hacks.com', name: '岡本庸祐' },
    { email: 'k.ishisone@digital-hacks.com', name: '石曾根昂平' },
    { email: 'k.minato@digital-hacks.com', name: '湊昂輔' },
    { email: 't.iwatani@digital-hacks.com', name: '岩谷毅志' },
    { email: 'k.yanaidani@digital-hacks.com', name: '柳井谷浩太' },
    { email: 'm.masuko@digital-hacks.com', name: '増子真也子' },
    { email: 'm.yamaguchi@digital-hacks.com', name: '山口美紗子' },
    { email: 'y.mikami@digital-hacks.com', name: '三上裕太' },
    { email: 't.ueyama@digital-hacks.com', name: '植山透' },
    { email: 'h.wanita@digital-hacks.com', name: '鰐田鵬文' },
    { email: 's.kasugai@digital-hacks.com', name: '春日井爽太' },
    { email: 'r.arai@digital-hacks.com', name: '新井玲央奈' }
  ];

  // 初期日付設定（過去30日間）
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // 外部クリックでドロップダウンを閉じる（ヘッダーセクション用）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // ヘッダーのドロップダウンメニューがある場合の処理
      const dropdownMenus = document.querySelectorAll('.dropdown-menu');
      dropdownMenus.forEach(menu => {
        if (!menu.contains(target) && !target.closest('.dropdown-trigger')) {
          menu.classList.add('hidden');
        }
      });
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
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
  }, [startDate, endDate, organizerEmail, categoryFilter]);

  // ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMeetingHistory(page);
  };

  // 講師フィルタークリア
  const clearTeacherFilter = () => {
    setOrganizerEmail('');
  };

  // 選択された講師の名前を取得
  const getSelectedTeacherName = () => {
    if (!organizerEmail) return '';
    const teacher = teachers.find(t => t.email === organizerEmail);
    return teacher ? teacher.name : organizerEmail;
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
      <div className="bg-white rounded-lg border p-6 space-y-6">
        {/* 詳細フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 開始日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">開始日</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 終了日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">終了日</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* カテゴリフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
            >
              <option value="all">すべて</option>
              <option value="teacher">講師面談</option>
              <option value="entry">受講開始面談</option>
            </select>
          </div>

          {/* 講師選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">講師</label>
            <select
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
            >
              <option value="">すべての講師</option>
              {teachers.map((teacher) => (
                <option key={teacher.email} value={teacher.email}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* アクティブフィルター表示 */}
        {(organizerEmail || categoryFilter !== 'all') && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-gray-600">アクティブフィルター:</span>
            {organizerEmail && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                講師: {getSelectedTeacherName()}
                <button
                  onClick={clearTeacherFilter}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                カテゴリ: {categoryFilter === 'teacher' ? '講師面談' : '受講開始面談'}
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
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
                      講師
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      日時
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      面談時間
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ドキュメント
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      動画
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
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-sm font-medium">{meeting.organizerEmail}</span>
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
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-sm text-gray-600">予定: {meeting.duration}分</span>
                            </div>
                            {meeting.actualDuration && (
                              <div className="flex items-center">
                                <Video className="w-4 h-4 mr-1 text-green-600" />
                                <span className="text-sm font-medium text-green-700">実際: {meeting.actualDuration}分</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {meeting.documentUrls.length > 0 ? (
                              meeting.documentUrls.map((url, index) => (
                                <div key={index} className="flex items-center">
                                  <FileText className="w-4 h-4 text-blue-600 mr-1" />
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    ドキュメント{index + 1}
                                  </a>
                                  <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">なし</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {meeting.videoUrls.length > 0 ? (
                              meeting.videoUrls.map((url, index) => (
                                <div key={index} className="flex items-center">
                                  <Video className="w-4 h-4 text-red-600 mr-1" />
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-red-600 hover:text-red-800 hover:underline"
                                  >
                                    動画{index + 1}
                                  </a>
                                  <ExternalLink className="w-3 h-3 ml-1 text-gray-400" />
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400">なし</span>
                            )}
                          </div>
                        </td>
                      </tr>
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