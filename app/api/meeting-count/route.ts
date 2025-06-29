import { NextRequest, NextResponse } from 'next/server';

// GAS のデプロイ URL を環境変数かここに直書き
const GAS_ENDPOINT = process.env.GAS_MEETING_COUNT_URL ?? '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('query')?.trim();
  if (!q) return NextResponse.json({ message: 'query required' }, { status: 400 });

  if (!GAS_ENDPOINT) return NextResponse.json({ message: 'GAS endpoint not set' }, { status: 500 });

  try {
    const gasRes = await fetch(`${GAS_ENDPOINT}?q=${encodeURIComponent(q)}`);
    const data = await gasRes.json();
    if (!gasRes.ok) throw new Error(data?.message ?? 'GAS error');
    return NextResponse.json({ count: data.count ?? 0 });
  } catch (e: any) {
    return NextResponse.json({ message: e.message ?? 'failed' }, { status: 400 });
  }
} 