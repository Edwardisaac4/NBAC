import { Metadata } from "next"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionBlur } from "@/components/shared/section-blur"
import { EventProgramHero } from "@/components/sections/event-program-hero"
import { EventsSchedule } from "@/components/sections/events-schedule"
import { EVENTS, buildEvents } from "@/lib/events"
import { fetchProgramSessionsServer } from "@/lib/supabase/program-server"
import { notFound } from "next/navigation"

interface EventProgramPageProps {
  params: Promise<{
    id: string
  }>
}

// The two day pages are fixed; only the sessions inside them come from the
// database, so revalidate periodically instead of rebuilding to publish edits
// made in the admin programme editor.
export const revalidate = 300

// Statically generate the event program pages for performance and SEO
export async function generateStaticParams() {
  return EVENTS.map(event => ({
    id: event.id
  }))
}

// Dynamic per-event metadata for SEO
export async function generateMetadata({ params }: EventProgramPageProps): Promise<Metadata> {
  const { id } = await params
  const event = EVENTS.find(e => e.id === id)

  if (!event) {
    return { title: 'Event Not Found' }
  }

  return {
    title: event.title,
    description: event.description || `${event.title} — ${event.date} at ${event.location}. View the full program schedule.`,
    openGraph: {
      title: event.title,
      description: event.description || `${event.title} — ${event.date} at ${event.location}.`,
      images: event.image_url ? [{ url: event.image_url }] : undefined,
    },
  }
}

export default async function EventProgramPage({ params }: EventProgramPageProps) {
  const { id } = await params

  // Sessions come from the admin-managed program_sessions table, falling back
  // to the checked-in programme when the table is empty or unreachable.
  const sessions = await fetchProgramSessionsServer()
  const event = buildEvents(sessions).find(e => e.id === id)

  if (!event) {
    notFound()
  }

  return (
    <>
      <Navbar />

      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 overflow-hidden">
        {/* Glowing Top Ambient Lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-linear-to-b from-nbac-emerald/5 to-transparent blur-3xl pointer-events-none" />

        {/* Dynamic Event Header */}
        <EventProgramHero 
          title={event.title}
          subtitle={event.subtitle}
          date={event.date}
          location={event.location}
        />

        {/* Reusable Program Timeline */}
        <SectionBlur>
          <EventsSchedule 
            key={event.id}
            sessions={event.sessions} 
            eventId={event.id}
          />
        </SectionBlur>
      </main>

      <Footer />
    </>
  )
}
