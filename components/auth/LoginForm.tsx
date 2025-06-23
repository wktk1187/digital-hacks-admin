"use client";

import React, { FormEvent, useState } from 'react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const ok = await onLogin(email, password);
    setError(ok ? null : 'メールアドレスまたはパスワードが違います');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">ログイン</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="メールアドレス"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="パスワード"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}