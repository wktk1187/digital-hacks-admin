"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { TeacherStats as TeacherStatsType } from "@/types/dashboard";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (teacher: TeacherStatsType) => void;
}

export default function AddTeacherModal({ isOpen, onClose, onAdd }: AddTeacherModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail("");
    setName("");
    setError(null);
  };

  const handleSave = () => {
    if (!email || !name) {
      setError("メールアドレスと名前を入力してください。");
      return;
    }
    // 簡易メールチェック
    const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
    if (!re.test(email)) {
      setError("メールアドレスの形式が正しくありません。");
      return;
    }
    const newTeacher: TeacherStatsType = {
      id: email.trim(),
      name: name.trim(),
      teacher: { daily: 0, monthly: 0, yearly: 0, total: 0 },
      entry: { daily: 0, monthly: 0, yearly: 0, total: 0 },
      avgMinutes: {
        teacher: { daily: 0, monthly: 0, yearly: 0, total: 0 },
        entry: { daily: 0, monthly: 0, yearly: 0, total: 0 }
      }
    };
    onAdd(newTeacher);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-11/12 max-w-md p-6 shadow-lg relative">
        <button
          onClick={() => {
            reset();
            onClose();
          }}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-4">講師を追加</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="teacher@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田太郎"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 