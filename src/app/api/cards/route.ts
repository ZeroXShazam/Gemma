import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { ALL_LANGUAGES, type CardDef, type Language } from '@/lib/types';

function isLanguage(v: string | null): v is Language {
  return v !== null && (ALL_LANGUAGES as readonly string[]).includes(v);
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const langParam = req.nextUrl.searchParams.get('language');
  const language: Language = isLanguage(langParam) ? langParam : 'de';

  const { data, error } = await supabaseAdmin()
    .from('card')
    .select('id, language, type, level, data')
    .eq('language', language);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cards: CardDef[] = (data ?? []).map((row) => ({
    ...(row.data as Omit<CardDef, 'id' | 'language' | 'type' | 'level'>),
    id: row.id as string,
    language: row.language as Language,
    type: row.type,
    level: row.level,
  }));

  return NextResponse.json(cards);
}
