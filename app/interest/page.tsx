'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  CheckCircle2,
  PenTool,
  RotateCcw,
  User,
  Phone,
  Building2,
  Globe,
  Briefcase,
  Tag,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Users,
  Clock,
  Percent,
  Upload,
  Camera,
  X,
  Copy,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/shared/toast';

const ROLES = [
  { id: 'delegate', label: 'Delegate' },
  { id: 'sponsor', label: 'Sponsor' },
  { id: 'speaker', label: 'Speaker' },
  { id: 'media', label: 'Media' },
] as const;

const AREAS_OF_INTEREST = [
  'Charter & business aviation',
  'MRO & ground support',
  'Aircraft financing & leasing',
  'Airport & FBO infrastructure',
  'Regulatory & policy',
] as const;

const TICKET_PREFERENCES = [
  { id: 'early_bird', label: 'Early Bird', description: 'Priority pricing for early registrants' },
  { id: 'standard', label: 'Standard', description: 'Full 2-day conference & exhibition access' },
  { id: 'vip', label: 'VIP Pass', description: 'All-inclusive executive lounge access' },
  { id: 'group', label: 'Group', description: 'Special corporate delegation package (3+ passes)' },
] as const;

const SOURCES = [
  'AfBAA Event & Stand',
  'Direct Invitation / EAN Aviation',
  'Industry Colleague / Word of Mouth',
  'LinkedIn & Social Media',
  'Aviation Press / Media',
  'Other',
] as const;

