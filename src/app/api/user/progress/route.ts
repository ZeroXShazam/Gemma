import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await supabaseAdmin()
    .from('user_card_progress')
    .select('*')
    .eq('user_id', session.user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const row: Record<string, unknown> = {
    user_id: session.user.id,
    card_id: body.cardId,
    ease: body.ease,
    interval_days: body.interval,
    reps: body.reps,
    lapses: body.lapses,
    due: body.due,
    state: body.state,
    step: body.step,
    updated_at: new Date().toISOString(),
  };
  if (body.exampleMisses && typeof body.exampleMisses === 'object') {
    row.example_misses = body.exampleMisses;
  }
  if (typeof body.recentResults === 'string') {
    row.recent_results = body.recentResults;
  }
  if (typeof body.lastExampleIdx === 'number' && body.lastExampleIdx >= 0) {
    row.last_example_idx = body.lastExampleIdx;
  }
  const { error } = await supabaseAdmin()
    .from('user_card_progress')
    .upsert(row, { onConflict: 'user_id,card_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
