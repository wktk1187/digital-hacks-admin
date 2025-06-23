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
    .select('email, pass_hash')
    .eq('email', email)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, message: '認証に失敗しました' }, { status: 401 });
  }

  // argon2 でハッシュ検証
  const valid = await argon2.verify(data.pass_hash, password);
  if (!valid) {
    return NextResponse.json({ ok: false, message: '認証に失敗しました' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, email: data.email, name: '管理者' });
} 