import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { estimateActualMeetingDuration } from '../lib/driveUtils';

// 環境変数を読み込み
dotenv.config();

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Google Calendar API設定
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CALENDAR_ID = process.env.GCAL_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ID;

if (!CALENDAR_ID) {
  throw new Error('GCAL_CALENDAR_ID or GOOGLE_CALENDAR_ID must be set in environment variables');
}

// サービスアカウント認証
function getGoogleAuth() {
  const serviceAccountPath = process.env.GCAL_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './google-service-account.json';
  console.log('Using service account path:', serviceAccountPath);
  
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: SCOPES,
  });
  
  return auth;
}

// タイトルからカテゴリを判定
function getCategoryFromTitle(title: string): 'teacher' | 'entry' {
  if (title.includes('講師面談')) {
    return 'teacher';
  } else if (title.includes('受講開始')) {
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

// Google Calendarからイベントを取得（ページネーション対応）
async function getCalendarEvents(startDate: Date, endDate: Date) {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  
  console.log('API Request Parameters:');
  console.log('- calendarId:', CALENDAR_ID);
  console.log('- timeMin:', startDate.toISOString());
  console.log('- timeMax:', endDate.toISOString());
  
  let allEvents: any[] = [];
  let pageToken: string | undefined = undefined;
  
  do {
    const response: any = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      maxResults: 2500, // 最大値に設定
      singleEvents: true,
      orderBy: 'startTime',
      pageToken: pageToken,
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data Keys:', Object.keys(response.data));
    console.log('Items array length:', response.data.items ? response.data.items.length : 'undefined');
    console.log('Raw items:', JSON.stringify(response.data.items, null, 2));
    console.log('Summary:', response.data.summary);
    console.log('AccessRole:', response.data.accessRole);
    console.log('TimeZone:', response.data.timeZone);
    
    const events = response.data.items || [];
    allEvents = allEvents.concat(events);
    pageToken = response.data.nextPageToken;
    
    console.log(`取得済み: ${allEvents.length}件, nextPageToken: ${pageToken ? 'あり' : 'なし'}`);
    
  } while (pageToken);
  
  console.log(`総イベント数: ${allEvents.length}件`);
  return allEvents;
}

// 面談データをSupabaseに保存
async function saveMeetingToDatabase(event: any) {
  const attachments = getAttachmentUrls(event);
  const attendeeInfo = getAttendeeInfo(event);
  const scheduledDuration = calculateDuration(event.start.dateTime, event.end.dateTime);
  
  // 実際の面談時間を取得（動画ファイルがある場合）
  let actualDuration = null;
  if (attachments.videos.length > 0) {
    try {
      actualDuration = await estimateActualMeetingDuration(attachments.videos, scheduledDuration);
    } catch (error) {
      console.log(`⚠️  実際の面談時間取得エラー (${event.summary}):`, error instanceof Error ? error.message : String(error));
    }
  }
  
  const meetingData = {
    calendar_event_id: event.id,
    title: event.summary,
    category: getCategoryFromTitle(event.summary || ''),
    organizer_email: getOrganizerEmail(event),
    attendee_name: attendeeInfo.name,
    attendee_email: attendeeInfo.email,
    start_time: event.start.dateTime,
    end_time: event.end.dateTime,
    duration_minutes: scheduledDuration,
    actual_duration_minutes: actualDuration,
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
  console.log(`=== Syncing meeting history from ${startDate.toISOString()} to ${endDate.toISOString()} ===`);
  console.log('Calendar ID:', CALENDAR_ID);
  console.log('Environment check - GCAL_SERVICE_ACCOUNT_JSON:', process.env.GCAL_SERVICE_ACCOUNT_JSON ? 'SET' : 'NOT SET');
  
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
    
    // 統計テーブルを更新
    if (successCount > 0) {
      console.log('Updating meeting statistics...');
      await updateMeetingStats(startDate, endDate);
    }
    
    return { successCount, errorCount, totalEvents: events.length };
    
  } catch (error) {
    console.error('Error syncing meeting history:', error);
    throw error;
  }
}

// 統計テーブルを更新
async function updateMeetingStats(startDate: Date, endDate: Date) {
  try {
    console.log('Updating meeting statistics from meeting_history table...');
    
    // meeting_historyテーブルからデータを取得して統計を更新
    const { data: meetings, error: fetchError } = await supabaseAdmin
      .from('meeting_history')
      .select('organizer_email, category, start_time, duration_minutes, actual_duration_minutes')
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (fetchError) {
      console.error('Error fetching meeting history:', fetchError);
      return false;
    }

    if (!meetings || meetings.length === 0) {
      console.log('No meetings found in the specified date range');
      return true;
    }

    console.log(`Processing ${meetings.length} meetings for statistics...`);

    // 各ミーティングを統計に追加
    let successCount = 0;
    let errorCount = 0;

    for (const meeting of meetings) {
      try {
        // start_timeから日付文字列を作成（YYYY/MM/DD形式）
        const meetingDate = new Date(meeting.start_time);
        const dateStr = meetingDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).replace(/年|月/g, '/').replace('日', '');

        // 実際の面談時間があれば優先、なければ予定時間を使用
        const actualDuration = meeting.actual_duration_minutes || meeting.duration_minutes;
        
        const { error } = await supabaseAdmin.rpc('update_meeting_stats', {
          p_email: meeting.organizer_email,
          p_category: meeting.category,
          p_date_str: dateStr,
          p_duration_minutes: actualDuration,
          p_delta_count: 1,
        });

        if (error) {
          console.error(`Error updating stats for ${meeting.organizer_email}:`, error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Exception updating stats for meeting:`, error);
        errorCount++;
      }
    }

    console.log(`Statistics update completed: ${successCount} success, ${errorCount} errors`);
    return errorCount === 0;
  } catch (error) {
    console.error('Exception updating meeting stats:', error);
    return false;
  }
}

// 日次同期（本日分）
export async function dailyHistorySync() {
  // 日本時間の今日の日付を取得
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const jstNow = new Date(now.getTime() + (jstOffset * 60 * 1000));
  
  const todayJST = jstNow.toISOString().split('T')[0]; // YYYY-MM-DD形式
  const startDate = new Date(todayJST + 'T00:00:00+09:00');
  const endDate = new Date(todayJST + 'T23:59:59+09:00');
  
  console.log('Starting daily meeting history sync for JST:', todayJST);
  console.log(`UTC range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  return await syncMeetingHistory(startDate, endDate);
}

// 一括同期（指定期間）
export async function bulkHistorySync(startDateStr: string, endDateStr: string) {
  // 日本時間（JST）でDateオブジェクトを作成
  const startDate = new Date(startDateStr + 'T00:00:00+09:00');
  const endDate = new Date(endDateStr + 'T23:59:59+09:00');
  
  console.log(`Starting bulk meeting history sync from ${startDateStr} to ${endDateStr} (JST)`);
  console.log(`UTC range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  return await syncMeetingHistory(startDate, endDate);
}

// CLI実行時の処理
const isMainModule = import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('sync-meeting-history.ts');
if (isMainModule) {
  console.log('Script started with args:', process.argv);
  const args = process.argv.slice(2);
  const command = args[0];
  console.log('Command:', command, 'Args:', args);
  
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
    console.log('Current args:', args);
    process.exit(1);
  }
} else {
  console.log('Script not executed as main module');
} 