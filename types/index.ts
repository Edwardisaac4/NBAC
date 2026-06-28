export type AdminRole = 'head_admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  full_name?: string;
}

export interface Delegate {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  phone?: string;
  created_at: string;
}

// Registration
export type PassTier = 'vip' | 'exhibitor' | 'jet_display';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface Registration {
  id: string;
  delegate_id: string;
  delegate?: Delegate;
  pass_tier: PassTier;
  payment_status: PaymentStatus;
  paystack_reference?: string;
  amount: number;
  booking_date: string;
  special_requirements?: string;
}

// Events page
export type SessionCategory = 'keynote' | 'panel' | 'workshop' | 'break' | 'networking';
export type ConferenceDay = 'day_1' | 'day_2';

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar_url?: string;
  bio?: string;
}

export interface EventSession {
  id: string;
  day: ConferenceDay;
  start_time: string;
  end_time: string;
  category: SessionCategory;
  title: string;
  abstract?: string;
  speakers: Speaker[];
  location?: string;
}

export interface EventDetails {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  description: string;
  image_url: string;
  status: 'featured' | 'upcoming' | 'completed';
  sessions: EventSession[];
}

export interface PassTierDetails {
  id: PassTier;
  name: string;
  price: number;
  currency: 'NGN';
  privileges: string[];
  availability: 'available' | 'limited' | 'sold_out';
  badge?: string;
}

