'use client';

import { createClient } from '@/lib/supabase/client';
import type { PassTierDetails, SponsorTierDetails } from '@/types';
import type { Session } from '@/data/sessions';
import { PASS_TIERS, SPONSOR_TIERS } from '@/lib/constants';
import { SESSIONS } from '@/data/sessions';

// ─── Row types from Supabase ─────────────────────────────────────

interface TicketTierRow {
  id: string;
  name: string;
  badge: string | null;
  price: number;
  currency: string;
  description: string | null;
  privileges: string[];
  billing_model: string;
  included_delegates: number;
  availability: string;
  sort_order: number;
}

interface SponsorTierRow {
  id: string;
  name: string;
  price: number;
  currency: string;
  badge: string | null;
  description: string;
  branding_privileges: string[];
  speaking_privileges: string[];
  digital_privileges: string[];
  availability: string;
  sort_order: number;
}

interface ProgramSessionRow {
  id: string;
  day: number;
  time_slot: string;
  title: string;
  subtitle: string | null;
  format: string;
  number: string | null;
  panellists: Array<{ name: string; organisation?: string; role?: string }>;
  key_areas: string[];
  questions: string[];
  notes: string | null;
  is_break: boolean;
  sort_order: number;
}

// ─── Ticket Tiers (PassTierDetails) ──────────────────────────────

function rowToPassTier(row: TicketTierRow): PassTierDetails {
  return {
    id: row.id as PassTierDetails['id'],
    name: row.name,
    badge: row.badge ?? undefined,
    price: row.price,
    currency: (row.currency as PassTierDetails['currency']) || 'USD',
    description: row.description ?? undefined,
    privileges: row.privileges ?? [],
    billingModel: row.billing_model as PassTierDetails['billingModel'],
    includedDelegates: row.included_delegates,
    availability: row.availability as PassTierDetails['availability'],
  };
}

export async function fetchTicketTiers(): Promise<PassTierDetails[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ticket_tiers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return PASS_TIERS;
    }

    return (data as TicketTierRow[]).map(rowToPassTier);
  } catch {
    return PASS_TIERS;
  }
}

// ─── Sponsor Tiers (SponsorTierDetails) ──────────────────────────

function rowToSponsorTier(row: SponsorTierRow): SponsorTierDetails {
  return {
    id: row.id as SponsorTierDetails['id'],
    name: row.name,
    price: row.price,
    currency: (row.currency as SponsorTierDetails['currency']) || 'USD',
    badge: row.badge ?? undefined,
    description: row.description,
    brandingPrivileges: row.branding_privileges ?? [],
    speakingPrivileges: row.speaking_privileges ?? [],
    digitalPrivileges: row.digital_privileges ?? [],
    availability: row.availability as SponsorTierDetails['availability'],
  };
}

export async function fetchSponsorTiers(): Promise<SponsorTierDetails[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('sponsor_tiers_db')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return SPONSOR_TIERS;
    }

    return (data as SponsorTierRow[]).map(rowToSponsorTier);
  } catch {
    return SPONSOR_TIERS;
  }
}

// ─── Program Sessions ────────────────────────────────────────────

function rowToSession(row: ProgramSessionRow): Session {
  return {
    id: row.id,
    number: row.number ?? undefined,
    day: row.day === 1 ? 'day_1' : 'day_2',
    time: row.time_slot,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    format: row.format as Session['format'],
    panellists: row.panellists ?? undefined,
    keyAreas: row.key_areas?.length ? row.key_areas : undefined,
    questions: row.questions?.length ? row.questions : undefined,
    notes: row.notes ?? undefined,
    isBreak: row.is_break,
  };
}

export async function fetchProgramSessions(): Promise<Session[]> {
  try {
    const supabase = createClient();
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

// ─── Admin CRUD operations ───────────────────────────────────────

export async function upsertTicketTier(tier: TicketTierRow): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', tier }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to save ticket tier' };
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function deleteTicketTier(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete ticket tier' };
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function upsertSponsorTier(tier: SponsorTierRow): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upsert', tier }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to save sponsor tier' };
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function deleteSponsorTier(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to delete sponsor tier' };
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function upsertProgramSession(session: ProgramSessionRow): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('program_sessions')
    .upsert({
      id: session.id,
      day: session.day,
      time_slot: session.time_slot,
      title: session.title,
      subtitle: session.subtitle,
      format: session.format,
      number: session.number,
      panellists: session.panellists,
      key_areas: session.key_areas,
      questions: session.questions,
      notes: session.notes,
      is_break: session.is_break,
      sort_order: session.sort_order,
      updated_at: new Date().toISOString(),
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteProgramSession(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('program_sessions').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Default Tier Row Constants & Seeding Helpers ────────────────

export const DEFAULT_TICKET_TIER_ROWS: TicketTierRow[] = PASS_TIERS.map((pt, idx) => ({
  id: pt.id,
  name: pt.name,
  badge: pt.badge ?? '',
  price: pt.price,
  currency: pt.currency || 'USD',
  description: pt.description ?? '',
  privileges: pt.privileges || [],
  billing_model: pt.billingModel || 'per_delegate',
  included_delegates: pt.includedDelegates || 1,
  availability: pt.availability || 'available',
  sort_order: idx,
}));

export const DEFAULT_SPONSOR_TIER_ROWS: SponsorTierRow[] = SPONSOR_TIERS.map((st, idx) => ({
  id: st.id,
  name: st.name,
  price: st.price,
  currency: st.currency || 'USD',
  badge: st.badge ?? '',
  description: st.description || '',
  branding_privileges: st.brandingPrivileges || [],
  speaking_privileges: st.speakingPrivileges || [],
  digital_privileges: st.digitalPrivileges || [],
  availability: st.availability || 'available',
  sort_order: idx,
}));

export async function seedDefaultTicketTiers(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed', tiers: DEFAULT_TICKET_TIER_ROWS }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to seed ticket tiers' };
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

export async function seedDefaultSponsorTiers(): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/admin/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed', tiers: DEFAULT_SPONSOR_TIER_ROWS }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to seed sponsor tiers' };
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
}

// ─── Re-export row types for admin pages ─────────────────────────

export type { TicketTierRow, SponsorTierRow, ProgramSessionRow };


