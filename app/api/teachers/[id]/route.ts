import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(_req: NextRequest, { params }: { params: Record<string, string> }) {
  const { id } = params as { id: string };
  const { error } = await supabase.from('teachers').delete().eq('email', id);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
} 