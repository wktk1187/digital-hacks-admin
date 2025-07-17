"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import SettingsModal from "@/components/dashboard/SettingsModal";
import CalendarSyncModal from "@/components/dashboard/CalendarSyncModal";
import StatsCard from "@/components/dashboard/StatsCard";
import MonthlyCalendar from "@/components/dashboard/MonthlyCalendar";
import TeacherStats from "@/components/dashboard/TeacherStats";
import LoginForm from "@/components/auth/LoginForm";
import AverageTimeTab from "@/components/dashboard/AverageTimeTab";
import MeetingHistoryTab from "@/components/dashboard/MeetingHistoryTab";
import GoogleCalendarTab from "@/components/dashboard/GoogleCalendarTab";
import {
  MeetingData,
  SettingsData,
  TeacherStats as TeacherStatsType,
  TabType,
  UserData,
  CategoryStats,
} from "@/types/dashboard";
import { generateCalendarData, getInitialTeachers } from "@/lib/utils";
import {
  addTeacherApi,
  deleteTeacherApi,
  getAllStatsWithCategories,
  getTeacherStatsWithCategories,
  getTeachers,
  loginApi,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import SearchMeeting from "@/components/dashboard/SearchMeeting";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<TabType>("month");
  const [meetingData, setMeetingData] = useState<MeetingData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('dashboardMeetingData');
        if (stored) return JSON.parse(stored) as MeetingData;
      } catch (_) {}
    }
    return null;
  });
  const [loading, setLoading] = useState(meetingData === null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [user, setUser] = useState<UserData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('dashboardUser');
        if (stored) return JSON.parse(stored) as UserData;
      } catch (_) {}
    }
    return null;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    emailNotifications: true,
    dailyReport: true,
    weeklyReport: false,
    autoSave: false,
  });

  const generateSampleData = (): MeetingData => {
    const teachers = getInitialTeachers() as { id: string; name: string }[];
    return {
      teacher: { daily: 0, monthly: 0, yearly: 0, total: 0 },
      entry: { daily: 0, monthly: 0, yearly: 0, total: 0 },
      calendarData: generateCalendarData(
        currentDate.getFullYear(),
        currentDate.getMonth()
      ),
      teacherStats: teachers.map((t) => ({
        id: t.id,
        name: t.name,
        teacher: { daily: 0, monthly: 0, yearly: 0, total: 0 },
        entry: { daily: 0, monthly: 0, yearly: 0, total: 0 },
        avgMinutes: {
          teacher: { daily: 0, monthly: 0, yearly: 0, total: 0 },
          entry: { daily: 0, monthly: 0, yearly: 0, total: 0 }
        }
      })),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // ① 全体統計を取得
        const allStats = await getAllStatsWithCategories();

        // ② 講師リスト Supabase から取得
        const teachers = (await getTeachers()) as { id: string; name: string }[];

        // ③ 当月 day 列を取得してカレンダー用にマップ
        const firstISO = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          .toISOString()
          .slice(0, 10);
        const lastISO = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          .toISOString()
          .slice(0, 10);

        const { data: dayRows } = await supabase
          .from('stats_all_day')
          .select('key_date,total_cnt,category')
          .gte('key_date', firstISO)
          .lte('key_date', lastISO);

        // ④ 講師別統計を並列取得
        const teacherStatsPromises = teachers.map(async (t: { id: string; name: string }) => {
          try {
            const s = await getTeacherStatsWithCategories(t.id);
            return {
              id: t.id,
              name: t.name,
              teacher: s.teacher,
              entry: s.entry,
              avgMinutes: s.avgMinutes
            } as TeacherStatsType;
          } catch (e) {
            // データが無い場合など
            return {
              id: t.id,
              name: t.name,
              teacher: { daily: 0, monthly: 0, yearly: 0, total: 0 },
              entry: { daily: 0, monthly: 0, yearly: 0, total: 0 },
              avgMinutes: {
                teacher: { daily: 0, monthly: 0, yearly: 0, total: 0 },
                entry: { daily: 0, monthly: 0, yearly: 0, total: 0 }
              }
            } as TeacherStatsType;
          }
        });

        const teacherStats = await Promise.all(teacherStatsPromises);

        // カレンダー生成
        const calendar = generateCalendarData(
          currentDate.getFullYear(),
          currentDate.getMonth()
        );

        // dayRows をカレンダーに反映（teacher + entry の合計）
        dayRows?.forEach((r) => {
          const d = new Date(r.key_date);
          const idx = calendar.findIndex((c) => c.date === d.getDate());
          if (idx !== -1) {
            calendar[idx] = {
              ...calendar[idx],
              count: (calendar[idx].count || 0) + r.total_cnt,
              hasData: true,
            };
          }
        });

        const data: MeetingData = {
          teacher: allStats.teacher,
          entry: allStats.entry,
          calendarData: calendar,
          teacherStats,
        };

        setMeetingData(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dashboardMeetingData', JSON.stringify(data));
        }
      } catch (e) {
        console.error(e);
        // フォールバック: サンプルデータ
        setMeetingData(generateSampleData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const saveData = async () => {
    // TODO: API へ POST
    setHasUnsavedChanges(false);
  };

  // 自動保存
  useEffect(() => {
    if (settings.autoSave && hasUnsavedChanges) {
      const t = setTimeout(saveData, 2000);
      return () => clearTimeout(t);
    }
  }, [hasUnsavedChanges, settings.autoSave]);

  /* ---------- ハンドラ ---------- */
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await loginApi(email, password);
      if (!res.ok) return false;
      const u: UserData = { name: res.name ?? '管理者', email: res.email, role: 'admin' };
      setUser(u);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dashboardUser', JSON.stringify(u));
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dashboardUser');
    }
  };

  const updateTotalStats = (category: 'teacher' | 'entry', field: keyof CategoryStats, value: number) => {
    if (!meetingData) return;
    setMeetingData({ 
      ...meetingData, 
      [category]: { ...meetingData[category], [field]: value }
    });
    setHasUnsavedChanges(true);
  };

  const updateCalendarDay = (index: number, count: number) => {
    if (!meetingData) return;
    const newCalendar = [...meetingData.calendarData];
    newCalendar[index] = { ...newCalendar[index], count, hasData: count > 0 };
    setMeetingData({ ...meetingData, calendarData: newCalendar });
    setHasUnsavedChanges(true);
  };

  const updateTeacherStats = (
    teacherId: string,
    category: 'teacher' | 'entry',
    field: keyof CategoryStats,
    value: number
  ) => {
    if (!meetingData) return;
    const updated = meetingData.teacherStats.map((t) =>
      t.id === teacherId ? { 
        ...t, 
        [category]: { ...t[category], [field]: value }
      } : t
    );
    setMeetingData({ ...meetingData, teacherStats: updated });
    setHasUnsavedChanges(true);
  };

  const addTeacher = (teacher: TeacherStatsType) => {
    if (!meetingData) return;
    setMeetingData({
      ...meetingData,
      teacherStats: [...meetingData.teacherStats, teacher],
    });
    setHasUnsavedChanges(true);
    addTeacherApi(teacher).catch(console.error);
  };

  const deleteTeacher = async (teacherId: string) => {
    if (!meetingData) return;
    try {
      await deleteTeacherApi(teacherId);
      // 成功した場合のみローカル状態から除去
      setMeetingData({
        ...meetingData,
        teacherStats: meetingData.teacherStats.filter((t) => t.id !== teacherId),
      });
      setHasUnsavedChanges(true);
    } catch (e: any) {
      alert(e.message ?? '削除に失敗しました');
    }
  };

  const changeMonth = (inc: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + inc);
      return d;
    });
  };

  useEffect(() => {
    // Supabase Realtime subscription: stats_all_day 更新
    const channel = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stats_all_day' },
        (payload) => {
          const r: any = payload.new;
          // r.key_date は YYYY-MM-DD
          const d = new Date(r.key_date);
          // 月・年は別トリガーで更新されるので fetchData で再取得
          if (
            d.getFullYear() === currentDate.getFullYear() &&
            d.getMonth()    === currentDate.getMonth()
          ) {
            const idx = meetingData?.calendarData.findIndex((c) => c.date === d.getDate());
            if (idx !== undefined && idx !== -1) updateCalendarDay(idx, r.total_cnt);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stats_teacher_day' },
        (payload) => {
          const r: any = payload.new;
          // TODO: category に応じて更新
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 日付ロールオーバー監視: 1 分ごとに日付が変わったら currentDate を更新
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.toDateString() !== currentDate.toDateString()) {
        setCurrentDate(now);
      }
    }, 60_000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  /* ---------- レンダリング ---------- */
  if (!user) return <LoginForm onLogin={handleLogin} />;
  if (!meetingData) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onSettingsClick={() => setShowSettings(true)}
        onSyncClick={() => setShowSyncModal(true)}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />
      <CalendarSyncModal
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />

      <div className="max-w-6xl mx-auto p-4">
        <StatsCard
          meetingData={meetingData}
          currentDate={currentDate}
          onUpdateStats={updateTotalStats}
        />

        {/* タブ切替 */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === "month"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTab("month")}
          >
            月別カレンダー
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === "teacher"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTab("teacher")}
          >
            講師別統計
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === "average"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTab("average")}
          >
            平均時間
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === "history"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTab("history")}
          >
            面談履歴
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === "googleCalendar"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTab("googleCalendar")}
          >
            Googleカレンダー
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedTab === "spreadsheet"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTab("spreadsheet")}
          >
            スプシ
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {selectedTab === "month" ? (
            <MonthlyCalendar
              calendarData={meetingData.calendarData}
              currentDate={currentDate}
              onChangeMonth={changeMonth}
              onUpdateDay={updateCalendarDay}
            />
          ) : selectedTab === "teacher" ? (
            <TeacherStats
              teacherStats={meetingData.teacherStats}
              onUpdateTeacher={updateTeacherStats}
              onAddTeacher={addTeacher}
              onDeleteTeacher={deleteTeacher}
            />
          ) : selectedTab === "average" ? (
            <AverageTimeTab
              meetingData={meetingData}
              currentDate={currentDate}
            />
          ) : selectedTab === "history" ? (
            <MeetingHistoryTab
              currentDate={currentDate}
            />
          ) : selectedTab === "googleCalendar" ? (
            <GoogleCalendarTab />
          ) : (
            <div className="w-full overflow-auto">
              {/* 検索フォーム */}
              <SearchMeeting />
              <iframe
                src="https://docs.google.com/spreadsheets/d/15lgA5kKRUOlMQbdEAJbqwMEZqgb4lO9atTIN82_vUyw/gviz/tq?tqx=out:html&gid=0&tq=select%20B,C,L,R,S,AC,AJ%20where%20AC%20%3D%20%27%E5%8F%97%E8%AC%9B%E4%B8%AD%27%20and%20R%20%3E%3D%20date%20%272025-07-01%27"
                className="w-full h-[800px] border-0"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}