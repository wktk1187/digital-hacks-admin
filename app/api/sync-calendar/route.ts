import { NextRequest, NextResponse } from 'next/server';
import { dailySync, bulkSync } from '../../../scripts/sync-gcal-to-stats';

export async function POST(req: NextRequest) {
  try {
    const { type, startDate, endDate } = await req.json();
    
    if (type === 'daily') {
      console.log('Starting daily sync...');
      const result = await dailySync();
      return NextResponse.json({ 
        success: true, 
        message: 'Daily sync completed',
        result 
      });
    } else if (type === 'bulk' && startDate && endDate) {
      console.log(`Starting bulk sync from ${startDate} to ${endDate}...`);
      const result = await bulkSync(startDate, endDate);
      return NextResponse.json({ 
        success: true, 
        message: `Bulk sync completed from ${startDate} to ${endDate}`,
        result 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid request parameters' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 