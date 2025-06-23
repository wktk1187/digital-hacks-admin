import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// POST /api/login { email, password }
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'メールとパスワードを入力してください' }, { status: 400 });
  }

  // メールは小文字・前後空白を除去して比較する
  const normalizedEmail: string = (email as string).trim().toLowerCase();

  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('email, password')
    .eq('email', normalizedEmail)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: '認証に失敗しました' }, { status: 401 });
  }

  const valid = password === (data as any).password;

  if (!valid) {
    return NextResponse.json({ ok: false, message: '認証に失敗しました' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, email: (data as any).email, name: '管理者' });
}

export const runtime = 'nodejs'; 