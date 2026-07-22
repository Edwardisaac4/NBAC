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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-nbac-panel border border-nbac-border rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#0b0f10]/60 border border-nbac-border text-nbac-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close bio"
              >
                <X size={16} />
              </button>

              {/* Photo Area */}
              <div className="relative w-full md:w-[40%] aspect-[4/5] md:aspect-auto shrink-0 bg-nbac-alt border-b md:border-b-0 md:border-r border-nbac-border">
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                  style={{ objectPosition: selectedMember.objectPosition || 'center' }}
                  sizes="(max-w-7xl) 100vw, 30vw"
                  quality={95}
                />
                <div className="absolute inset-0 bg-linear-to-t from-nbac-panel/90 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* Details & Bio */}
              <div className="p-8 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-nbac-text tracking-wide">
                      {selectedMember.name}
                    </h3>
                    <p className={`font-sans text-xs font-semibold tracking-widest mt-1.5 uppercase ${
                      selectedMember.role === 'BOARD CHAIRMAN' || selectedMember.role === 'CHAIRMAN' || selectedMember.role === 'STRATEGIC DIRECTOR'
                        ? 'text-nbac-gold-light'
                        : 'text-nbac-emerald-light'
                    }`}>
                      {selectedMember.role}
                    </p>
                  </div>
                  <div className="h-px bg-nbac-border" />
                  <div className="font-sans text-sm md:text-base font-light text-nbac-body leading-relaxed max-w-prose space-y-4">
                    {selectedMember.bio ? (
                      selectedMember.bio.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph.trim()}</p>
                      ))
                    ) : (
                      <p>Biography details are currently being updated.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
