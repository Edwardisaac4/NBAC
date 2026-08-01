'use client'

import { useState } from 'react'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plane, 
  Coins, 
  Leaf, 
  Cpu, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Sparkles, 
  AlertCircle,
  FileCode2,
  Building2,
  Send,
  Check
} from 'lucide-react'
import Link from 'next/link'

const TRACKS = [
  {
    id: 1,
    title: "The Clearance Problem",
    obj: "OBJ 01: Regulatory",
    icon: Plane,
    color: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    desc: "Streamline overflight permits, landing approvals, and multi-agency clearance workflows across Nigerian and West African airspace."
  },
  {
    id: 2,
    title: "Aircraft Finance & Fractional Leasing",
    obj: "OBJ 02: Financial",
    icon: Coins,
    color: "border-amber-500/40 text-amber-400 bg-amber-500/10",
    desc: "Fintech solutions for fractional ownership, escrow, aircraft leasing risk modeling, and cross-border aviation payments in NGN/USD."
  },
  {
    id: 3,
    title: "Sustainable Aviation Fuel (SAF) Tracking",
    obj: "OBJ 03: Sustainability",
    icon: Leaf,
    color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    desc: "Carbon accounting, SAF supply chain verification, and emissions reporting for business jet operators across African hubs."
  },
  {
    id: 4,
    title: "AI Maintenance & Flight Operations",
    obj: "OBJ 04: Technology",
    icon: Cpu,
    color: "border-purple-500/40 text-purple-400 bg-purple-500/10",
    desc: "Predictive maintenance scheduling, real-time parts inventory tracking, and AI flight dispatch optimization for NCAA AMO operators."
  },
  {
    id: 5,
    title: "Aviation Workforce & Training Pipeline",
    obj: "OBJ 05: Human Capital",
    icon: GraduationCap,
    color: "border-teal-500/40 text-teal-400 bg-teal-500/10",
    desc: "Digital platforms for pilot/engineer certification tracking, VR/AR maintenance training, and African aviation talent matching."
  }
]

