import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { SectionBlur } from "@/components/shared/section-blur"
import { EventProgramHero } from "@/components/sections/event-program-hero"
import { EventsSchedule } from "@/components/sections/events-schedule"
import { MOCK_EVENTS } from "@/lib/mock-events"
import { notFound } from "next/navigation"

interface EventProgramPageProps {
  params: Promise<{
    id: string
  }>
}

// Statically generate the event program pages for performance and SEO
export async function generateStaticParams() {
  return MOCK_EVENTS.map(event => ({
    id: event.id
  }))
}

export default async function EventProgramPage({ params }: EventProgramPageProps) {
  const { id } = await params
  
  // Find the requested event
  const event = MOCK_EVENTS.find(e => e.id === id)
  
  if (!event) {
    notFound()
  }

  return (
    <PageTransition>
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
    </PageTransition>
  )
}
