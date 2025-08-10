import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Environment variables are missing: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

function toJstDateRange(dateStr: string): { start: Date; end: Date } {
  // dateStr: YYYY-MM-DD (JST)
  const start = new Date(`${dateStr}T00:00:00+09:00`);
  const end = new Date(`${dateStr}T23:59:59+09:00`);
  return { start, end };
}

function toDateStrJst(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  // approximate JST by adding +9h offset for formatting purposes only
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const yy = jst.getUTCFullYear();
  const mm = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(jst.getUTCDate()).padStart(2, '0');
  // prefer jst fields
  return `${yy}/${mm}/${dd}`;
}

async function revertStatsForMeetings(dateStr: string) {
  const { start, end } = toJstDateRange(dateStr);

  const { data: meetings, error } = await supabaseAdmin
    .from('meeting_history')
    .select('organizer_email, category, start_time, duration_minutes, actual_duration_minutes')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString());

  if (error) throw new Error(`fetch meetings failed: ${error.message}`);

  const items = meetings ?? [];
  console.log(`Found ${items.length} meetings to revert for ${dateStr}`);

  let ok = 0;
  let ng = 0;
  for (const m of items) {
    const duration: number = (m.actual_duration_minutes ?? m.duration_minutes ?? 0) as number;
    const ds = toDateStrJst(m.start_time as unknown as string);
    const { error: rpcError } = await supabaseAdmin.rpc('update_meeting_stats', {
      p_email: m.organizer_email,
      p_category: m.category,
      p_date_str: ds,
      p_duration_minutes: -Math.abs(duration),
      p_delta_count: -1,
    });
    if (rpcError) {
      console.error('RPC revert failed:', rpcError);
      ng++;
    } else {
      ok++;
    }
  }
  console.log(`Revert stats done: ${ok} success, ${ng} errors`);
}

async function deleteMeetingsOn(dateStr: string) {
  const { start, end } = toJstDateRange(dateStr);
  const { error } = await supabaseAdmin
    .from('meeting_history')
    .delete()
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString());
  if (error) throw new Error(`delete meetings failed: ${error.message}`);
}

async function main() {
  const dateStr = process.argv[2];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr ?? '')) {
    console.error('Usage: tsx scripts/delete-day.ts YYYY-MM-DD (JST)');
    process.exit(1);
  }

  console.log(`🗑️ Deleting data for ${dateStr} (JST)`);
  await revertStatsForMeetings(dateStr);
  await deleteMeetingsOn(dateStr);
  console.log('✅ Completed deletion for the specified date');
}

if (import.meta.url === `file://${process.argv[1]}` || (process.argv[1] || '').endsWith('delete-day.ts')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}


