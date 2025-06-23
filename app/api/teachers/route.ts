import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/teachers  : 一覧取得
export async function GET() {
  const { data, error } = await supabase.from('teachers').select('*').order('name');
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json(data);
}

// POST /api/teachers : 追加 { id/email, name }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name } = body;
  if (!id || !name) {
    return NextResponse.json({ error: 'id and name required' }, { status: 400 });
  }
  const { error } = await supabase.from('teachers').insert({ email: id, name }).single();
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
} 