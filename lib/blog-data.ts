import { ContentPost, ContentType, ContentStatus } from '@/types'

export interface BlogPost extends ContentPost {
  author: string; // Friendly name of the author
  read_time?: string; // e.g. "8 Min Read"
}

export const DEFAULT_POSTS: BlogPost[] = [
  {
    id: 'post_featured',
    title: 'Redefining the West African Aviation Corridor',
    type: 'press_release' as ContentType,
    status: 'published' as ContentStatus,
    author: 'Capt. Ibrahim Musa',
    author_id: 'user_admin',
    read_time: '8 Min Read',
    created_at: '2026-06-30T14:30:00Z',
    updated_at: '2026-06-30T14:30:00Z',
    featured_image: '/images/private_jet_runway_dusk.png',
    body: `# Redefining the West African Aviation Corridor

Business aviation in West Africa is undergoing a profound structural shift. For decades, private flight operations across the region were seen as an exclusive luxury for billionaires and state officials. Today, they are a vital macroeconomic driver, carrying corporate decision-makers, logistics specialists, and cargo rapidly across high-growth borders.

## The Infrastructure Imperative

At the center of this transformation is the physical and digital infrastructure that connects Nigeria, Ghana, Senegal, and Côte d'Ivoire. The air corridor connecting Lagos, Abuja, Accra, and Abidjan is currently one of the busiest business flight paths on the continent.

\`\`\`
Lagos (LOS) ◄────────── 60 mins ──────────► Accra (ACC)
     │                                         ▲
     │                                         │
 50 mins                                    75 mins
     │                                         │
     ▼                                         ▼
Abuja (ABV) ◄────────── 90 mins ──────────► Abidjan (ABJ)
\`\`\`

To support this volume of corporate flights, FBO (Fixed Base Operator) terminals are upgrading rapidly. These private terminals now provide fast-track customs clearance, dedicated hangar space, and premium executive lounges that allow business travelers to bypass crowded main airport terminals entirely.

## Regulatory Harmonization

However, hardware is only half the battle. Software—in the form of policy, flight permits, and safety oversight—remains the key challenge. 

Historically, obtaining landing and overflight permits for a multi-leg journey in West Africa could take up to 48 hours and required navigating different regulatory bureaus. Under new initiatives being discussed at the Nigerian Business Aviation Conference (NBAC), civil aviation authorities are collaborating to:
* **Standardize Permit Approval Times:** Aiming for a unified digital application portal that processes permits within 4 hours.
* **Ease Aircraft Importing and Leasing:** Designing friendly regulatory pathways that reduce the cost of leasing foreign-registered corporate aircraft for local operators.
* **Unify Air Traffic Management:** Integrating cloud-based radar tracking systems across borders.

> "A single business trip should not be bottlenecked by fragmented bureaucracies. If we can fly from Lagos to Accra with the ease of a domestic flight, we unlock millions of dollars in regional trade."
> — *Organizing Committee*

## The Path Forward

As the regulatory frameworks align with modern operations, the economic horizon looks incredibly bright. Local airlines and corporate flight departments are already expanding their fleets with super-midsize and long-range aircraft. The upcoming conference in Lagos will be a critical step toward signing bilateral logistics agreements that will cement the corridor as West Africa's primary economic engine.
`
  },
  {
    id: 'post_saf',
    title: 'Sustainable Aviation Fuel (SAF) in Nigeria: Feasibility & Logistics',
    type: 'announcement' as ContentType,
    status: 'published' as ContentStatus,
    author: 'Dr. Amina Olaye',
    author_id: 'user_admin',
    read_time: '6 Min Read',
    created_at: '2026-06-28T10:00:00Z',
    updated_at: '2026-06-28T10:00:00Z',
    featured_image: '/images/interior_cabin.jpg',
    body: `# Sustainable Aviation Fuel (SAF) in Nigeria: Feasibility & Logistics

As global business aviation commits to achieving net-zero carbon emissions by 2050, Sustainable Aviation Fuel (SAF) has emerged as the most critical technological lever. In Nigeria, the conversation is shifting from global targets to local feasibility and supply chain logistics.

## The Biofuel Advantage

Sustainable Aviation Fuel, produced from renewable waste resources (such as agricultural residues and used cooking oils), can reduce lifecycle carbon emissions by up to 80% compared to conventional jet fuel. It is a "drop-in" fuel, meaning it can be blended with traditional Jet A-1 and used in existing aircraft engines and airport fueling systems without modifications.

For Nigeria—an agricultural powerhouse—the opportunity to produce SAF locally from abundant agricultural waste is immense. 

\`\`\`
[Agricultural Waste] ──► [Local Bio-Refinery] ──► [SAF Blending Facility] ──► [Direct Hangar Fueling]
\`\`\`

## Logistical Challenges on the Horizon

Despite the promise, establishing a SAF supply chain along the Lagos-Abuja corridor presents unique hurdles:
1. **Refining Capacity:** Currently, there are no commercial bio-refineries in West Africa capable of producing certified ASTM D7566 SAF blends.
2. **Distribution Pipelines:** Transporting blended SAF from coastal refineries to inland airports like Abuja requires dedicated or clean infrastructure to prevent contamination.
3. **Price Premium:** SAF currently costs 2 to 4 times more than fossil-based jet fuel globally. Offtake agreements from major corporate flight departments will be required to justify initial investments in local production.

## Leading the Regional Green Transition

As West Africa's leading economy, Nigeria is positioned to set the standard. The civil aviation authority is reviewing policy guidelines to provide tax incentives for operators utilizing SAF blends. The future of corporate flight must be sustainable, and local production will be the key to making green flight economically viable.
`
  },
  {
    id: 'post_fbo',
    title: 'The Rise of FBO Infrastructure: High-End Terminals in West Africa',
    type: 'announcement' as ContentType,
    status: 'published' as ContentStatus,
    author: 'Samuel Akenzua',
    author_id: 'user_admin',
    read_time: '5 Min Read',
    created_at: '2026-06-25T11:15:00Z',
    updated_at: '2026-06-25T11:15:00Z',
    featured_image: '/images/about_us_aviation.png',
    body: `# The Rise of FBO Infrastructure in West Africa

For international business executives and high-net-worth delegates, a private jet is not just a mode of transport—it is a mobile office. The quality of a journey is heavily dependent on the ground handling and private terminal facilities, known in the aviation industry as Fixed Base Operators (FBOs).

## Premium Terminal Lounge Strategy

In major cities like Lagos, Abuja, Accra, and Abidjan, FBOs are undergoing a major evolution. Private investments in premium terminal operations are creating self-contained VIP sanctuaries. These facilities offer:
* **Dedicated CIQ (Customs, Immigration, Quarantine):** Allowing executive passengers to complete entry and exit protocols in under 5 minutes in a private environment.
* **Secure Direct Apron Access:** Seamless transition from executive vehicles to the aircraft stairs.
* **Private Business Suites:** Secure meeting rooms equipped with high-speed satellite internet and conferencing tools.
* **Crew Accommodations:** Relaxing lounges and rest areas for flight crews during ground halts.

\`\`\`
+-------------------------------------------------------------+
|                     Modern FBO Sanctuary                    |
|  +------------------+  +-----------------+  +------------+  |
|  |  VIP Boardrooms  |  | Executive Lounge|  | Crew Suite |  |
|  +------------------+  +-----------------+  +------------+  |
|                         [Secure CIQ Gate]                   |
|                                 │                           |
|                                 ▼                           |
|                           [Private Apron]                   |
+-------------------------------------------------------------+
\`\`\`

## Decentralizing Travel Hubs

Historically, private jet traffic in West Africa was centered heavily in Lagos. Today, Accra and Nairobi have emerged as significant regional hubs, with new luxury terminal designs launching to accommodate cross-border charter routes. 

As FBO networks expand, operators can offer reliable, premium ground services across multiple stops, facilitating business travel in emerging frontier markets.
`
  },
  {
    id: 'post_traffic',
    title: 'Digital Air Traffic Management: Cloud Radar & Airspace Optimization',
    type: 'announcement' as ContentType,
    status: 'published' as ContentStatus,
    author: 'Chief Coordinator',
    author_id: 'user_admin',
    read_time: '7 Min Read',
    created_at: '2026-06-20T09:00:00Z',
    updated_at: '2026-06-20T09:00:00Z',
    featured_image: '/images/hero_jet.jpg',
    body: `# Digital Air Traffic Management: Cloud Radar & Airspace Optimization

Aviation safety and efficiency begin long before an aircraft lands on the runway. In crowded air corridors, optimized air traffic management (ATM) is the invisible backbone that prevents delays, reduces fuel burn, and ensures safety.

## Implementing Next-Gen Surveillance

Historically, radar coverage across certain regions of sub-Saharan Africa had gaps, forcing controllers to rely on procedural separation (time and distance reports from pilots). 

Today, the integration of **ADS-B (Automatic Dependent Surveillance-Broadcast)** and cloud-based radar tracking systems is transforming airspace visibility. Aircraft automatically broadcast their precise GPS position, altitude, and velocity to ground stations and other aircraft, creating a high-fidelity real-time map of the sky.

\`\`\`
[Satellite GPS] ──► [Aircraft Transponder] ──► [ADS-B Ground Station] ──► [Cloud Radar System]
                                                                                  │
                                                                                  ▼
                                                                        [ATC Display Console]
\`\`\`

## The Benefits of Optimization

Airspace optimization has direct operational benefits for corporate operators:
1. **Direct Routing:** Real-time tracking allows controllers to route aircraft along the most direct flight paths, saving up to 15% in flight duration.
2. **Lower Fuel Burn:** Efficient descents (Continuous Descent Operations) prevent aircraft from stepping down in altitude, which consumes excessive fuel.
3. **Reduced Separation Minimums:** Allowing more aircraft to share the same airspace safely increases flight frequency and terminal capacity.

At the upcoming NBAC sessions, airspace directors will meet to discuss a unified satellite tracking agreement that will link West African ATC centers together, closing the gaps in regional tracking forever.
`
  },
  {
    id: 'post_1',
    title: 'Nigerian Business Aviation Outlook 2026 Report Released',
    type: 'press_release' as ContentType,
    status: 'published' as ContentStatus,
    author: 'Chief Coordinator',
    author_id: 'user_admin',
    read_time: '5 Min Read',
    created_at: '2026-06-25T14:30:00Z',
    updated_at: '2026-06-25T14:30:00Z',
    featured_image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=600&auto=format&fit=crop',
    body: `# Nigerian Business Aviation Outlook 2026

We are proud to release the official **NBAC Business Aviation Outlook Report for 2026**. This comprehensive document covers traffic data, regulatory developments, and market forecasts for Nigeria and the wider West African region.

## Key Highlights from the Report
* **Traffic Growth:** International private jet movements in Lagos and Abuja increased by **12%** year-on-year.
* **Fleet Expansion:** Over **15 new corporate aircraft** were registered in West Africa during the last 18 months.
* **FBO Infrastructure:** Ground handling services have seen a **25% increase** in capital investment.
`
  },
  {
    id: 'post_2',
    title: 'Keynote Panelist Confirmation: Ministry officials confirmed',
    type: 'announcement' as ContentType,
    status: 'published' as ContentStatus,
    author: 'Staff Editor',
    author_id: 'user_admin',
    read_time: '4 Min Read',
    created_at: '2026-06-20T09:15:00Z',
    updated_at: '2026-06-20T09:15:00Z',
    featured_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop',
    body: `# Keynote Panel Confirmations

The NBAC Organizing Committee is excited to confirm that directors from the **Nigerian Civil Aviation Authority (NCAA)** and the **Federal Airports Authority of Nigeria (FAAN)** will participate in our Day 1 plenary panel.

> **Highlight: Regulation Panel**
> Plenary Session focused on cross-border logistics and private terminal slots.
`
  },
  {
    id: 'post_3',
    title: 'Sponsorship slots now closed for Hangar Exhibitors',
    type: 'sponsor_update' as ContentType,
    status: 'draft' as ContentStatus,
    author: 'Staff Editor',
    author_id: 'user_admin',
    read_time: '3 Min Read',
    created_at: '2026-06-28T17:00:00Z',
    updated_at: '2026-06-28T17:00:00Z',
    featured_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
    body: `# Sponsorship Announcement: Hangar Slots Closed

Please note that all **exhibitor booths and hangar display slots** for the NBAC 2026 exhibition have now been fully reserved.

## What next?
* Standard Delegate and VIP Passes are still available.
* Advertising slots in the official conference directory remain open until **October 1st**.
`
  }
]


