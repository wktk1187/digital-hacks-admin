import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Google Drive API設定（サービスアカウント）
export function getDriveAuth() {
  const serviceAccountPath = process.env.GCAL_SERVICE_ACCOUNT_PATH || './google-service-account.json';
  
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountPath,
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
  });
  
  return auth;
}

// ドメイン全体の権限委譲でinfo@digital-hakcs.comとして動作
export async function getDriveAuthWithImpersonation() {
  const serviceAccountPath = process.env.GCAL_SERVICE_ACCOUNT_PATH || './google-service-account.json';
  
  // JWTクライアントを直接使用してドメイン権限委譲を実装
  const fs = await import('fs');
  const keyData = fs.readFileSync(serviceAccountPath, 'utf8');
  const key = JSON.parse(keyData);
  
  const jwtClient = new google.auth.JWT(
    key.client_email,
    undefined,
    key.private_key,
    [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    'info@digital-hacks.com' // このユーザーとして動作
  );
  
  return jwtClient;
}

// OAuth2認証でユーザーアカウントを使用
export function getOAuth2Client(): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/auth/callback' // リダイレクトURL
  );

  // 既存のトークンがあれば設定
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

// 認証URLを生成
export function generateAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    prompt: 'consent'
  });
  
  return authUrl;
}

// Google Drive URLからファイルIDを抽出
export function extractFileIdFromUrl(url: string): string | null {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// 動画ファイルの時間を取得（ミリ秒）- サービスアカウント使用
export async function getVideoDurationMs(fileId: string): Promise<number | null> {
  try {
    const auth = getDriveAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.get({
      fileId,
      fields: 'videoMediaMetadata'
    });
    
    const durationMs = response.data.videoMediaMetadata?.durationMillis;
    return durationMs ? parseInt(durationMs) : null;
  } catch (error) {
    console.error(`Error getting video duration for file ${fileId}:`, error);
    return null;
  }
}

// 動画ファイルの時間を取得（ミリ秒）- ドメイン権限委譲使用
export async function getVideoDurationMsWithImpersonation(fileId: string): Promise<number | null> {
  try {
    const auth = await getDriveAuthWithImpersonation();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.get({
      fileId,
      fields: 'videoMediaMetadata'
    });
    
    const durationMs = response.data.videoMediaMetadata?.durationMillis;
    return durationMs ? parseInt(durationMs) : null;
  } catch (error) {
    console.error(`Error getting video duration with impersonation for file ${fileId}:`, error);
    return null;
  }
}

// 動画ファイルの時間を取得（ミリ秒）- OAuth2ユーザー認証使用
export async function getVideoDurationMsWithOAuth(fileId: string): Promise<number | null> {
  try {
    const oauth2Client = getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.get({
      fileId,
      fields: 'videoMediaMetadata'
    });
    
    const durationMs = response.data.videoMediaMetadata?.durationMillis;
    return durationMs ? parseInt(durationMs) : null;
  } catch (error) {
    console.error(`Error getting video duration with OAuth for file ${fileId}:`, error);
    return null;
  }
}

// ファイル名から開始時刻を抽出
export function extractStartTimeFromFilename(filename: string): Date | null {
  // パターン: "講師面談 (名前) - 2025/07/16 20:56 JST～Recording"
  const match = filename.match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2})/);
  if (!match) return null;
  
  try {
    // "2025/07/16 20:56" -> "2025-07-16T20:56:00+09:00"
    const dateTimeStr = match[1].replace(/\//g, '-');
    const isoString = `${dateTimeStr}:00+09:00`;
    return new Date(isoString);
  } catch (error) {
    console.error('Error parsing date from filename:', filename, error);
    return null;
  }
}

// 動画の実際の時間を計算（分単位）
export function calculateActualDurationMinutes(durationMs: number): number {
  return Math.round(durationMs / 60000);
}

// ファイル名から面談時間を推定（Drive API使用不可の場合の代替手段）
export function estimateDurationFromFilename(filename: string, scheduledDurationMinutes: number = 60): number | null {
  // ファイル名パターンから推定ロジック
  // 例: "講師面談 (名前) - 2025/07/16 20:56 JST～Recording"
  
  // 録画ファイルの場合、通常は実際の面談時間に近い
  if (filename.includes('Recording')) {
    // 標準的な面談時間の範囲で推定（30-90分）
    // より正確には、カレンダーの終了時刻と比較する必要がある
    return scheduledDurationMinutes; // 暫定的にスケジュール時間を返す
  }
  
  return null;
}

// URLのファイル名から面談時間を推定
export async function estimateActualMeetingDuration(
  videoUrls: string[], 
  scheduledDurationMinutes: number = 60
): Promise<number | null> {
  if (!videoUrls || videoUrls.length === 0) return null;
  
  // まずDrive APIを試す
  try {
    const actualDuration = await getActualMeetingDuration(videoUrls);
    if (actualDuration !== null) {
      return actualDuration;
    }
  } catch (error) {
    console.log('Drive API unavailable, using filename estimation');
  }
  
  // Drive APIが使用できない場合、ファイル名から推定
  for (const url of videoUrls) {
    // URLからファイル名を推定（実際にはAPIで取得が必要）
    // 暫定的に、録画ファイルがある場合は実際に面談が行われたと仮定
    if (url.includes('Recording')) {
      // より精密な推定ロジックが必要だが、暫定的に標準時間を返す
      return scheduledDurationMinutes;
    }
  }
  
  return null;
}

// ファイルURLから実際の面談時間を取得（ドメイン権限委譲優先）
export async function getActualMeetingDuration(videoUrls: string[]): Promise<number | null> {
  if (!videoUrls || videoUrls.length === 0) return null;
  
  // 最初の動画ファイルの時間を取得（複数ある場合は最長のものを使用）
  let maxDuration = 0;
  
  for (const url of videoUrls) {
    const fileId = extractFileIdFromUrl(url);
    if (!fileId) continue;
    
    // まずドメイン権限委譲で試行
    let durationMs = null;
    try {
      durationMs = await getVideoDurationMsWithImpersonation(fileId);
      console.log(`✅ Domain delegation success for file ${fileId}: ${durationMs}ms`);
    } catch (error) {
      console.log(`❌ Domain delegation failed for file ${fileId}, trying service account...`);
      
      // ドメイン権限委譲が失敗した場合、通常のサービスアカウントで試行
      try {
        durationMs = await getVideoDurationMs(fileId);
        console.log(`✅ Service account success for file ${fileId}: ${durationMs}ms`);
      } catch (error2) {
        console.log(`❌ Service account also failed for file ${fileId}`);
      }
    }
    
    if (durationMs && durationMs > maxDuration) {
      maxDuration = durationMs;
    }
  }
  
  return maxDuration > 0 ? calculateActualDurationMinutes(maxDuration) : null;
}

// Google Drive APIでファイルのメタデータを取得
export async function getFileMetadata(fileId: string) {
  try {
    const auth = getDriveAuth();
    const drive = google.drive({ version: 'v3', auth });
    
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,videoMediaMetadata,createdTime,modifiedTime'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error getting file metadata for ${fileId}:`, error);
    return null;
  }
} 