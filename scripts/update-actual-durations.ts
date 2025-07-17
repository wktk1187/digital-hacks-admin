import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { getActualMeetingDuration, estimateActualMeetingDuration } from '../lib/driveUtils';

// 環境変数を読み込み
dotenv.config();

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

interface MeetingRecord {
  id: number;
  title: string;
  video_urls: string[];
  duration_minutes: number;
  actual_duration_minutes: number | null;
}

async function updateActualDurations() {
  console.log('🎬 実際の面談時間更新スクリプト開始...');
  
  try {
    // 動画URLがあり、actual_duration_minutesがnullのレコードを取得
    const { data: meetings, error } = await supabaseAdmin
      .from('meeting_history')
      .select('id, title, video_urls, duration_minutes, actual_duration_minutes')
      .not('video_urls', 'is', null)
      .is('actual_duration_minutes', null);
    
    if (error) {
      throw new Error(`Failed to fetch meetings: ${error.message}`);
    }
    
    if (!meetings || meetings.length === 0) {
      console.log('✅ 更新対象のミーティングがありません');
      return;
    }
    
    console.log(`📋 ${meetings.length}件のミーティングを処理します...`);
    
    let successCount = 0;
    let estimateCount = 0;
    let errorCount = 0;
    
    for (const meeting of meetings as MeetingRecord[]) {
      try {
        console.log(`\n🔄 処理中: ${meeting.title}`);
        
        // ハイブリッドアプローチ：Drive API + 推定
        const actualDuration = await estimateActualMeetingDuration(
          meeting.video_urls, 
          meeting.duration_minutes
        );
        
        if (actualDuration !== null) {
          // データベースを更新
          const { error: updateError } = await supabaseAdmin
            .from('meeting_history')
            .update({ actual_duration_minutes: actualDuration })
            .eq('id', meeting.id);
          
          if (updateError) {
            throw new Error(`Failed to update meeting ${meeting.id}: ${updateError.message}`);
          }
          
          // Drive APIで取得できたか推定値かを判定
          const isEstimate = actualDuration === meeting.duration_minutes;
          if (isEstimate) {
            console.log(`📊 推定値で更新: ${actualDuration}分`);
            estimateCount++;
          } else {
            console.log(`✅ 実測値で更新: ${actualDuration}分`);
            successCount++;
          }
        } else {
          console.log(`⚠️  時間を取得できませんでした`);
          errorCount++;
        }
        
        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ エラー: ${meeting.title}`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 処理完了:`);
    console.log(`✅ 実測値: ${successCount}件`);
    console.log(`📊 推定値: ${estimateCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // 更新後の統計を表示
    const { data: stats } = await supabaseAdmin
      .from('meeting_history')
      .select('actual_duration_minutes, duration_minutes')
      .not('actual_duration_minutes', 'is', null);
    
    if (stats) {
      const actualDurations = stats.map(s => s.actual_duration_minutes);
      const scheduledDurations = stats.map(s => s.duration_minutes);
      
      const avgActual = actualDurations.reduce((a, b) => a + b, 0) / actualDurations.length;
      const avgScheduled = scheduledDurations.reduce((a, b) => a + b, 0) / scheduledDurations.length;
      const minDuration = Math.min(...actualDurations);
      const maxDuration = Math.max(...actualDurations);
      
      console.log(`\n📈 面談時間統計:`);
      console.log(`実際の平均: ${Math.round(avgActual)}分`);
      console.log(`予定の平均: ${Math.round(avgScheduled)}分`);
      console.log(`最短: ${minDuration}分`);
      console.log(`最長: ${maxDuration}分`);
      console.log(`データ数: ${actualDurations.length}件`);
      
      // 実測値と推定値の比率
      const realValues = stats.filter(s => s.actual_duration_minutes !== s.duration_minutes).length;
      const estimatedValues = stats.filter(s => s.actual_duration_minutes === s.duration_minutes).length;
      console.log(`実測値: ${realValues}件, 推定値: ${estimatedValues}件`);
    }
    
  } catch (error) {
    console.error('❌ スクリプト実行エラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
updateActualDurations()
  .then(() => {
    console.log('🎉 スクリプト正常終了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 スクリプト異常終了:', error);
    process.exit(1);
  });

export { updateActualDurations }; 