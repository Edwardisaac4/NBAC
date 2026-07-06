import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { StateSection } from "@/components/sections/state-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { CommitteeSection } from "@/components/sections/committee-section";
import { AudienceSection } from "@/components/sections/audience-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { SponsorsStrip } from "@/components/sections/sponsors-strip";
import { Footer } from "@/components/layout/footer";
import { SectionBlur } from "@/components/shared/section-blur";
import { Preloader } from "@/components/shared/preloader";

export default function Home() {
  return (
    <>
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
          <TestimonialsSection />
        </SectionBlur>
        <SectionBlur intensity={4} minOpacity={0.75}>
          <SponsorsStrip />
        </SectionBlur>
      </main>
      <Footer />
    </>
  );
}
