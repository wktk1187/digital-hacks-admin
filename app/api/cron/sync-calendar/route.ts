import { NextRequest, NextResponse } from 'next/server';
import { dailyHistorySync } from '../../../../scripts/sync-meeting-history';

export async function GET(req: NextRequest) {
  // Vercel Cronからの認証チェック
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Starting scheduled daily meeting history sync...');
    console.log('Environment check:');
    console.log('- GCAL_CALENDAR_ID:', process.env.GCAL_CALENDAR_ID ? 'SET' : 'NOT SET');
    console.log('- GCAL_SERVICE_ACCOUNT_JSON:', process.env.GCAL_SERVICE_ACCOUNT_JSON ? 'SET' : 'NOT SET');
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
    
    const result = await dailyHistorySync();
    
    console.log('Scheduled meeting history sync completed:', result);
    return NextResponse.json({ 
      success: true, 
      message: 'Daily meeting history sync completed successfully',
      result 
    });
  } catch (error: any) {
    console.error('Scheduled meeting history sync error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 