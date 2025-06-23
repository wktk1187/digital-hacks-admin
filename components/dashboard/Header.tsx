"use client";

import React, { useState } from "react";
import { Settings, LogOut, LogIn, User, BarChart2 } from "lucide-react";
import { UserData } from "@/types/dashboard";

interface HeaderProps {
  user: UserData | null;
  onLogout: () => void;
  onSettingsClick: () => void;
}

export default function Header({ user, onLogout, onSettingsClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold whitespace-nowrap">
            デジハク講師面談管理ダッシュボード
          </h1>
        </div>

        {/* Right area */}
        {user ? (
          <div className="flex items-center gap-4 relative">
            {/* Settings Button */}
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User menu */}
            <button
              onClick={() => setShowUserMenu((p) => !p)}
              className="flex items-center gap-2 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline-block">
                {user.name}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
            <LogIn className="w-4 h-4" />
            ログイン
          </button>
        )}
      </div>
    </header>
  );
}