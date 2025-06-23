import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop() ?? '';
  const { error } = await supabaseAdmin.from('teachers').delete().eq('email', id);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
} 