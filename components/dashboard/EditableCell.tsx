"use client";

import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableCellProps {
  value: number;
  onSave: (value: number) => void;
  className?: string;
  suffix?: string;
}

export default function EditableCell({ value, onSave, className = "", suffix = "" }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = () => {
    const newValue = parseInt(editValue) || 0;
    onSave(newValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button onClick={handleSave} className="text-green-600 hover:text-green-700">
          <Check className="w-4 h-4" />
        </button>
        <button onClick={handleCancel} className="text-red-600 hover:text-red-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`cursor-pointer hover:bg-gray-100 rounded px-2 py-1 inline-flex items-center gap-1 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className="font-bold">{value}</span>
      {suffix && <span>{suffix}</span>}
      <Edit2 className="w-3 h-3 text-gray-400" />
    </div>
  );
}