import { createClient } from './supabase/client'

// Safely get posts on client side (to support localStorage in Next.js CSR)
export function getStoredPosts(): BlogPost[] {
  if (typeof window === 'undefined') {
    return DEFAULT_POSTS
  }
  
  const local = localStorage.getItem('nbac-blog-posts')
  if (!local) {
    localStorage.setItem('nbac-blog-posts', JSON.stringify(DEFAULT_POSTS))
    return DEFAULT_POSTS
  }
  
  try {
    const parsed = JSON.parse(local) as BlogPost[];
    
    // Deduplicate posts by ID to prevent key duplication errors
    const seen = new Set<string>();
    const deduped: BlogPost[] = [];
    let hasDuplicates = false;
    
    for (const post of parsed) {
      if (!post.id) continue;
      if (seen.has(post.id)) {
        hasDuplicates = true;
        continue;
      }
      seen.add(post.id);
      deduped.push(post);
    }
    
    if (hasDuplicates) {
      localStorage.setItem('nbac-blog-posts', JSON.stringify(deduped));
    }
    
    return deduped;
  } catch (e) {
    console.error('Failed to parse blog posts from localStorage', e)
    return DEFAULT_POSTS
  }
}

// Safely save posts
export function saveStoredPosts(posts: BlogPost[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nbac-blog-posts', JSON.stringify(posts))
  }
}

