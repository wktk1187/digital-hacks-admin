import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import argon2 from 'argon2';

// POST /api/login { email, password }
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'メールとパスワードを入力してください' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('email, pass_hash, password_hash, password')
    .eq('email', email)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: '認証に失敗しました' }, { status: 401 });
  }

  let valid = false;
  const hash = (data as any).pass_hash ?? (data as any).password_hash;
  if (hash) {
    try {
      valid = await argon2.verify(hash, password);
    } catch (_) { valid = false; }
  }
  // fallback: plain comparison until全レコードハッシュ移行
  if (!valid && (data as any).password) {
    valid = password === (data as any).password;
  }

  if (!valid) {
    return NextResponse.json({ ok: false, message: '認証に失敗しました' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, email: (data as any).email, name: '管理者' });
}

export const runtime = 'nodejs'; 