import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 環境変数を読み込み
dotenv.config();

// Supabaseクライアントを直接作成
const supabaseUrl = 'https://cyoekflphqaourvhbxfn.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5b2VrZmxwaHFhb3VydmhieGZuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY0OTM5MiwiZXhwIjoyMDY2MjI1MzkyfQ.NGs-XYN00EhmPZAh-zmjAeBXIs3X7R54I2K4pxSKbHI';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function clearAllData() {
  console.log('🗑️ データクリア開始...');

  try {
    // meeting_historyテーブルのデータを削除
    console.log('meeting_historyテーブルをクリア中...');
    const { error: historyError } = await supabaseAdmin
      .from('meeting_history')
      .delete()
      .neq('id', 0); // 全件削除

    if (historyError) {
      console.error('meeting_history削除エラー:', historyError);
    } else {
      console.log('✅ meeting_historyテーブルをクリアしました');
    }

    // 統計テーブルのデータを削除
    const statsTables = [
      'stats_all_daily',
      'stats_all_monthly', 
      'stats_all_yearly',
      'stats_all_total',
      'stats_teacher_daily',
      'stats_teacher_monthly',
      'stats_teacher_yearly',
      'stats_teacher_total'
    ];

    for (const table of statsTables) {
      console.log(`${table}テーブルをクリア中...`);
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', 0); // 全件削除

      if (error) {
        console.error(`${table}削除エラー:`, error);
      } else {
        console.log(`✅ ${table}テーブルをクリアしました`);
      }
    }

    console.log('🎉 データクリア完了！');

  } catch (error) {
    console.error('データクリア中にエラーが発生:', error);
  }
}

// スクリプト実行
clearAllData(); 