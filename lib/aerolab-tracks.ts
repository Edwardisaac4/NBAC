import { Plane, Coins, Leaf, Sparkles, Compass, type LucideIcon } from 'lucide-react';

export interface AeroLabTrack {
  id: number;
  title: string;
  obj: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  applyColor: string;
  targetImpact?: string;
  deliverable?: string;
}

export const TRACKS: AeroLabTrack[] = [
  {
    id: 1,
    title: "The Clearance Problem",
    obj: "OBJ 01: Regulatory",
    desc: "Streamline overflight permits, landing approvals, and multi-agency clearance workflows across Nigerian and West African airspace.",
    icon: Plane,
    color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400",
    applyColor: "border-blue-500/40 text-blue-400 bg-blue-500/10",
    targetImpact: "Sub-15 Min Clearance Workflows",
    deliverable: "Workflow Prototype or Regulatory API",
  },
  {
    id: 2,
    title: "Money in the Air",
    obj: "OBJ 02: Finance",
    desc: "Develop innovative financial structures, risk mitigation mechanisms, or leasing models to unlock capital and ease aircraft acquisition.",
    icon: Coins,
    color: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400",
    applyColor: "border-amber-500/40 text-amber-400 bg-amber-500/10",
    targetImpact: "De-Risked African Aviation Leasing",
    deliverable: "Financial Model & Structuring Proposal",
  },
  {
    id: 3,
    title: "The Green FBO",
    obj: "OBJ 03: Ecosystem",
    desc: "Architect a practical, costed decarbonization roadmap for Nigerian FBOs — covering renewable energy, GSE electrification, and SAF off-take.",
    icon: Leaf,
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400",
    applyColor: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
    targetImpact: "Net-Zero FBO Operations Roadmap",
    deliverable: "Costed Sustainability Plan & Tech Stack",
  },
  {
    id: 4,
    title: "Fly Her Forward",
    obj: "OBJ 04 / Women in Aviation",
    desc: "Create a platform, mentorship engine, or career development framework that accelerates recruitment, retention, and leadership of women.",
    icon: Sparkles,
    color: "from-pink-500/10 to-purple-500/10 border-pink-500/20 text-pink-400",
    applyColor: "border-pink-500/40 text-pink-400 bg-pink-500/10",
    targetImpact: "Measurable Leadership & Technical Equity",
    deliverable: "Platform Concept or Program Framework",
  },
  {
    id: 5,
    title: "The Charter Experience",
    obj: "OBJ 05: Innovation",
    desc: "Reimagine the digital journey for business aviation clients — from instant charter discovery and transparent pricing to flight dispatch.",
    icon: Compass,
    color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400",
    applyColor: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10",
    targetImpact: "Frictionless Charter Booking & Dispatch",
    deliverable: "Digital Product Prototype & Dispatch Flow",
  },
];
