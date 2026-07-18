import type { Metadata } from "next";
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
import { EventJsonLd } from "@/components/shared/json-ld";

export const metadata: Metadata = {
  title: 'Nigerian Business Aviation Conference 2027',
  description:
    "West Africa's premier business aviation conference. 4–5 May 2027, " +
    "Lagos, Nigeria. One Sky, Many Stakeholders: Building a Connected " +
    "Business Aviation Ecosystem.",
  alternates: { canonical: 'https://nbac.com.ng' },
};

export default function Home() {
  return (
    <>
      <EventJsonLd />
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
