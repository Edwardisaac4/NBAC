import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { useMediaQuery } from '@/hooks/use-media-query'
import { ABOUT_COMMITTEE_MEMBERS } from '@/lib/constants'

gsap.registerPlugin(ScrollTrigger)

export function AboutCommittee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const isLaptop = useMediaQuery('(min-width: 1024px)', false)
  const [selectedMember, setSelectedMember] = useState<typeof ABOUT_COMMITTEE_MEMBERS[number] | null>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        gsap.set('.committee-card-reveal', { opacity: 1, y: 0 })
        return
      }

      gsap.fromTo(
        '.committee-card-reveal',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.committee-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-canvas px-6 md:px-24 border-b border-nbac-border overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header Block */}
        <div className="text-center max-w-2xl space-y-3 mb-20 md:mb-28">
          <SectionEyebrow>Steering Committee</SectionEyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            Leadership Disclosure
          </h2>
          <div className="h-1 w-24 bg-nbac-gold mx-auto rounded-full mt-4" />
        </div>

        {/* Committee Grid */}
        <div className="committee-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {ABOUT_COMMITTEE_MEMBERS.map((member) => {
            const isPremium = member.role === 'BOARD CHAIRMAN' || member.role === 'STRATEGIC DIRECTOR'
            return (
              <motion.div
                key={member.name}
                onClick={() => setSelectedMember(member)}
                className={`committee-card-reveal opacity-0 bg-nbac-panel border rounded-xl overflow-hidden shadow-md flex flex-col group h-full cursor-pointer transition-colors duration-300 ${
                  isPremium ? 'border-nbac-border hover:border-nbac-gold/40' : 'border-nbac-border hover:border-nbac-emerald/40'
                }`}
                whileHover={isLaptop ? {
                  y: -6,
                  boxShadow: isPremium ? '0 12px 40px rgba(197, 160, 89, 0.08)' : '0 12px 40px rgba(16, 185, 129, 0.08)',
                } : undefined}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* Photo Container */}
                <div className="relative aspect-4/5 w-full overflow-hidden bg-nbac-alt">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover grayscale-0 lg:grayscale lg:group-hover:grayscale-0 scale-100 lg:group-hover:scale-105 transition-all duration-500 ease-out"
                    style={{ objectPosition: member.objectPosition || 'center' }}
                    quality={90}
                    priority={member.image === '/images/sd-nbac.jpg'}
                  />
                  {/* Thin overlay to tie into dark luxury aesthetic */}
                  <div className="absolute inset-0 bg-linear-to-t from-nbac-panel/90 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Info Block */}
                <div className="p-6 grow flex flex-col justify-between">
                  <div>
                    <h3 className={`font-sans text-lg font-bold text-nbac-text tracking-wide transition-colors duration-300 ${
                      isPremium ? 'lg:group-hover:text-nbac-gold-light' : 'lg:group-hover:text-nbac-emerald'
                    }`}>
                      {member.name}
                    </h3>
                    <p className={`font-sans text-xs font-semibold tracking-widest mt-1.5 uppercase ${
                      isPremium ? 'text-nbac-gold-light' : 'text-nbac-emerald-light'
                    }`}>
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* BIO Action Button */}
                <div className={`border-t border-nbac-border p-4 bg-nbac-alt/40 flex justify-center transition-colors duration-300 ${
                  isPremium ? 'lg:group-hover:bg-nbac-gold/5' : 'lg:group-hover:bg-nbac-emerald/5'
                }`}>
                  <span className={`font-sans text-xs uppercase tracking-widest font-bold transition-colors duration-300 flex items-center gap-1.5 select-none ${
                    isPremium ? 'text-nbac-gold lg:group-hover:text-nbac-gold-light' : 'text-nbac-emerald lg:group-hover:text-nbac-emerald-light'
                  }`}>
                    BIO &gt;
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bio Modal Overlay */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-xl"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 24 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              className="relative w-full max-w-3xl bg-nbac-panel/95 border border-nbac-gold/30 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.85)] z-10 flex flex-col md:flex-row max-h-[88vh] backdrop-blur-2xl"
            >
              {/* Background Luxury Ambient Lighting */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-nbac-gold/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-nbac-emerald/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/50 border border-nbac-gold/40 text-nbac-muted hover:text-nbac-gold hover:bg-black/90 hover:scale-105 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg"
                aria-label="Close bio"
              >
                <X size={18} />
              </button>

              {/* Photo Column */}
              <div className="relative w-full md:w-[42%] aspect-[4/5] md:aspect-auto shrink-0 bg-nbac-alt border-b md:border-b-0 md:border-r border-nbac-border/60 overflow-hidden group">
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: selectedMember.objectPosition || 'top' }}
                  sizes="(max-width: 768px) 100vw, 42vw"
                  quality={95}
                />
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-nbac-panel via-nbac-panel/20 to-transparent opacity-90 md:opacity-60 pointer-events-none" />
                
                {/* Floating Member Badge */}
                <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-xl bg-nbac-panel/80 border border-nbac-gold/30 backdrop-blur-md">
                  <p className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-gold">
                    Steering Committee
                  </p>
                  <p className="font-sans text-xs font-semibold text-nbac-text truncate">
                    {selectedMember.name}
                  </p>
                </div>
              </div>

              {/* Details & Bio Scroll Column */}
              <div className="p-6 md:p-10 flex flex-col justify-between overflow-y-auto w-full space-y-6">
                <div className="space-y-6">
                  {/* Title Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-2 w-2 rounded-full bg-nbac-gold animate-pulse" />
                      <span className="font-sans text-xs font-bold tracking-widest uppercase text-nbac-gold">
                        Executive Leadership
                      </span>
                    </div>
                    <h3 className="font-display text-2xl md:text-4xl font-bold text-nbac-text tracking-tight leading-snug">
                      {selectedMember.name}
                    </h3>
                    <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-nbac-gold/10 border border-nbac-gold/30 text-nbac-gold-light text-xs font-semibold tracking-wider uppercase">
                      {selectedMember.role}
                    </div>
                  </div>

                  {/* Accent Line */}
                  <div className="h-0.5 w-full bg-gradient-to-r from-nbac-gold/40 via-nbac-border to-transparent rounded-full" />

                  {/* Bio Paragraphs */}
                  <div className="font-sans text-sm md:text-base text-nbac-body/90 leading-relaxed space-y-4 font-light">
                    {selectedMember.bio ? (
                      selectedMember.bio.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} className={pIdx === 0 ? "first-letter:text-3xl first-letter:font-serif first-letter:font-bold first-letter:text-nbac-gold first-letter:mr-1 first-letter:float-left" : ""}>
                          {paragraph.trim()}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-nbac-muted">Biography details are currently being updated.</p>
                    )}
                  </div>
                </div>

                {/* Footer Tag */}
                <div className="pt-4 border-t border-nbac-border/60 flex items-center justify-between text-xs text-nbac-muted">
                  <span>Nigerian Business Aviation Conference</span>
                  <span className="text-nbac-gold font-semibold">NBAC 2027</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
