import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const organizerEmail = searchParams.get('organizerEmail');
    const attendeeName = searchParams.get('attendeeName');
    const category = searchParams.get('category');
    
    // ページネーション用のoffsetを計算
    const offset = (page - 1) * limit;
    
    // クエリビルダーを作成
    let query = supabaseAdmin
      .from('meeting_history')
      .select('*', { count: 'exact' });
    
    // フィルター条件を追加
    if (startDate) {
      query = query.gte('start_time', new Date(startDate).toISOString());
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      query = query.lte('start_time', endDateTime.toISOString());
    }
    if (organizerEmail) {
      query = query.ilike('organizer_email', `%${organizerEmail}%`);
    }
    if (attendeeName) {
      query = query.ilike('attendee_name', `%${attendeeName}%`);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    // ソートとページネーションを追加
    query = query
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, message: 'データベースエラーが発生しました' },
        { status: 500 }
      );
    }
    
    // データを整形
    const meetingHistory = (data || []).map(meeting => ({
      id: meeting.id.toString(),
      title: meeting.title,
      category: meeting.category === 'teacher' ? '講師面談' : '受講開始面談',
      organizerEmail: meeting.organizer_email,
      attendeeName: meeting.attendee_name || '',
      attendeeEmail: meeting.attendee_email || '',
      startTime: meeting.start_time,
      endTime: meeting.end_time,
      duration: meeting.duration_minutes,
      actualDuration: meeting.actual_duration_minutes,
      date: new Date(meeting.start_time).toLocaleDateString('ja-JP'),
      time: new Date(meeting.start_time).toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      description: meeting.description || '',
      location: meeting.location || '',
      documentUrls: meeting.document_urls || [],
      videoUrls: meeting.video_urls || [],
      meetLink: meeting.meet_link || '',
      calendarEventUrl: meeting.calendar_event_url || ''
    }));
    
    // ページネーション情報を計算
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return NextResponse.json({
      success: true,
      data: meetingHistory,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      }
    });
    
  } catch (error: any) {
    console.error('Meeting history fetch error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 