import { createClient } from '@supabase/supabase-js';
import { SESSIONS, type Session, type SessionDay, type SessionFormat } from '@/data/sessions';

/**
 * Server-side read of the admin-managed conference programme.
 *
 * Deliberately uses a plain anon client rather than lib/supabase/server.ts:
 * that helper reads cookies(), which would opt every consuming page out of
 * static generation. The programme is public data (RLS allows anon SELECT),
 * so no session context is needed and ISR keeps working.
 *
 * Falls back to the checked-in SESSIONS when the table is empty or unreachable,
 * so the public programme never renders blank.
 */

interface ProgramSessionRow {
  id: string;
  day: number;
  time_slot: string;
  title: string;
  subtitle: string | null;
  format: string;
  number: string | null;
  panellists: Array<{ name: string; organisation?: string; role?: string }> | null;
  key_areas: string[] | null;
  questions: string[] | null;
  notes: string | null;
  is_break: boolean;
  sort_order: number;
}

function rowToSession(row: ProgramSessionRow): Session {
  return {
    id: row.id,
    number: row.number ?? undefined,
    day: (row.day === 2 ? 'day_2' : 'day_1') as SessionDay,
    time: row.time_slot,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    format: row.format as SessionFormat,
    panellists: row.panellists?.length ? row.panellists : undefined,
    questions: row.questions?.length ? row.questions : undefined,
    keyAreas: row.key_areas?.length ? row.key_areas : undefined,
    notes: row.notes ?? undefined,
    isBreak: row.is_break,
  };
}

export async function fetchProgramSessionsServer(): Promise<Session[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return SESSIONS;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from('program_sessions')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return SESSIONS;
    }

    return (data as ProgramSessionRow[]).map(rowToSession);
  } catch {
    return SESSIONS;
  }
}