export default function StandInterestPage() {
  const toast = useToast();

  // Mode: 'pay_now' (Early Bird Registration) vs 'pay_later' (Early Bird Pay Later)
  const [paymentChoice, setPaymentChoice] = useState<'pay_now' | 'pay_later'>('pay_later');
  // Once a registration mode is chosen the other is locked out for the rest of
  // this visit to the form. Deliberate state only — it resets on navigation away.
  const [modeLocked, setModeLocked] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    company: '',
    country: '',
    email: '',
    phone: '',
    role: 'delegate',
    attendeeCount: 1,
    areasOfInterest: [] as string[],
    ticketPreference: 'early_bird',
    source: 'AfBAA Event & Stand',
    consent: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedChoice, setSubmittedChoice] = useState<'pay_now' | 'pay_later'>('pay_later');
  const [issuedCode, setIssuedCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  // Signature Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [todayDate, setTodayDate] = useState('');

  useEffect(() => {
    // Read URL query parameters (?mode=pay_now or ?mode=pay_later, ?tier=...)
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'pay_now' || modeParam === 'pay_later') {
      setPaymentChoice(modeParam);
      setModeLocked(true);
    }
    const tierParam = params.get('tier');
    if (tierParam) {
      const match = TICKET_PREFERENCES.find(t => t.id === tierParam || t.label.toLowerCase().includes(tierParam.toLowerCase()));
      if (match) {
        setFormData(prev => ({ ...prev, ticketPreference: match.id }));
      }
    }

    // Format current date for verification line
    const formatted = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    setTodayDate(formatted);
  }, []);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#c5a059'; // nbac-gold
    ctx.lineWidth = 2.5;
  }, [isSubmitted]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  const clearUploadedSignature = () => {
    setUploadedSignature(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Accepts a photo or image file of a signature and downscales it to a
   * compact JPEG data URL. Phone camera shots are several megabytes, and the
   * signature is stored as text on the lead record, so it must be shrunk first.
   */
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Unsupported File', {
        description: 'Please upload an image of your signature (JPG, PNG, HEIC or a photo).',
      });
      e.target.value = '';
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.error('Image Too Large', {
        description: 'Please upload an image under 12MB.',
      });
      e.target.value = '';
      return;
    }

    setIsProcessingUpload(true);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read the selected file.'));
        reader.readAsDataURL(file);
      });

      const compressed = await new Promise<string>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => {
          const MAX_WIDTH = 1000;
          const scale = Math.min(1, MAX_WIDTH / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not process the image.'));
            return;
          }
          // Flatten onto white so transparent PNG signatures stay readable
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('That image could not be opened.'));
        img.src = dataUrl;
      });

      setUploadedSignature(compressed);
      toast.success('Signature Attached', {
        description: 'Your signature image has been attached to this registration.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not process that image.';
      toast.error('Upload Failed', { description: message });
    } finally {
      setIsProcessingUpload(false);
      e.target.value = '';
    }
  };

  const handleSelectMode = (choice: 'pay_now' | 'pay_later') => {
    if (modeLocked) return;
    setPaymentChoice(choice);
    setModeLocked(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAreaOfInterest = (area: string) => {
    setFormData(prev => {
      const exists = prev.areasOfInterest.includes(area);
      return {
        ...prev,
        areasOfInterest: exists
          ? prev.areasOfInterest.filter(a => a !== area)
          : [...prev.areasOfInterest, area],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Required Information', {
        description: 'Please fill in Full Name, Email, and Phone/WhatsApp to proceed.',
      });
      return;
    }

    if (!formData.consent) {
      toast.error('Consent Required', {
        description: 'Please agree to the communications consent before submitting.',
      });
      return;
    }

    setIsSubmitting(true);

    let signatureDataUrl = '';
    if (signatureMode === 'upload') {
      signatureDataUrl = uploadedSignature || '';
    } else if (canvasRef.current && hasSignature) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          company: formData.company,
          country: formData.country,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          attendeeCount: formData.attendeeCount,
          areasOfInterest: formData.areasOfInterest,
          ticketPreference: formData.ticketPreference,
          source: formData.source,
          paymentChoice: paymentChoice,
          consent: formData.consent,
          signatureData: signatureDataUrl,
          verificationDate: todayDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit registration interest.');
      }

      setIssuedCode(data.discountCode || '');
      setCodeCopied(false);
      setSubmittedChoice(paymentChoice);
      setIsSubmitted(true);
      setIsSubmitting(false);

      toast.success(
        paymentChoice === 'pay_now' ? 'Registration Recorded!' : 'Interest Form Received!',
        {
          description: paymentChoice === 'pay_now'
            ? '10% AfBAA event discount recorded.'
            : 'Your 5% discount code has been recorded against your registration.',
        }
      );
    } catch (err) {
      setIsSubmitting(false);
      const message = err instanceof Error ? err.message : 'Network error. Please try again.';
      toast.error('Submission Failed', { description: message });
    }
  };

  const handleCopyCode = async () => {
    if (!issuedCode) return;
    try {
      await navigator.clipboard.writeText(issuedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    } catch {
      toast.error('Could not copy', {
        description: `Please note your code manually: ${issuedCode}`,
      });
    }
  };

  const handleResetForNext = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: '',
      jobTitle: '',
      company: '',
      country: '',
      email: '',
      phone: '',
      role: 'delegate',
      attendeeCount: 1,
      areasOfInterest: [],
      ticketPreference: 'early_bird',
      source: 'AfBAA Event & Stand',
      consent: true,
    });
    setHasSignature(false);
    clearSignature();
    clearUploadedSignature();
    setSignatureMode('draw');
    setModeLocked(false);
    setIssuedCode('');
    setCodeCopied(false);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 pb-16 md:pb-24">
        {/* Header Hero Section */}
        <section className="max-w-4xl mx-auto px-6 w-full text-center pt-4 pb-8">
          <div className="mb-6 flex justify-center">
            <Link
              href="/reservations?type=delegate"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-nbac-muted hover:text-nbac-emerald transition-colors cursor-pointer group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Delegate Passes</span>
            </Link>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-nbac-gold/10 border border-nbac-gold/30 text-nbac-gold-light text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={13} />
              <span>AfBAA Event Stand & Official Early Bird Portal</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-nbac-text tracking-tight max-w-2xl leading-tight">
              Registration & Interest Desk
            </h1>

            <p className="font-sans text-sm md:text-base font-light text-nbac-body max-w-2xl leading-relaxed">
              Register your conference presence at our exhibition stand. Choose to pay in full now for an instant 10% event discount, or pay later to lock in a 5% early coupon.
            </p>
          </div>
        </section>

        {/* Form Container */}
        <section className="max-w-3xl mx-auto px-6 w-full">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="submitted-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-nbac-panel/85 border border-nbac-border rounded-2xl p-8 md:p-12 backdrop-blur-xl text-center flex flex-col items-center space-y-6 shadow-2xl relative overflow-hidden"
              >
                {/* Glow Effects */}
                <div className={cn(
                  "absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none",
                  submittedChoice === 'pay_now' ? "bg-nbac-gold/15" : "bg-nbac-emerald/15"
                )} />

                <div className={cn(
                  "p-4 rounded-full border",
                  submittedChoice === 'pay_now'
                    ? "bg-nbac-gold/10 border-nbac-gold/40 text-nbac-gold shadow-[0_0_30px_rgba(197,160,89,0.3)]"
                    : "bg-nbac-emerald/10 border-nbac-emerald/40 text-nbac-emerald shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                )}>
                  <CheckCircle2 className="h-12 w-12" />
                </div>

                <div className="space-y-2 max-w-lg">
                  <span className={cn(
                    "font-sans text-xs uppercase tracking-widest font-bold",
                    submittedChoice === 'pay_now' ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                  )}>
                    {submittedChoice === 'pay_now' ? 'Registration Confirmed' : 'Interest Successfully Recorded'}
                  </span>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-nbac-text">
                    Thank You, {formData.fullName}
                  </h2>
                  <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                    {submittedChoice === 'pay_now'
                      ? 'Your early bird registration details have been securely logged. Your 10% AfBAA discount has been applied to your profile.'
                      : 'We have recorded your details at our stand. Your exclusive 5% discount code is shown below — our delegate desk will apply it when you register.'}
                  </p>
                </div>

                {/* Discount Delivery Info Banner */}
                <div className="w-full max-w-md bg-nbac-canvas/90 border border-nbac-border rounded-xl p-6 text-left space-y-4 shadow-inner">
                  <div className="flex items-center justify-between border-b border-nbac-border pb-3">
                    <span className="text-xs uppercase tracking-wider text-nbac-muted font-medium flex items-center gap-1.5">
                      <Tag size={14} className={submittedChoice === 'pay_now' ? "text-nbac-gold-light" : "text-nbac-emerald-light"} />
                      Your Discount Code
                    </span>
                    <span className={cn("text-xs font-bold uppercase tracking-wider", submittedChoice === 'pay_now' ? "text-nbac-gold-light" : "text-nbac-emerald-light")}>
                      Recorded at Stand
                    </span>
                  </div>

                  {/* The code itself — this screen is the only place the delegate receives it */}
                  {issuedCode && (
                    <div className={cn(
                      "flex flex-col gap-3 rounded-xl border-2 border-dashed p-4 sm:flex-row sm:items-center sm:justify-between",
                      submittedChoice === 'pay_now'
                        ? "border-nbac-gold/50 bg-nbac-gold/5"
                        : "border-nbac-emerald/50 bg-nbac-emerald/5"
                    )}>
                      <span className="font-mono text-lg font-extrabold tracking-widest text-nbac-text break-all">
                        {issuedCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className={cn(
                          "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2 font-sans text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                          submittedChoice === 'pay_now'
                            ? "bg-nbac-gold text-[#0b0f10] hover:bg-nbac-gold-light"
                            : "bg-nbac-emerald text-white hover:bg-[#10b981]"
                        )}
                      >
                        {codeCopied ? <Check size={13} /> : <Copy size={13} />}
                        <span>{codeCopied ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs border-b border-nbac-border pb-3">
                    <span className="text-nbac-muted uppercase tracking-wider">Discount Privilege</span>
                    <span className={cn("font-bold text-sm", submittedChoice === 'pay_now' ? "text-nbac-gold-light" : "text-nbac-emerald-light")}>
                      {submittedChoice === 'pay_now' ? '10% AfBAA Event Full Payment Discount' : '5% Early Bird Discount'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-b border-nbac-border pb-3">
                    <span className="text-nbac-muted uppercase tracking-wider">Validity Period</span>
                    <span className="text-nbac-text font-medium">
                      {submittedChoice === 'pay_now' ? 'Active for AfBAA Event Period' : 'Valid for 30 days from event closing'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-nbac-muted uppercase tracking-wider">Pass Preference</span>
                    <span className="text-nbac-text font-bold uppercase">{formData.ticketPreference.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Notice */}
                <p className="text-xs text-nbac-muted max-w-md leading-relaxed font-light">
                  Please screenshot or copy your code now — this screen is the only place it is issued. Our delegate desk has your details and will follow up on <span className="text-nbac-text font-semibold">{formData.email}</span>.
                </p>

                {/* Reset button for exhibition stand usage */}
                <div className="pt-2">
                  <button
                    onClick={handleResetForNext}
                    className="bg-nbac-canvas border border-nbac-border hover:border-nbac-gold/50 text-nbac-body hover:text-nbac-text font-sans text-xs uppercase tracking-wider font-semibold px-8 py-3.5 rounded-full transition-all cursor-pointer"
                  >
                    Register Another Attendee / Stand Visitor
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="sponsor-animated-border rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-2xl relative">
                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">

                  {/* ─── TOP CHOICE TOGGLE: 2 EXTRA BUTTONS ────────────────────────────── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
                        Select Registration Mode
                      </span>
                      <span className="text-[11px] font-sans text-nbac-gold-light flex items-center gap-1 font-medium">
                        <Percent size={12} /> AfBAA Event Specials
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-nbac-canvas/80 border border-nbac-border rounded-xl">
                      {/* Button 1: Early Bird Registration (Pay Now - 10% Discount) */}
                      <button
                        type="button"
                        onClick={() => handleSelectMode('pay_now')}
                        disabled={modeLocked && paymentChoice !== 'pay_now'}
                        aria-pressed={paymentChoice === 'pay_now'}
                        className={cn(
                          "relative p-4 rounded-lg text-left transition-all duration-300 flex flex-col justify-between gap-2 border",
                          paymentChoice === 'pay_now'
                            ? "bg-nbac-gold/10 border-nbac-gold shadow-[0_0_20px_rgba(197,160,89,0.2)] cursor-default"
                            : modeLocked
                              ? "bg-transparent border-transparent opacity-35 cursor-not-allowed grayscale"
                              : "bg-transparent border-transparent hover:bg-nbac-panel/40 opacity-75 hover:opacity-100 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text flex items-center gap-1.5">
                            {modeLocked && paymentChoice !== 'pay_now' && <Lock size={11} />}
                            Early Bird Registration
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-nbac-gold text-[#0b0f10]">
                            10% OFF
                          </span>
                        </div>
                        <p className="text-[11px] text-nbac-muted font-light leading-relaxed">
                          Pay in full during the AfBAA event for an instant 10% discount on your pass.
                        </p>
                      </button>

                      {/* Button 2: Early Bird Pay Later (5% Discount) */}
                      <button
                        type="button"
                        onClick={() => handleSelectMode('pay_later')}
                        disabled={modeLocked && paymentChoice !== 'pay_later'}
                        aria-pressed={paymentChoice === 'pay_later'}
                        className={cn(
                          "relative p-4 rounded-lg text-left transition-all duration-300 flex flex-col justify-between gap-2 border",
                          paymentChoice === 'pay_later'
                            ? "bg-nbac-emerald/10 border-nbac-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)] cursor-default"
                            : modeLocked
                              ? "bg-transparent border-transparent opacity-35 cursor-not-allowed grayscale"
                              : "bg-transparent border-transparent hover:bg-nbac-panel/40 opacity-75 hover:opacity-100 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text flex items-center gap-1.5">
                            {modeLocked && paymentChoice !== 'pay_later' && <Lock size={11} />}
                            Early Bird Pay Later
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-nbac-emerald text-white">
                            5% COUPON
                          </span>
                        </div>
                        <p className="text-[11px] text-nbac-muted font-light leading-relaxed">
                          Lock in a 5% discount code, valid for payment within 30 days of the event closing.
                        </p>
                      </button>
                    </div>

                    {modeLocked && (
                      <p className="text-[10px] text-nbac-muted font-light flex items-center gap-1.5">
                        <Lock size={10} className="shrink-0" />
                        <span>
                          You are registering under{' '}
                          <span className="font-semibold text-nbac-text">
                            {paymentChoice === 'pay_now' ? 'Early Bird Registration (10%)' : 'Early Bird Pay Later (5%)'}
                          </span>
                          . The other option is locked for this registration.
                        </span>
                      </p>
                    )}
                  </div>

                  {/* ─── SECTION 1: CONTACT INFORMATION ─────────────────────────────────── */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-nbac-border pb-2">
                      <User size={15} className="text-nbac-gold-light" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text">
                        1. Contact Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1">
                          Full Name <span className="text-nbac-gold-light">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="e.g. Captain Aisha Mohammed"
                          className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-2.5 text-nbac-text placeholder:text-nbac-muted/60 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all"
                        />
                      </div>

                      {/* Job Title */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1">
                          Job Title
                        </label>
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          placeholder="e.g. Chief Operating Officer"
                          className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-2.5 text-nbac-text placeholder:text-nbac-muted/60 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all"
                        />
                      </div>

                      {/* Company */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          placeholder="e.g. West African Jet Charter"
                          className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-2.5 text-nbac-text placeholder:text-nbac-muted/60 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all"
                        />
                      </div>

                      {/* Country */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1">
                          Country
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="e.g. Nigeria, South Africa, UK"
                          className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-2.5 text-nbac-text placeholder:text-nbac-muted/60 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1">
                          Corporate Email <span className="text-nbac-gold-light">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="e.g. aisha@operator.com"
                          className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-2.5 text-nbac-text placeholder:text-nbac-muted/60 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all"
                        />
                      </div>

                      {/* Phone / WhatsApp */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted flex items-center gap-1">
                          Phone / WhatsApp <span className="text-nbac-gold-light">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+234 800 000 0000"
                          className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-2.5 text-nbac-text placeholder:text-nbac-muted/60 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ─── SECTION 2: ATTENDANCE DETAILS ─────────────────────────────────── */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-nbac-border pb-2">
                      <Users size={15} className="text-nbac-gold-light" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text">
                        2. Attendance Details
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted block">
                        Your Role at NBAC 2027
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {ROLES.map(roleItem => (
                          <button
                            key={roleItem.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, role: roleItem.id }))}
                            className={cn(
                              "py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer text-center",
                              formData.role === roleItem.id
                                ? "bg-nbac-gold text-[#0b0f10] border-nbac-gold shadow-[0_2px_10px_rgba(197,160,89,0.3)]"
                                : "bg-nbac-canvas/60 border-nbac-border text-nbac-muted hover:text-nbac-text hover:bg-nbac-panel"
                            )}
                          >
                            {roleItem.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Attendees Counter */}
                    <div className="flex items-center justify-between p-4 bg-nbac-canvas/60 border border-nbac-border rounded-xl">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-text">
                          Number of Attendees
                        </h4>
                        <p className="text-[11px] text-nbac-muted">
                          How many delegates or colleagues will represent your organisation?
                        </p>
                      </div>
                      <div className="flex items-center gap-3 bg-nbac-panel border border-nbac-border px-3 py-1.5 rounded-full select-none">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, attendeeCount: Math.max(1, prev.attendeeCount - 1) }))}
                          className="text-nbac-muted hover:text-nbac-gold transition-colors font-bold px-1.5 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm w-6 text-center text-nbac-text">
                          {formData.attendeeCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, attendeeCount: Math.min(25, prev.attendeeCount + 1) }))}
                          className="text-nbac-muted hover:text-nbac-gold transition-colors font-bold px-1.5 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ─── SECTION 3: AREAS OF INTEREST ──────────────────────────────────── */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-nbac-border pb-2">
                      <Briefcase size={15} className="text-nbac-gold-light" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text">
                        3. Areas of Interest
                      </h3>
                    </div>

                    <p className="text-[11px] text-nbac-muted">
                      Select all aviation sectors of focus relevant to your business:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {AREAS_OF_INTEREST.map((area) => {
                        const isSelected = formData.areasOfInterest.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleAreaOfInterest(area)}
                            className={cn(
                              "p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 cursor-pointer",
                              isSelected
                                ? "bg-nbac-gold/10 border-nbac-gold/70 text-nbac-text shadow-sm"
                                : "bg-nbac-canvas/60 border-nbac-border text-nbac-body hover:border-nbac-border/80 hover:text-nbac-text"
                            )}
                          >
                            <span className="text-xs font-medium">{area}</span>
                            <div className={cn(
                              "w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-nbac-gold border-nbac-gold text-[#0b0f10]"
                                : "border-nbac-border/80 bg-nbac-panel"
                            )}>
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─── SECTION 4: TICKET PREFERENCE ─────────────────────────────────── */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-nbac-border pb-2">
                      <Tag size={15} className="text-nbac-gold-light" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text">
                        4. Ticket Preference
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TICKET_PREFERENCES.map((ticket) => {
                        const isSelected = formData.ticketPreference === ticket.id;
                        return (
                          <button
                            key={ticket.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, ticketPreference: ticket.id }))}
                            className={cn(
                              "p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1 cursor-pointer",
                              isSelected
                                ? "bg-nbac-panel border-nbac-gold shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                                : "bg-nbac-canvas/60 border-nbac-border opacity-70 hover:opacity-100 hover:border-nbac-border/80"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "font-sans text-xs font-bold uppercase tracking-wider",
                                isSelected ? "text-nbac-gold-light" : "text-nbac-text"
                              )}>
                                {ticket.label}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-nbac-gold animate-pulse" />
                              )}
                            </div>
                            <p className="text-[11px] text-nbac-muted font-light leading-relaxed">
                              {ticket.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─── SECTION 5: SOURCE ────────────────────────────────────────────── */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-nbac-border pb-2">
                      <Globe size={15} className="text-nbac-gold-light" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text">
                        5. How Did You Hear About NBAC 2027?
                      </h3>
                    </div>

                    <div className="relative">
                      <select
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text font-sans text-sm focus:outline-none focus:border-nbac-gold transition-all cursor-pointer"
                      >
                        {SOURCES.map(s => (
                          <option key={s} value={s} className="bg-nbac-panel text-nbac-text">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ─── SECTION 6: CONSENT, SIGNATURE & DATE LINE ─────────────────────── */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-nbac-border pb-2">
                      <PenTool size={15} className="text-nbac-gold-light" />
                      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text">
                        6. Consent & On-Site Verification
                      </h3>
                    </div>

                    {/* Consent Checkbox */}
                    <label className="flex items-start gap-3 p-3.5 bg-nbac-canvas/40 border border-nbac-border/60 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent}
                        onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-nbac-border bg-nbac-canvas text-nbac-gold focus:ring-nbac-gold cursor-pointer accent-[#c5a059]"
                      />
                      <span className="text-xs text-nbac-body leading-relaxed font-light select-none">
                        I agree to be contacted with registration details, conference updates, and official communications regarding NBAC 2027.
                      </span>
                    </label>

                    {/* Signature — draw on screen, or snap / upload an image */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-nbac-muted">
                          Signature
                        </label>
                        {((signatureMode === 'draw' && hasSignature) || (signatureMode === 'upload' && uploadedSignature)) && (
                          <button
                            type="button"
                            onClick={signatureMode === 'draw' ? clearSignature : clearUploadedSignature}
                            className="text-[10px] text-nbac-muted hover:text-nbac-danger transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw size={11} /> Clear
                          </button>
                        )}
                      </div>

                      {/* Mode switch */}
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-nbac-canvas/80 border border-nbac-border rounded-xl">
                        <button
                          type="button"
                          onClick={() => setSignatureMode('draw')}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer",
                            signatureMode === 'draw'
                              ? "bg-nbac-gold/15 text-nbac-gold-light border border-nbac-gold/40"
                              : "border border-transparent text-nbac-muted hover:text-nbac-text hover:bg-nbac-panel/50"
                          )}
                        >
                          <PenTool size={12} />
                          <span>Draw</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureMode('upload')}
                          className={cn(
                            "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-sans text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer",
                            signatureMode === 'upload'
                              ? "bg-nbac-gold/15 text-nbac-gold-light border border-nbac-gold/40"
                              : "border border-transparent text-nbac-muted hover:text-nbac-text hover:bg-nbac-panel/50"
                          )}
                        >
                          <Camera size={12} />
                          <span>Snap / Upload</span>
                        </button>
                      </div>

                      {signatureMode === 'draw' ? (
                        <>
                          <div className="relative border border-nbac-border rounded-xl bg-nbac-canvas/90 overflow-hidden shadow-inner touch-none h-32">
                            <canvas
                              ref={canvasRef}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-full cursor-crosshair"
                            />
                            {!hasSignature && (
                              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-nbac-muted/40 font-serif italic select-none">
                                Sign here for on-site booth verification
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] text-nbac-muted font-light">
                            Sign with your finger, a stylus, or your mouse.
                          </p>
                        </>
                      ) : (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            className="hidden"
                            aria-label="Upload a photo of your signature"
                          />

                          {uploadedSignature ? (
                            <div className="relative border border-nbac-border rounded-xl bg-white overflow-hidden shadow-inner">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={uploadedSignature}
                                alt="Uploaded signature preview"
                                className="w-full h-32 object-contain"
                              />
                              <button
                                type="button"
                                onClick={clearUploadedSignature}
                                aria-label="Remove uploaded signature"
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-nbac-danger transition-colors cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isProcessingUpload}
                              className="w-full h-32 border border-dashed border-nbac-border hover:border-nbac-gold/50 rounded-xl bg-nbac-canvas/90 flex flex-col items-center justify-center gap-2 text-nbac-muted hover:text-nbac-text transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isProcessingUpload ? (
                                <>
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
                                  <span className="font-sans text-[11px] uppercase tracking-wider">Processing image...</span>
                                </>
                              ) : (
                                <>
                                  <Upload size={18} className="text-nbac-gold-light" />
                                  <span className="font-sans text-[11px] uppercase tracking-wider font-semibold">
                                    Take a photo or upload
                                  </span>
                                  <span className="font-sans text-[10px] font-light">
                                    Snap your signed slip or attach an e-signature
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                          <p className="text-[10px] text-nbac-muted font-light">
                            On a phone this opens your camera or photo library. Images up to 12MB.
                          </p>
                        </>
                      )}
                    </div>

                  </div>

                  {/* ─── SUBMISSION ACTION ────────────────────────────────────────────── */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full font-sans font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer shadow-lg",
                        paymentChoice === 'pay_now'
                          ? "bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] shadow-nbac-gold/20 hover:shadow-nbac-gold/40"
                          : "bg-linear-to-r from-nbac-emerald via-[#10b981] to-nbac-emerald text-white shadow-nbac-emerald/20 hover:shadow-nbac-emerald/40"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          <span>Submitting Registration Details...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          <span>
                            {paymentChoice === 'pay_now'
                              ? 'Submit Registration (10% AfBAA Event Discount)'
                              : 'Submit Interest (Lock In 5% Discount Code)'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <Footer />
    </>
  );
}
