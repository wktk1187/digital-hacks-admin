import { getDriveAuthWithImpersonation, getVideoDurationMsWithImpersonation } from '../lib/driveUtils';
import { google } from 'googleapis';

async function testDomainDelegation() {
  console.log('=== ドメイン権限委譲テスト ===');
  console.log('info@digital-hacks.com として Google Drive にアクセスします...\n');
  
  try {
    // 1. 認証テスト
    const auth = await getDriveAuthWithImpersonation();
    const drive = google.drive({ version: 'v3', auth });
    
    console.log('🔐 認証中...');
    
    // 2. ファイル一覧取得テスト
    const response = await drive.files.list({
      q: "mimeType contains 'video/' and name contains '講師面談'",
      fields: 'files(id,name,owners)',
      pageSize: 10
    });
    
    console.log('✅ ドメイン権限委譲での認証成功！');
    console.log(`📁 アクセス可能な動画ファイル数: ${response.data.files?.length || 0}\n`);
    
    if (response.data.files && response.data.files.length > 0) {
      console.log('📋 アクセス可能なファイル一覧:');
      
      for (let i = 0; i < Math.min(5, response.data.files.length); i++) {
        const file = response.data.files[i];
        console.log(`  ${i + 1}. ${file.name}`);
        console.log(`     ID: ${file.id}`);
        
        // ファイルの所有者情報も表示
        if (file.owners && file.owners.length > 0) {
          const owner = file.owners[0];
          console.log(`     所有者: ${owner.displayName} (${owner.emailAddress})`);
        }
        
        // 3. 動画時間取得テスト（最初のファイルのみ）
        if (i === 0) {
          console.log('     🎥 動画時間取得中...');
          try {
            const duration = await getVideoDurationMsWithImpersonation(file.id!);
            if (duration) {
              const minutes = Math.round(duration / 60000);
              console.log(`     ⏱️  時間: ${minutes}分 (${duration}ms)`);
            } else {
              console.log('     ❌ 動画時間の取得に失敗');
            }
          } catch (error) {
            console.log(`     ❌ 動画時間取得エラー: ${error}`);
          }
        }
        console.log('');
      }
      
      if (response.data.files.length > 5) {
        console.log(`     ... 他 ${response.data.files.length - 5} ファイル\n`);
      }
    } else {
      console.log('📭 アクセス可能な動画ファイルが見つかりませんでした');
      console.log('以下を確認してください:');
      console.log('1. Google Cloud Console でドメイン権限委譲が設定されているか');
      console.log('2. Google Workspace 管理コンソールでサービスアカウントが承認されているか');
      console.log('3. info@digital-hakcs.com が動画ファイルにアクセス権限を持っているか');
    }
    
  } catch (error: any) {
    console.error('❌ ドメイン権限委譲テストに失敗:');
    
    if (error.message?.includes('unauthorized_client')) {
      console.error('🔒 認証エラー: ドメイン権限委譲が正しく設定されていません');
      console.error('\n設定手順:');
      console.error('1. Google Cloud Console > IAM & Admin > Service Accounts');
      console.error('2. サービスアカウントを選択 > "Enable G Suite Domain-wide Delegation"');
      console.error('3. Google Workspace Admin Console > Security > API Controls > Domain-wide Delegation');
      console.error('4. サービスアカウントのClient IDを追加');
      console.error('5. スコープ: https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/calendar.readonly');
    } else if (error.message?.includes('access_denied')) {
      console.error('🚫 アクセス拒否: info@digital-hakcs.com がファイルにアクセスできません');
    } else {
      console.error(`💥 予期しないエラー: ${error.message}`);
    }
    
    console.error('\n詳細エラー:', error);
  }
}

testDomainDelegation().catch(console.error); 