"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/Header";
import SettingsModal from "@/components/dashboard/SettingsModal";
import StatsCard from "@/components/dashboard/StatsCard";
import MonthlyCalendar from "@/components/dashboard/MonthlyCalendar";
import TeacherStats from "@/components/dashboard/TeacherStats";
import LoginForm from "@/components/auth/LoginForm";
import {
  MeetingData,
  SettingsData,
  TeacherStats as TeacherStatsType,
  TabType,
  UserData,
} from "@/types/dashboard";
import { generateCalendarData, getInitialTeachers } from "@/lib/utils";
import {
  addTeacherApi,
  deleteTeacherApi,
  getAllStats,
  getTeacherStats,
  getTeachers,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<TabType>("month");
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    emailNotifications: true,
    dailyReport: true,
    weeklyReport: false,
    autoSave: false,
  });

  const generateSampleData = (): MeetingData => {
    const teachers = getInitialTeachers() as { id: string; name: string }[];
    return {
      totalDaily: 0,
      totalMonthly: 0,
      totalYearly: 0,
      avgMinutes: 0,
      calendarData: generateCalendarData(
        currentDate.getFullYear(),
        currentDate.getMonth()
      ),
      teacherStats: teachers.map((t) => ({
        id: t.id,
        name: t.name,
        dailyCount: 0,
        monthlyCount: 0,
        yearlyCount: 0,
        avgMinutes: 0,
      })),
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // ① 全体統計を取得
        const all = await getAllStats();

        // ② 講師リスト Supabase から取得
        const teachers = (await getTeachers()) as { id: string; name: string }[];

        // ③ 講師別統計を並列取得
        const teacherStatsPromises = teachers.map(async (t: { id: string; name: string }) => {
          try {
            const s = await getTeacherStats(t.id);
            return {
              id: t.id,
              name: t.name,
              dailyCount: s?.day_total ?? 0,
              monthlyCount: s?.month_total ?? 0,
              yearlyCount: s?.year_total ?? 0,
              avgMinutes:
                s?.avg_minutes ??
                (s && s.day_total > 0 && (s.total_minutes ?? 0) > 0
                  ? Math.round(((s.total_minutes as number) / s.day_total) * 10) / 10
                  : 0),
            } as TeacherStatsType;
          } catch (e) {
            // データが無い場合など
            return {
              id: t.id,
              name: t.name,
              dailyCount: 0,
              monthlyCount: 0,
              yearlyCount: 0,
              avgMinutes: 0,
            } as TeacherStatsType;
          }
        });

        const teacherStats = await Promise.all(teacherStatsPromises);

        // カレンダー生成
        const calendar = generateCalendarData(
          currentDate.getFullYear(),
          currentDate.getMonth()
        );
        // 当日セルに day_total を反映
        const today = new Date();
        if (
          today.getFullYear() === currentDate.getFullYear() &&
          today.getMonth() === currentDate.getMonth()
        ) {
          const idx = calendar.findIndex((d) => d.date === today.getDate());
          if (idx !== -1) {
            calendar[idx] = {
              ...calendar[idx],
              count: all?.day_total ?? 0,
              hasData: (all?.day_total ?? 0) > 0,
            };
          }
        }

        const data: MeetingData = {
          totalDaily: all?.day_total ?? 0,
          totalMonthly: all?.month_total ?? 0,
          totalYearly: all?.year_total ?? 0,
          avgMinutes:
            all?.avg_minutes ??
            (all && all.day_total > 0 && (all.total_minutes ?? 0) > 0
              ? Math.round(((all.total_minutes as number) / all.day_total) * 10) / 10
              : 0),
          calendarData: calendar,
          teacherStats,
        };

        setMeetingData(data);
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
  const handleLogin = () => {
    const u: UserData = { name: "管理者", email: "admin@example.com", role: "admin" };
    setUser(u);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardUser', JSON.stringify(u));
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dashboardUser');
    }
  };

  const updateTotalStats = (field: keyof MeetingData, value: number) => {
    if (!meetingData) return;
    setMeetingData({ ...meetingData, [field]: value });
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
    field: keyof TeacherStatsType,
    value: number
  ) => {
    if (!meetingData) return;
    const updated = meetingData.teacherStats.map((t) =>
      t.id === teacherId ? { ...t, [field]: value } : t
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

  const deleteTeacher = (teacherId: string) => {
    if (!meetingData) return;
    setMeetingData({
      ...meetingData,
      teacherStats: meetingData.teacherStats.filter((t) => t.id !== teacherId),
    });
    setHasUnsavedChanges(true);
    deleteTeacherApi(teacherId).catch(console.error);
  };

  const changeMonth = (inc: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + inc);
      return d;
    });
  };

  useEffect(() => {
    // Supabase Realtime subscription: stats_all 更新
    const channel = supabase
      .channel('dashboard-stats')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stats_all' },
        (payload) => {
          const r: any = payload.new;
          updateTotalStats('totalDaily', r.day_total);
          updateTotalStats('totalMonthly', r.month_total);
          updateTotalStats('totalYearly', r.year_total);
          updateTotalStats('avgMinutes', r.day_total > 0 ? Math.round((r.total_minutes / r.day_total) * 10) / 10 : 0);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'stats_teacher' },
        (payload) => {
          const r: any = payload.new;
          updateTeacherStats(r.email, 'dailyCount', r.day_total);
          updateTeacherStats(r.email, 'monthlyCount', r.month_total);
          updateTeacherStats(r.email, 'yearlyCount', r.year_total);
          const avg = r.day_total > 0 ? Math.round((r.total_minutes / r.day_total) * 10) / 10 : 0;
          updateTeacherStats(r.email, 'avgMinutes', avg);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 初回マウント時に localStorage から復元
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('dashboardUser');
    if (stored) {
      try {
        const parsed: UserData = JSON.parse(stored);
        setUser(parsed);
      } catch (_) {}
    }
  }, []);

  /* ---------- レンダリング ---------- */
  if (!user) return <LoginForm onLogin={handleLogin} />;
  if (loading || !meetingData) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={handleLogout} onSettingsClick={() => setShowSettings(true)} />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
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
          ) : (
            <div className="w-full overflow-auto">
              <iframe
                src="https://docs.google.com/spreadsheets/d/15lgA5kKRUOlMQbdEAJbqwMEZqgb4lO9atTIN82_vUyw/gviz/tq?tqx=out:html&gid=0&tq=select%20B,C,L,R,S,AC,AJ%20where%20AC%20%3D%20%27%E5%8F%97%E8%AC%9B%E4%B8%AD%27"
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