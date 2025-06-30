import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const {
      email_teacher,
      email,
      teacherEmail,
      duration = 0,
      delta_count = 1,
      date_str, // 'YYYY/MM/DD' 形式 （省略時は今日）
    } = await req.json();

    // 受け取った複数候補のキーから講師メールを決定
    const teacherEmailResolved = (email_teacher ?? email ?? teacherEmail ?? '').trim();

    if (!teacherEmailResolved) {
      return NextResponse.json(
        { ok: false, message: '講師メールアドレスが指定されていません' },
        { status: 400 },
      );
    }

    const ds =
      (typeof date_str === 'string' && date_str.trim()) ||
      new Date()
        .toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/年|月/g, '/')
        .replace('日', '');

    const { error } = await supabaseAdmin.rpc('update_meeting_stats', {
      p_email: teacherEmailResolved,
      p_date_str: ds,
      p_duration_minutes: duration,
      p_delta_count: delta_count,
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
  const emailParam = searchParams.get('email');

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = today.getMonth() + 1;
  const yyyyMM = { key_year: yyyy, key_month: mm };
  const todayISO = today.toISOString().slice(0, 10); // YYYY-MM-DD

  if (emailParam) {
    // 講師別
    const dayRes = await supabaseAdmin
      .from('stats_teacher_day')
      .select('total_cnt,total_minutes')
      .eq('email', emailParam)
      .eq('key_date', todayISO)
      .maybeSingle();
    const monthRes = await supabaseAdmin
      .from('stats_teacher_month')
      .select('total_cnt,total_minutes')
      .match({ email: emailParam, ...yyyyMM })
      .maybeSingle();
    const yearRes = await supabaseAdmin
      .from('stats_teacher_year')
      .select('total_cnt,total_minutes')
      .match({ email: emailParam, key_year: yyyy })
      .maybeSingle();

    if (dayRes.error || monthRes.error || yearRes.error) {
      return NextResponse.json({ error: dayRes.error || monthRes.error || yearRes.error }, { status: 400 });
    }

    const dayCnt = dayRes.data?.total_cnt ?? 0;
    const monthCnt = monthRes.data?.total_cnt ?? 0;
    const yearCnt = yearRes.data?.total_cnt ?? 0;
    const dayMin = dayRes.data?.total_minutes ?? 0;

    return NextResponse.json({
      day_total: dayCnt,
      month_total: monthCnt,
      year_total: yearCnt,
      total_minutes: dayMin,
      avg_minutes: dayCnt > 0 ? Math.round((dayMin / dayCnt) * 10) / 10 : 0,
    });
  } else {
    // 全体
    const dayRes = await supabaseAdmin
      .from('stats_all_day')
      .select('total_cnt,total_minutes,key_date')
      .eq('key_date', todayISO)
      .maybeSingle();
    const monthRes = await supabaseAdmin
      .from('stats_all_month')
      .select('total_cnt,total_minutes')
      .match(yyyyMM)
      .maybeSingle();
    const yearRes = await supabaseAdmin
      .from('stats_all_year')
      .select('total_cnt,total_minutes')
      .match({ key_year: yyyy })
      .maybeSingle();

    if (dayRes.error || monthRes.error || yearRes.error) {
      return NextResponse.json({ error: dayRes.error || monthRes.error || yearRes.error }, { status: 400 });
    }

    const dayCnt = dayRes.data?.total_cnt ?? 0;
    const dayMin = dayRes.data?.total_minutes ?? 0;

    const monthCnt = monthRes.data?.total_cnt ?? 0;
    const monthMin = monthRes.data?.total_minutes ?? 0;

    const yearCnt = yearRes.data?.total_cnt ?? 0;
    const yearMin = yearRes.data?.total_minutes ?? 0;

    return NextResponse.json({
      day_total: dayCnt,
      month_total: monthCnt,
      year_total: yearCnt,
      total_minutes: dayMin,
      avg_minutes: dayCnt > 0 ? Math.round((dayMin / dayCnt) * 10) / 10 : 0,
    });
  }
} 