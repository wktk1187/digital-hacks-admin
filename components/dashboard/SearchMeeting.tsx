import React, { useState } from 'react';

interface Props {
  onResult?: (cnt: number | null) => void;
}

const SearchMeeting: React.FC<Props> = ({ onResult }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/meeting-count?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? 'Error');
      setCount(data.count ?? null);
      onResult?.(data.count ?? null);
    } catch (err: any) {
      setError(err.message ?? '取得に失敗しました');
      setCount(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="メールアドレスまたは顧客名"
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          検索
        </button>
        {loading && <span className="text-sm text-gray-500">検索中…</span>}
      </form>
      {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
      {count !== null && !error && (
        <p className="mt-1 text-sm">
          面談回数: <span className="font-semibold">{count}</span>
        </p>
      )}
    </div>
  );
};

export default SearchMeeting; 