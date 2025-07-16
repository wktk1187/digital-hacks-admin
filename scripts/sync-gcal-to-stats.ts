import { google } from 'googleapis';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// Google Calendar API設定
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CALENDAR_ID = process.env.GCAL_CALENDAR_ID || '';

// サービスアカウント認証
function getGoogleAuth() {
  const serviceAccountJson = process.env.GCAL_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('GCAL_SERVICE_ACCOUNT_JSON environment variable is not set');
  }
  
  const credentials = JSON.parse(serviceAccountJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  
  return auth;
}

// タイトルからカテゴリを判定
function getCategoryFromTitle(title: string): 'teacher' | 'entry' {
  if (title.includes('講師面談')) {
    return 'teacher';
  } else if (title.includes('受講開始面談')) {
    return 'entry';
  }
  // デフォルトは講師面談
  return 'teacher';
}

// 講師メールアドレスを抽出（イベントの参加者から）
function extractTeacherEmail(event: any): string | null {
  if (!event.attendees) return null;
  
  // @digital-hacks.com以外のメールアドレスを講師として扱う
  const teacherAttendee = event.attendees.find((attendee: any) => 
    attendee.email && !attendee.email.includes('@digital-hacks.com')
  );
  
  return teacherAttendee?.email || null;
}

// 面談時間を計算（分単位）
function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// 日付をYYYY/MM/DD形式に変換
function formatDateForApi(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/年|月/g, '/').replace('日', '');
}

// Google Calendarからイベントを取得
async function getCalendarEvents(startDate: Date, endDate: Date) {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  
  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return response.data.items || [];
}

// 面談データを統計テーブルに追加
async function addMeetingToStats(
  teacherEmail: string,
  category: 'teacher' | 'entry',
  duration: number,
  date: Date
) {
  const dateStr = formatDateForApi(date);
  
  try {
    const { error } = await supabaseAdmin.rpc('update_meeting_stats', {
      p_email: teacherEmail,
      p_category: category,
      p_date_str: dateStr,
      p_duration_minutes: duration,
      p_delta_count: 1,
    });
    
    if (error) {
      console.error(`Error updating stats for ${teacherEmail}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Exception updating stats for ${teacherEmail}:`, error);
    return false;
  }
}

// メイン同期処理
async function syncCalendarEvents(startDate: Date, endDate: Date) {
  console.log(`Syncing calendar events from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  try {
    const events = await getCalendarEvents(startDate, endDate);
    console.log(`Found ${events.length} events`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of events) {
      if (!event.start?.dateTime || !event.end?.dateTime || !event.summary) {
        continue; // 終日イベントや詳細不明なイベントはスキップ
      }
      
      const title = event.summary;
      const category = getCategoryFromTitle(title);
      const teacherEmail = extractTeacherEmail(event);
      
      if (!teacherEmail) {
        console.log(`Skipping event "${title}" - no teacher email found`);
        continue;
      }
      
      const duration = calculateDuration(event.start.dateTime, event.end.dateTime);
      const eventDate = new Date(event.start.dateTime);
      
      console.log(`Processing: ${title} | ${teacherEmail} | ${category} | ${duration}min | ${eventDate.toLocaleDateString()}`);
      
      const success = await addMeetingToStats(teacherEmail, category, duration, eventDate);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`Sync completed: ${successCount} success, ${errorCount} errors`);
    return { successCount, errorCount, totalEvents: events.length };
    
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    throw error;
  }
}

// 日次同期（本日分）
export async function dailySync() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  console.log('Starting daily sync for:', today.toLocaleDateString());
  return await syncCalendarEvents(today, endDate);
}

// 一括同期（指定期間）
export async function bulkSync(startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);
  
  console.log(`Starting bulk sync from ${startDateStr} to ${endDateStr}`);
  return await syncCalendarEvents(startDate, endDate);
}

// CLI実行時の処理
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'daily') {
    dailySync()
      .then(result => {
        console.log('Daily sync result:', result);
        process.exit(0);
      })
      .catch(error => {
        console.error('Daily sync failed:', error);
        process.exit(1);
      });
  } else if (command === 'bulk' && args.length === 3) {
    const startDate = args[1];
    const endDate = args[2];
    
    bulkSync(startDate, endDate)
      .then(result => {
        console.log('Bulk sync result:', result);
        process.exit(0);
      })
      .catch(error => {
        console.error('Bulk sync failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  npm run sync-gcal daily           # Sync today\'s events');
    console.log('  npm run sync-gcal bulk YYYY-MM-DD YYYY-MM-DD  # Sync date range');
    process.exit(1);
  }
} 