// Asynchronous database-driven blog helpers
export async function getDbPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching posts from Supabase:', error.message)
      return DEFAULT_POSTS
    }

    // Seed default posts if database is empty
    if (!data || data.length === 0) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('Database posts table is empty, seeding defaults...')
        const { error: seedError } = await supabase.from('posts').insert(DEFAULT_POSTS)
        if (seedError) {
          console.error('Failed to seed default posts:', seedError.message)
        }
      }
      return DEFAULT_POSTS
    }

    return data as BlogPost[]
  } catch (err) {
    console.error('Failed to read from Supabase posts table:', err)
    return DEFAULT_POSTS
  }
}

export async function saveDbPost(post: BlogPost): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .upsert(post)

    if (error) {
      console.error('Error saving post to Supabase:', error.message)
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save to Supabase posts table:', err)
    return false;
  }
}

export async function deleteDbPost(id: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting post from Supabase:', error.message)
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete from Supabase posts table:', err)
    return false;
  }
}

export async function logAdminActivity(
  action: 'login' | 'logout' | 'published' | 'edited' | 'deleted' | 'permission_changed',
  target: string
): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Skip the audit entry if no authenticated user is found
    if (!user) {
      return;
    }
    
    const adminEmail = user.email || 'unknown'
    const roleVal = (user.app_metadata?.role as string) || 'unknown'
    
    // Client-side call context: secure IP tracking is not available directly on the client.
    const clientActivityContext = 'client-side'
 
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_email: adminEmail,
        role: roleVal === 'head_admin' ? 'Head Admin' : roleVal === 'editor' ? 'Editor' : roleVal,
        action,
        target,
        ip_address: clientActivityContext
      })
      
    if (error) {
      console.error('Failed to write audit log:', error.message)
    }
  } catch (err) {
    console.error('Audit logger failed:', err)
  }
}


