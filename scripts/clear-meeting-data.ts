import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 環境変数を読み込み
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearMeetingData() {
  console.log('🗑️ 面談関連データの削除を開始します...');

  try {
    // 1. meeting_historyテーブルのデータを削除
    console.log('📅 meeting_historyテーブルのデータを削除中...');
    const { error: meetingError } = await supabaseAdmin
      .from('meeting_history')
      .delete()
      .gte('id', 0); // 全件削除

    if (meetingError) {
      console.error('❌ meeting_historyの削除でエラー:', meetingError);
      return;
    }
    console.log('✅ meeting_historyテーブルのデータを削除しました');

    // 2. 統計テーブルのデータを削除
    const statsTables = [
      { name: 'stats_teacher_day', condition: 'key_date' },
      { name: 'stats_teacher_month', condition: 'key_year' }, 
      { name: 'stats_all_day', condition: 'key_date' },
      { name: 'stats_all_month', condition: 'key_year' }
    ];

    for (const table of statsTables) {
      console.log(`📊 ${table.name}テーブルのデータを削除中...`);
      const { error } = await supabaseAdmin
        .from(table.name)
        .delete()
        .gte(table.condition, table.condition === 'key_date' ? '1900-01-01' : 1900); // 全件削除

      if (error) {
        console.error(`❌ ${table.name}の削除でエラー:`, error);
        continue;
      }
      console.log(`✅ ${table.name}テーブルのデータを削除しました`);
    }

    console.log('🎉 面談関連データの削除が完了しました！');
    console.log('📝 講師データとadminデータは保持されています');

  } catch (error) {
    console.error('❌ データ削除中にエラーが発生しました:', error);
  }
}

// スクリプトが直接実行された場合のみ実行
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('clear-meeting-data.ts')) {
  clearMeetingData();
}

export { clearMeetingData }; 