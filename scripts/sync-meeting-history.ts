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
  return 'teacher'; // デフォルト
}

// 主催者メールアドレスを取得
function getOrganizerEmail(event: any): string {
  return event.organizer?.email || '';
}

// 予約者情報を取得（参加者から主催者以外を抽出）
function getAttendeeInfo(event: any): { name: string; email: string } {
  if (!event.attendees) return { name: '', email: '' };
  
  const organizerEmail = event.organizer?.email;
  const attendee = event.attendees.find((att: any) => 
    att.email !== organizerEmail && !att.email.includes('@digital-hacks.com')
  );
  
  return {
    name: attendee?.displayName || '',
    email: attendee?.email || ''
  };
}

// 添付ファイルのURLを取得
function getAttachmentUrls(event: any): { documents: string[], videos: string[] } {
  const documents: string[] = [];
  const videos: string[] = [];
  
  if (event.attachments) {
    event.attachments.forEach((attachment: any) => {
      const url = attachment.fileUrl;
      if (url) {
        if (url.includes('docs.google.com') || url.includes('drive.google.com')) {
          if (url.includes('/document/') || url.includes('docx') || url.includes('pdf')) {
            documents.push(url);
          } else if (url.includes('/file/') || url.includes('mp4') || url.includes('mov')) {
            videos.push(url);
          }
        }
      }
    });
  }
  
  return { documents, videos };
}

// 面談時間を計算（分単位）
function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// Google Calendarからイベントを取得
async function getCalendarEvents(startDate: Date, endDate: Date) {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  
  const response = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    maxResults: 500,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return response.data.items || [];
}

// 面談データをSupabaseに保存
async function saveMeetingToDatabase(event: any) {
  const attachments = getAttachmentUrls(event);
  const attendeeInfo = getAttendeeInfo(event);
  
  const meetingData = {
    calendar_event_id: event.id,
    title: event.summary,
    category: getCategoryFromTitle(event.summary || ''),
    organizer_email: getOrganizerEmail(event),
    attendee_name: attendeeInfo.name,
    attendee_email: attendeeInfo.email,
    start_time: event.start.dateTime,
    end_time: event.end.dateTime,
    duration_minutes: calculateDuration(event.start.dateTime, event.end.dateTime),
    description: event.description || '',
    location: event.location || '',
    document_urls: attachments.documents,
    video_urls: attachments.videos,
    meet_link: event.hangoutLink || '',
    calendar_event_url: event.htmlLink || ''
  };
  
  try {
    const { error } = await supabaseAdmin
      .from('meeting_history')
      .upsert(meetingData, { 
        onConflict: 'calendar_event_id',
        ignoreDuplicates: false 
      });
    
    if (error) {
      console.error(`Error saving meeting ${event.id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Exception saving meeting ${event.id}:`, error);
    return false;
  }
}

// メイン同期処理
async function syncMeetingHistory(startDate: Date, endDate: Date) {
  console.log(`Syncing meeting history from ${startDate.toISOString()} to ${endDate.toISOString()}`);
  
  try {
    const events = await getCalendarEvents(startDate, endDate);
    console.log(`Found ${events.length} events`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of events) {
      if (!event.start?.dateTime || !event.end?.dateTime || !event.summary) {
        continue; // 終日イベントや詳細不明なイベントはスキップ
      }
      
      // 面談関連のイベントのみ処理
      if (!event.summary.includes('面談') && !event.summary.includes('講師') && !event.summary.includes('受講')) {
        continue;
      }
      
      console.log(`Processing: ${event.summary} | ${event.start.dateTime}`);
      
      const success = await saveMeetingToDatabase(event);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log(`Sync completed: ${successCount} success, ${errorCount} errors`);
    return { successCount, errorCount, totalEvents: events.length };
    
  } catch (error) {
    console.error('Error syncing meeting history:', error);
    throw error;
  }
}

// 日次同期（本日分）
export async function dailyHistorySync() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999);
  
  console.log('Starting daily meeting history sync for:', today.toLocaleDateString());
  return await syncMeetingHistory(today, endDate);
}

// 一括同期（指定期間）
export async function bulkHistorySync(startDateStr: string, endDateStr: string) {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);
  
  console.log(`Starting bulk meeting history sync from ${startDateStr} to ${endDateStr}`);
  return await syncMeetingHistory(startDate, endDate);
}

// CLI実行時の処理
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'daily') {
    dailyHistorySync()
      .then(result => {
        console.log('Daily history sync result:', result);
        process.exit(0);
      })
      .catch(error => {
        console.error('Daily history sync failed:', error);
        process.exit(1);
      });
  } else if (command === 'bulk' && args.length === 3) {
    const startDate = args[1];
    const endDate = args[2];
    
    bulkHistorySync(startDate, endDate)
      .then(result => {
        console.log('Bulk history sync result:', result);
        process.exit(0);
      })
      .catch(error => {
        console.error('Bulk history sync failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  npm run sync-history daily           # Sync today\'s meetings');
    console.log('  npm run sync-history bulk YYYY-MM-DD YYYY-MM-DD  # Sync date range');
    process.exit(1);
  }
} 