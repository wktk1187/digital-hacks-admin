import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { error } = await supabase.from('teachers').delete().eq('email', id);
  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ ok: true });
} 