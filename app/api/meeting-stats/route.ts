import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { email_teacher, duration = 0, delta_count = 1 } = await req.json();
    const { error } = await supabaseAdmin.rpc('update_meeting_stats', {
      p_email: email_teacher,
      p_duration: duration,
      p_delta: delta_count,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, message: e.message }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (email) {
    const { data, error } = await supabaseAdmin
      .from('v_stats_teacher')
      .select('*')
      .eq('email', email)
      .single();
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json(data);
  } else {
    const { data, error } = await supabaseAdmin.from('v_stats_all').select('*').single();
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json(data);
  }
} 