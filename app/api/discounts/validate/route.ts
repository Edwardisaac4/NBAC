import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchTiersServer,
  getAutoApplyPromo,
  quotePrice,
  resolveTier,
} from "@/lib/pricing";

/**
 * Prices a basket, optionally with a coupon, and returns the breakdown the
 * registration form displays.
 *
 * This exists so the form never computes a discount itself. The previous form
 * hardcoded `gross * 0.1` client-side while the API applied its own rule, and
 * the two disagreeing is what produced both live coupon bugs: every delegate
 * silently receiving 10% off, and NBAC27-EARLY5 holders being quoted 5% and
 * charged full price. The figures shown to a delegate now come from the same
 * function that will charge them.
 */

/**
 * Coupon codes are guessable by design (NBAC27-EARLY5), so an open validation
 * endpoint is a code-guessing oracle. In-memory and per-instance, which is
 * enough to stop casual enumeration; it is not a defence against a distributed
 * attempt, and does not need to be — the worst case is a delegate obtaining a
 * discount we were already publishing on our own website.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });

    // Opportunistic sweep so the map cannot grow without bound.
    if (attempts.size > 5000) {
      for (const [k, v] of attempts) {
        if (now > v.resetAt) attempts.delete(k);
      }
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    if (rateLimited(clientKey(request))) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { tier: clientTier, delegateCount, code, email } = body;

    if (!clientTier) {
      return NextResponse.json(
        { error: "A pass tier is required." },
        { status: 400 },
      );
    }

    const quantity = Number(delegateCount ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "delegateCount must be an integer between 1 and 10." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Pricing service unavailable." },
        { status: 500 },
      );
    }

    // Admin-managed tiers win over the compiled-in constants, matching the
    // form's own fetchTicketTiers() so the two cannot quote different prices.
    const tiers = await fetchTiersServer(supabase);
    const tier = resolveTier(String(clientTier), tiers);
    if (!tier) {
      return NextResponse.json(
        { error: "Invalid pass tier." },
        { status: 400 },
      );
    }

    const quote = await quotePrice({
      supabase,
      tier,
      quantity,
      code: typeof code === "string" && code.trim() ? code : null,
      // Email-scoped checks (already_used, not_yours) are enforced at
      // registration. Running them here would answer questions about
      // addresses the caller does not own.
      email: null,
    });

    const promo = await getAutoApplyPromo(supabase);

    return NextResponse.json({
      tierId: tier.id,
      tierName: quote.tierName,
      unitPrice: quote.unitPrice,
      quantity: quote.quantity,
      currency: quote.currency,
      grossAmount: quote.grossAmount,
      discountCode: quote.discountCode,
      discountLabel: quote.discountLabel,
      discountAmount: quote.discountAmount,
      netAmount: quote.netAmount,
      codeStatus: quote.codeStatus,
      codeMessage: quote.codeMessage,
      /**
       * Lets the form say "10% is already applied for everyone until 30 Nov"
       * versus "enter a code", without the expiry date living in JSX.
       */
      autoPromo: promo
        ? {
            code: promo.code,
            label: promo.label,
            value: promo.value,
            validUntil: promo.validUntil,
          }
        : null,
    });
  } catch (err) {
    console.error("[discounts/validate] error:", err);
    return NextResponse.json(
      { error: "Unable to price this booking." },
      { status: 500 },
    );
  }
}
