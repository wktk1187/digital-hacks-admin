"use client";

import React from "react";
import { X } from "lucide-react";

interface DeleteTeacherModalProps {
  isOpen: boolean;
  teacherName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteTeacherModal({
  isOpen,
  teacherName,
  onConfirm,
  onCancel,
}: DeleteTeacherModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-11/12 max-w-sm p-6 shadow-lg relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold mb-4">講師を削除</h3>
        <p className="mb-6 text-sm">
          {teacherName} を削除してもよろしいですか？<br />この操作は取り消せません。
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            いいえ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            はい
          </button>
        </div>
      </div>
    </div>
  );
} 