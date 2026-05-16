import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin()
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? null);
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const row: Record<string, unknown> = {
    user_id: session.user.id,
    enabled_types: body.enabledTypes,
    new_cards_today: body.newCardsToday,
    today_date: body.todayDate,
    total_reviewed: body.totalReviewed,
    updated_at: new Date().toISOString(),
  };
  if (typeof body.activeLanguage === 'string') row.active_language = body.activeLanguage;
  if (typeof body.streakDays === 'number') row.streak_days = body.streakDays;
  if (typeof body.lastReviewDate === 'string') row.last_review_date = body.lastReviewDate;
  if (body.dailyNewLimit === null || typeof body.dailyNewLimit === 'number') {
    row.daily_new_limit = body.dailyNewLimit;
  }
  const { error } = await supabaseAdmin()
    .from('user_settings')
    .upsert(row, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
