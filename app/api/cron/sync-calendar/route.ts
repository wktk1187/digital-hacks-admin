import { NextRequest, NextResponse } from 'next/server';
import { dailySync } from '../../../../scripts/sync-gcal-to-stats';

export async function GET(req: NextRequest) {
  // Vercel Cronからの認証チェック
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Starting scheduled daily sync...');
    const result = await dailySync();
    
    console.log('Scheduled sync completed:', result);
    return NextResponse.json({ 
      success: true, 
      message: 'Daily sync completed successfully',
      result 
    });
  } catch (error: any) {
    console.error('Scheduled sync error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 