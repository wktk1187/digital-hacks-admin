import * as dotenv from 'dotenv';
import { extractFileIdFromUrl, getVideoDurationMs, getFileMetadata } from '../lib/driveUtils';

// 環境変数を読み込み
dotenv.config();

async function testDriveAPI() {
  console.log('🔧 Google Drive API接続テスト開始...');
  
  // 実際のファイルURL（データベースから取得）
  const testUrl = 'https://drive.google.com/file/d/1Je2W4rxCKCrGp_2Q6aSgvHSjRNers6Fb/view?usp=drive_web';
  
  try {
    // ファイルIDを抽出
    const fileId = extractFileIdFromUrl(testUrl);
    console.log('📁 ファイルID:', fileId);
    
    if (!fileId) {
      throw new Error('ファイルIDを抽出できませんでした');
    }
    
    // ファイルメタデータを取得
    console.log('📋 ファイルメタデータを取得中...');
    const metadata = await getFileMetadata(fileId);
    if (metadata) {
      console.log('✅ ファイル名:', metadata.name);
      console.log('📄 MIMEタイプ:', metadata.mimeType);
      console.log('📏 サイズ:', metadata.size ? `${Math.round(parseInt(metadata.size) / 1024 / 1024)}MB` : 'N/A');
    } else {
      console.log('⚠️  メタデータを取得できませんでした');
    }
    
    // 動画時間を取得
    console.log('🎬 動画時間を取得中...');
    const durationMs = await getVideoDurationMs(fileId);
    if (durationMs) {
      const minutes = Math.round(durationMs / 60000);
      console.log(`✅ 動画時間: ${durationMs}ms (${minutes}分)`);
    } else {
      console.log('⚠️  動画時間を取得できませんでした');
    }
    
    console.log('🎉 テスト完了 - Drive API正常動作');
    
  } catch (error) {
    console.error('❌ テストエラー:', error);
  }
}

testDriveAPI(); 