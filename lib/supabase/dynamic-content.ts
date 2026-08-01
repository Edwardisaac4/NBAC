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
    currency: 'USD',
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
    currency: 'USD',
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
  const supabase = createClient();
  const { error } = await supabase
    .from('ticket_tiers')
    .upsert({
      id: tier.id,
      name: tier.name,
      badge: tier.badge,
      price: tier.price,
      currency: tier.currency || 'USD',
      description: tier.description,
      privileges: tier.privileges,
      billing_model: tier.billing_model,
      included_delegates: tier.included_delegates,
      availability: tier.availability,
      sort_order: tier.sort_order,
      updated_at: new Date().toISOString(),
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteTicketTier(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('ticket_tiers').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function upsertSponsorTier(tier: SponsorTierRow): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('sponsor_tiers_db')
    .upsert({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      currency: tier.currency || 'USD',
      badge: tier.badge,
      description: tier.description,
      branding_privileges: tier.branding_privileges,
      speaking_privileges: tier.speaking_privileges,
      digital_privileges: tier.digital_privileges,
      availability: tier.availability,
      sort_order: tier.sort_order,
      updated_at: new Date().toISOString(),
    });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteSponsorTier(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('sponsor_tiers_db').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
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

// ─── Re-export row types for admin pages ─────────────────────────

export type { TicketTierRow, SponsorTierRow, ProgramSessionRow };
