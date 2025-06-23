import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(req: NextRequest) {
  // URL からエンコード済みメールアドレスを抽出しデコード
  const encodedId = req.nextUrl.pathname.split('/').pop() ?? '';
  const id = decodeURIComponent(encodedId);

  const { error } = await supabaseAdmin.from('teachers').delete().eq('email', id);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
} 