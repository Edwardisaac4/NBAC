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

export type SessionDay = 'day_1' | 'day_2';
export type SpeakerStatus = 'confirmed' | 'tbc';

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company?: string;        // Keep for backward compatibility with mock-events
  organisation?: string;   // e.g. "SAHCO"
  avatar_url?: string;     // placeholder image if not provided
  session_title?: string;  // name of the panel they're speaking at
  session_day?: SessionDay;
  session_time?: string;    // e.g. "11:30 AM"
  topic?: string;          // short topic label e.g. "Industry Dialogue"
  bio?: string;            // full bio paragraph
  linkedin_url?: string;
  status?: SpeakerStatus;
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

export type BillingModel = 'per_delegate' | 'package';

export type SponsorTier = 'title' | 'platinum' | 'gold' | 'silver' | 'bronze';

export interface SponsorTierDetails {
  id: SponsorTier;
  name: string;
  price: number;
  currency: 'USD';
  description: string;
  brandingPrivileges: string[];
  speakingPrivileges: string[];
  digitalPrivileges: string[];
  availability: 'available' | 'limited' | 'sold_out';
  badge?: string;
  slotsAvailable?: number;
}

export interface PassTierDetails {
  id: PassTier;
  name: string;
  price: number;
  currency: 'USD';
  privileges: string[];
  availability: 'available' | 'limited' | 'sold_out';
  badge?: string;
  billingModel: BillingModel;
  includedDelegates?: number;
}


// Content Manager
export type PostTemplate =
  | 'announcement'
  | 'press_release'
  | 'visual_showcase'
  | 'sponsor_update'
  | 'event_copy'
  | 'blank';

export type PostVisibility = 'draft' | 'published';

export type AutoSaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved';

// Keep old names as aliases for backward compatibility if any imports exist
export type ContentType = PostTemplate;
export type ContentStatus = PostVisibility;

export interface ContentPost {
  id?:               string;
  title:             string;
  slug?:             string;
  type:              PostTemplate;
  status:            PostVisibility;
  body:              string;
  author_id?:        string;
  author_name?:      string;
  cover_image_url?:  string;
  meta_title?:       string;
  meta_description?: string;
  focus_keyword?:    string;
  created_at?:       string;
  updated_at?:       string;
  featured_image?:   string; // keep for backward compatibility
}

export interface StudioState {
  title:            string;
  slug:             string;
  category:         PostTemplate;
  authorName:       string;
  coverImageUrl:    string;
  body:             string;
  metaTitle:        string;
  metaDescription:  string;
  focusKeyword:     string;
  visibility:       PostVisibility;
  autoSaveStatus:   AutoSaveStatus;
  selectedTemplate: PostTemplate | null;
  wordCount:        number;
}

export interface TemplateCardData {
  id:          PostTemplate;
  label:       string;
  descriptor:  string;
  icon:        string;   // emoji placeholder until design assets ready
}

export interface ContentPostFormData {
  title: string;
  type: PostTemplate;
  status: PostVisibility;
  body: string;
  author_name: string;
  cover_image_url?: string;
}

// Inquiries
export type InquiryType = 'general' | 'aerolabs' | 'sponsorship' | 'registration' | 'aircraft_display' | 'others';
export type InquiryStatus = 'open' | 'in_progress' | 'resolved';

export interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  inquiry_type: InquiryType;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

// Media
export interface MediaFile {
  id: string;
  file_name: string;
  file_url: string;
  storage_path: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  sort_order: number;
  category: 'Conference' | 'Exhibition' | 'Gala Dinner' | 'Networking';
  year: '2026' | '2017' | '2016' | '2014' | '2013';
}

// Admin logs
export type LogAction = 'published' | 'edited' | 'deleted' | 'login' | 'logout' | 'permission_changed';

export interface AdminLog {
  id: string;
  admin_id: string;
  admin?: AdminUser;
  action: LogAction;
  target?: string;
  ip_address?: string;
  created_at: string;
}

// Hotel
export interface PartnerHotel {
  id: string;
  name: string;
  stars: number;
  distance_km: number;
  promo_code: string;
  amenities: string[];
  image_url?: string;
  booking_url: string;
}

// FBO / Flight logistics
export interface FBOTerminal {
  id: string;
  name: string;
  icao_code: string;
  location: string;
  services: string[];
  phone: string;
  email: string;
  coordinates?: { lat: number; lng: number };
}

// Form schemas (Zod/Form validation)
export interface RegistrationFormData {
  pass_tier: PassTier;
  full_name: string;
  company: string;
  email: string;
  phone: string;
  delegate_count: number;
  special_requirements?: string;
}

export interface InquiryFormData {
  full_name: string;
  company?: string;
  email: string;
  phone?: string;
  inquiry_type: InquiryType;
  message: string;
}

// API responses
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Paystack
export interface PaystackResponse {
  reference: string;
  status: 'success' | 'failed';
  trans: string;
  transaction: string;
  message: string;
}

// Committee
export interface CommitteeMember {
  name: string;
  role: string;
  image: string;
  objectPosition?: string;
  bio?: string;
}