export default function AeroLabApplyPage() {
  const [selectedTrackId, setSelectedTrackId] = useState<number>(1)
  const [teamName, setTeamName] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [leaderEmail, setLeaderEmail] = useState('')
  const [leaderPhone, setLeaderPhone] = useState('')
  const [organization, setOrganization] = useState('')
  const [memberCount, setMemberCount] = useState<number>(3)
  const [memberRoster, setMemberRoster] = useState('')
  const [proposalTitle, setProposalTitle] = useState('')
  const [conceptNote, setConceptNote] = useState('')
  const [repoOrPortfolioUrl, setRepoOrPortfolioUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

  const selectedTrack = TRACKS.find(t => t.id === selectedTrackId) || TRACKS[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    // Basic Validation
    if (!teamName.trim()) {
      setErrorMsg('Please enter your Team Name.')
      return
    }
    if (!leaderName.trim() || !leaderEmail.trim()) {
      setErrorMsg('Team Leader Name and Email are required.')
      return
    }
    if (!proposalTitle.trim() || !conceptNote.trim()) {
      setErrorMsg('Proposal Title and Concept Note are required.')
      return
    }
    if (!repoOrPortfolioUrl.trim()) {
      setErrorMsg('Code Repository or Demo Link is required.')
      return
    }
    if (conceptNote.trim().length < 30) {
      setErrorMsg('Please provide a slightly more detailed concept note (minimum 30 characters).')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/register/aerolab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          leaderName: leaderName.trim(),
          leaderEmail: leaderEmail.trim(),
          leaderPhone: leaderPhone.trim(),
          organization: organization.trim(),
          trackId: selectedTrack.id,
          trackTitle: selectedTrack.title,
          memberCount,
          memberRoster: memberRoster.trim(),
          proposalTitle: proposalTitle.trim(),
          conceptNote: conceptNote.trim(),
          repoOrPortfolioUrl: repoOrPortfolioUrl.trim()
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application.')
      }

      setSubmittedRef(data.reference)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 pb-16 md:pb-24 px-6 md:px-24">
        <div className="max-w-4xl mx-auto">
          {/* Back to AeroLab link */}
          <div className="mb-8">
            <Link 
              href="/aerolab"
              className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-nbac-muted hover:text-nbac-gold transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to AeroLab Overview</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {submittedRef ? (
              /* Success Screen */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#0b0f10] border border-nbac-emerald/40 rounded-2xl p-8 md:p-12 text-center shadow-2xl space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-nbac-emerald/20 border border-nbac-emerald/40 flex items-center justify-center mx-auto text-nbac-emerald">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <span className="font-sans text-xs font-bold uppercase tracking-widest text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/20 px-3 py-1 rounded-full inline-block mb-3">
                    Application Submitted Successfully
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-nbac-text mb-3">
                    Welcome to the AeroLab Challenge
                  </h2>
                  <p className="font-sans text-sm text-nbac-body max-w-lg mx-auto leading-relaxed">
                    Your application for <strong>{selectedTrack.title}</strong> has been registered under team <strong>{teamName}</strong>.
                  </p>
                </div>

                {/* Reference ID Display Box */}
                <div className="bg-[#12181a] border border-nbac-gold/30 rounded-xl p-5 max-w-md mx-auto">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-nbac-muted block mb-1">
                    Application Reference Number
                  </span>
                  <span className="font-mono text-lg font-bold text-nbac-gold tracking-widest">
                    {submittedRef}
                  </span>
                </div>

                <div className="bg-nbac-panel/40 border border-nbac-border/60 rounded-xl p-5 max-w-lg mx-auto text-left text-xs font-light text-nbac-body leading-relaxed space-y-2">
                  <p className="font-bold text-nbac-text text-sm mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-nbac-gold" />
                    <span>What Happens Next?</span>
                  </p>
                  <p>1. A confirmation email has been dispatched to <strong>{leaderEmail}</strong>.</p>
                  <p>2. The NBAC Technical Steering Committee will evaluate all concept notes.</p>
                  <p>3. Up to 30 cohort teams will be admitted and paired with senior industry mentors.</p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/aerolab"
                    className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full transition-colors"
                  >
                    Return to AeroLab
                  </Link>
                  <Link
                    href="/reservations"
                    className="border border-nbac-border hover:border-nbac-gold/40 text-nbac-text font-sans font-medium text-xs uppercase tracking-widest px-8 py-3.5 rounded-full transition-colors"
                  >
                    Get Conference Pass
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Registration Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                {/* Header */}
                <div className="text-center md:text-left border-b border-nbac-border/50 pb-8">
                  <SectionEyebrow>NBAC 2027 HACKATHON</SectionEyebrow>
                  <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
                    AeroLab <span className="italic text-nbac-emerald font-semibold">Application</span>
                  </h1>
                  <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl">
                    Submit your team entry and concept note for the NBAC 2027 AeroLab Innovation Challenge. Selected cohort teams will receive mentorship, executive showcase space, and compete for ₦5,000,000 in prizes.
                  </p>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Step 1: Select Challenge Track */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-sans text-lg font-bold text-nbac-text flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-nbac-gold/20 text-nbac-gold border border-nbac-gold/30 text-xs font-bold flex items-center justify-center">1</span>
                        <span>Select Challenge Track</span>
                      </h3>
                      <span className="text-xs font-medium text-nbac-emerald">Required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {TRACKS.map((track) => {
                        const Icon = track.icon
                        const isSelected = selectedTrackId === track.id
                        return (
                          <div
                            key={track.id}
                            onClick={() => setSelectedTrackId(track.id)}
                            className={`cursor-pointer rounded-xl p-4 md:p-5 border transition-all duration-200 text-left flex flex-col justify-between ${
                              isSelected 
                                ? 'bg-nbac-panel border-nbac-gold shadow-[0_0_20px_rgba(196,149,42,0.15)] ring-1 ring-nbac-gold/50' 
                                : 'bg-nbac-panel/30 border-nbac-border/60 hover:border-nbac-border hover:bg-nbac-panel/60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${track.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-nbac-gold bg-nbac-gold/10 px-2 py-0.5 rounded border border-nbac-gold/20">
                                    Track 0{track.id}
                                  </span>
                                  {isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-nbac-gold text-[#0b0f10] flex items-center justify-center">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <h4 className="font-sans font-bold text-sm text-nbac-text mb-1">{track.title}</h4>
                              <p className="font-sans font-light text-xs text-nbac-body leading-relaxed">{track.desc}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Step 2: Team Leader Details */}
                  <div className="space-y-4 pt-4 border-t border-nbac-border/40">
                    <h3 className="font-sans text-lg font-bold text-nbac-text flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-nbac-gold/20 text-nbac-gold border border-nbac-gold/30 text-xs font-bold flex items-center justify-center">2</span>
                      <span>Team Leader Details</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                          Team Leader Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          placeholder="e.g. Dr. Babatunde Ogunlesi"
                          className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                          Team Leader Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={leaderEmail}
                          onChange={(e) => setLeaderEmail(e.target.value)}
                          placeholder="babatunde@aviation.ng"
                          className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={leaderPhone}
                          onChange={(e) => setLeaderPhone(e.target.value)}
                          placeholder="+234 803 123 4567"
                          className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                          Organization / University / Company
                        </label>
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="e.g. NCAT Zaria / Aero Contractors"
                          className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Team Roster & Composition */}
                  <div className="space-y-4 pt-4 border-t border-nbac-border/40">
                    <h3 className="font-sans text-lg font-bold text-nbac-text flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-nbac-gold/20 text-nbac-gold border border-nbac-gold/30 text-xs font-bold flex items-center justify-center">3</span>
                      <span>Team Name & Composition</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                          Team Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. AeroClear West Africa"
                          className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                          Team Members (3 to 6) *
                        </label>
                        <select
                          value={memberCount}
                          onChange={(e) => setMemberCount(Number(e.target.value))}
                          className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors cursor-pointer"
                        >
                          <option value={3}>3 Members</option>
                          <option value={4}>4 Members</option>
                          <option value={5}>5 Members</option>
                          <option value={6}>6 Members</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                        Team Roster & Member Roles (Names & Specializations)
                      </label>
                      <textarea
                        rows={3}
                        value={memberRoster}
                        onChange={(e) => setMemberRoster(e.target.value)}
                        placeholder="e.g. 1. Babatunde Ogunlesi (Full-Stack Dev)&#10;2. Amina Yusuf (Aviation Regulatory Advisor)&#10;3. Chidi Okonkwo (Product Designer)"
                        className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Step 4: Concept Proposal */}
                  <div className="space-y-4 pt-4 border-t border-nbac-border/40">
                    <h3 className="font-sans text-lg font-bold text-nbac-text flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-nbac-gold/20 text-nbac-gold border border-nbac-gold/30 text-xs font-bold flex items-center justify-center">4</span>
                      <span>Concept Proposal & Solution Architecture</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                        Proposal / Solution Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={proposalTitle}
                        onChange={(e) => setProposalTitle(e.target.value)}
                        placeholder="e.g. Automated Multi-Agency Overflight Permit Protocol"
                        className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                        1-Page Concept Note / Problem & Technical Solution *
                      </label>
                      <textarea
                        rows={6}
                        required
                        value={conceptNote}
                        onChange={(e) => setConceptNote(e.target.value)}
                        placeholder="Briefly describe the specific problem you are solving, your proposed technical architecture/product workflow, and why it will impact West African business aviation..."
                        className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5">
                        Code Repository, Figma, or Demo Link *
                      </label>
                      <input
                        type="url"
                        required
                        value={repoOrPortfolioUrl}
                        onChange={(e) => setRepoOrPortfolioUrl(e.target.value)}
                        placeholder="https://github.com/your-team/aerolab-solution"
                        className="w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-sm text-nbac-text focus:outline-none transition-colors font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Error Alert Message */}
                  {errorMsg && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-nbac-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-nbac-muted font-light">
                      By submitting, you agree to the AeroLab Hackathon terms and code of conduct.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-nbac-emerald hover:bg-nbac-emerald-dark disabled:opacity-50 text-white font-sans font-bold text-xs uppercase tracking-widest px-10 py-4 rounded-full transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-nbac-emerald/20 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <Send size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </>
  )
}
