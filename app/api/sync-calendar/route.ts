import { NextRequest, NextResponse } from 'next/server';
import { dailyHistorySync, bulkHistorySync } from '../../../scripts/sync-meeting-history';

export async function POST(req: NextRequest) {
  try {
    const { type, startDate, endDate } = await req.json();
    
    if (type === 'daily') {
      console.log('Starting daily meeting history sync...');
      const result = await dailyHistorySync();
      return NextResponse.json({ 
        success: true, 
        message: 'Daily meeting history sync completed',
        result 
      });
    } else if (type === 'bulk' && startDate && endDate) {
      console.log(`Starting bulk meeting history sync from ${startDate} to ${endDate}...`);
      const result = await bulkHistorySync(startDate, endDate);
      return NextResponse.json({ 
        success: true, 
        message: `Bulk meeting history sync completed from ${startDate} to ${endDate}`,
        result 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid request parameters' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Meeting history sync error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 