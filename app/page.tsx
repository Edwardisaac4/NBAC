import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { StateSection } from "@/components/sections/state-section";
import { ChairmansWelcome } from "@/components/sections/chairmans-welcome";
import { ExperienceSection } from "@/components/sections/experience-section";
import { CommitteeSection } from "@/components/sections/committee-section";
import { AudienceSection } from "@/components/sections/audience-section";
import { SponsorsStrip } from "@/components/sections/sponsors-strip";
import { Footer } from "@/components/layout/footer";
import { SectionBlur } from "@/components/shared/section-blur";
import { Preloader } from "@/components/shared/preloader";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Nigerian Business Aviation Conference (NBAC) 2027",
    "description": "West Africa's premier business aviation conference combining elite panels, private aircraft displays, and high-level networking.",
    "startDate": "2027-05-04T08:00:00+01:00",
    "endDate": "2027-05-05T18:00:00+01:00",
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": "Lagos Marriott Hotel Ikeja",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "122 Joel Ogunnaike Street, Ikeja GRA",
        "addressLocality": "Lagos",
        "addressRegion": "Lagos State",
        "addressCountry": "NG"
      }
    },
    "image": [
      "https://nbac.com.ng/images/og-banner.png"
    ],
    "offers": {
      "@type": "AggregateOffer",
      "url": "https://nbac.com.ng/contact/delegate",
      "priceCurrency": "USD",
      "lowPrice": "250",
      "highPrice": "1500",
      "offerCount": "3"
    },
    "organizer": {
      "@type": "Organization",
      "name": "EAN Aviation",
      "url": "https://ean.aero"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Preloader />
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text">
        <HeroSection />
        <SectionBlur>
          <StateSection />
        </SectionBlur>
        <SectionBlur>
          <ExperienceSection />
        </SectionBlur>
        <SectionBlur>
          <CommitteeSection />
        </SectionBlur>
        <SectionBlur>
          <AudienceSection />
        </SectionBlur>
        <SectionBlur>
          <ChairmansWelcome />
        </SectionBlur>
        <SectionBlur intensity={4} minOpacity={0.75}>
          <SponsorsStrip />
        </SectionBlur>
      </main>
      <Footer />
    </>
  );
}
