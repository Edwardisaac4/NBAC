import { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes, randomInt } from "crypto";
import { PASS_TIERS } from "@/lib/constants";
import { PassTierDetails } from "@/types";

/**
 * Server-side pricing and discount evaluation.
 *
 * Price is locked at REGISTRATION, not at payment. We cannot see payment
 * timestamps in real time (EAN finance owns the Paystack account and we hold
 * no API keys), so a coupon that had to be valid on the day money lands would
 * be unenforceable. Instead the coupon is evaluated once, the resulting
 * figures are snapshotted onto the reservation, and the delegate gets a
 * payment window. Paying after the coupon expires still honours the locked
 * price, because they registered in time.
 */

/** Days a locked price stays payable before the reference goes stale. */
export const PAYMENT_WINDOW_DAYS = 14;

export type CodeStatus =
  | "applied"
  | "none"
  | "unknown"
  | "inactive"
  | "not_started"
  | "expired"
  | "exhausted"
  | "already_used"
  | "wrong_tier"
  | "min_delegates"
  | "not_yours";

export interface PriceQuote {
  tier: PassTierDetails;
  tierName: string;
  unitPrice: number;
  quantity: number;
  currency: string;
  grossAmount: number;
  discountCode: string | null;
  discountLabel: string | null;
  discountAmount: number;
  netAmount: number;
  codeStatus: CodeStatus;
  /** Delegate-facing explanation when a code was not applied. */
  codeMessage: string | null;
}

interface DiscountCodeRow {
  code: string;
  label: string;
  discount_type: "percent" | "fixed";
  value: number;
  valid_from: string;
  valid_until: string | null;
  max_redemptions: number | null;
  max_per_email: number;
  times_redeemed: number;
  applies_to_tiers: string[] | null;
  min_delegates: number;
  issued_to_email: string | null;
  auto_apply: boolean;
  active: boolean;
}

export interface AutoPromo {
  code: string;
  label: string;
  discountType: "percent" | "fixed";
  value: number;
  validUntil: string | null;
}

/** Money is held to 2dp throughout. Never use raw float arithmetic on totals. */
export function toMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Opaque handle for /pay/<token> URLs.
 *
 * The human reference (NBAC-2027-VIP-48213) is a ~90k search space, so it can
 * not be the only thing guarding a delegate's name, email and amount.
 */
export function generatePayToken(): string {
  return randomBytes(24).toString("base64url");
}

/**
 * Human-readable booking reference. Quoted by delegates on the phone and
 * matched by finance against EAN's Paystack export, so it stays digits-only —
 * no O/0 or I/1 transcription traps.
 *
 * randomInt (CSPRNG, no modulo bias) over a 10^10 space rather than
 * Math.random over 90k: `reservations.reference` is UNIQUE, so a collision
 * surfaces as a failed insert and a "Registration Error" toast for a delegate
 * who did nothing wrong. At 90k that was a real prospect across a few hundred
 * bookings; at 10^10 it is negligible.
 */
export function generateReference(tierId: string): string {
  const random = String(randomInt(0, 10_000_000_000)).padStart(10, "0");
  return `NBAC-2027-${tierId.toUpperCase()}-${random}`;
}

/**
 * Escape LIKE/ILIKE metacharacters so a value is matched literally.
 *
 * Underscores are common in email local parts, and an unescaped `_` is a
 * single-character wildcard — `john_doe@x.com` would also match
 * `johnXdoe@x.com` and wrongly report a coupon as already used.
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

const CODE_MESSAGES: Record<CodeStatus, string | null> = {
  applied: null,
  none: null,
  unknown:
    "That discount code was not recognised, so standard pricing applies.",
  inactive:
    "That discount code is no longer active, so standard pricing applies.",
  not_started:
    "That discount code is not yet active, so standard pricing applies.",
  expired: "That discount code has expired, so standard pricing applies.",
  exhausted:
    "That discount code has reached its redemption limit, so standard pricing applies.",
  already_used:
    "That discount code has already been used with this email address.",
  wrong_tier:
    "That discount code does not apply to the selected pass, so standard pricing applies.",
  min_delegates:
    "That discount code requires a larger booking, so standard pricing applies.",
  not_yours: "That discount code was issued to a different email address.",
};

/**
 * Resolve a tier by id or display name. The registration form posts the tier
 * *name* while deep links carry the *id*, so both must work.
 */
export function resolveTier(
  clientTier: string,
  tiers: PassTierDetails[] = PASS_TIERS,
) {
  return (
    tiers.find((t) => t.id === clientTier || t.name === clientTier) || null
  );
}

/**
 * Server-side equivalent of fetchTicketTiers() from lib/supabase/dynamic-content.
 *
 * That module is marked 'use client' and builds a browser client, so it cannot
 * be imported into a route handler. Prices must nonetheless come from the same
 * admin-managed `ticket_tiers` rows the form reads, or the quote shown and the
 * quote charged could differ whenever a tier price is edited.
 */
export async function fetchTiersServer(
  supabase: SupabaseClient,
): Promise<PassTierDetails[]> {
  try {
    const { data, error } = await supabase
      .from("ticket_tiers")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return PASS_TIERS;

    return (data as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as PassTierDetails["id"],
      name: String(row.name),
      badge: (row.badge as string) ?? undefined,
      price: Number(row.price),
      currency: (row.currency as PassTierDetails["currency"]) || "USD",
      description: (row.description as string) ?? undefined,
      privileges: (row.privileges as string[]) ?? [],
      billingModel:
        (row.billing_model as PassTierDetails["billingModel"]) ||
        "per_delegate",
      includedDelegates: Number(row.included_delegates ?? 1),
      availability:
        (row.availability as PassTierDetails["availability"]) || "available",
    })) as PassTierDetails[];
  } catch {
    return PASS_TIERS;
  }
}

/**
 * The blanket dated promo currently running, if any.
 *
 * Applied to every registration with no code typed, and stops applying on its
 * own the moment `valid_until` passes — which is the whole point of holding it
 * in a row rather than in `useState(true)` on the form.
 */
export async function getAutoApplyPromo(
  supabase: SupabaseClient,
): Promise<AutoPromo | null> {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("discount_codes")
    .select("code, label, discount_type, value, valid_from, valid_until")
    .eq("auto_apply", true)
    .eq("active", true)
    .lte("valid_from", nowIso)
    .or(`valid_until.is.null,valid_until.gte.${nowIso}`)
    .maybeSingle<{
      code: string;
      label: string;
      discount_type: "percent" | "fixed";
      value: number;
      valid_from: string;
      valid_until: string | null;
    }>();

  if (error) {
    console.error("[pricing] auto-apply promo lookup failed:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    code: data.code,
    label: data.label,
    discountType: data.discount_type,
    value: Number(data.value),
    validUntil: data.valid_until,
  };
}

/**
 * Evaluate a coupon against the live `discount_codes` row and return the full
 * price breakdown. An invalid or expired code is never an error — it silently
 * degrades to standard pricing with `codeStatus` explaining why, so a stale
 * code in somebody's inbox can never block a registration.
 *
 * With no code supplied, the blanket dated promo applies if one is running.
 */
export async function quotePrice(params: {
  supabase: SupabaseClient;
  tier: PassTierDetails;
  quantity: number;
  code?: string | null;
  email?: string | null;
  /** Set false to price at list, ignoring any running blanket promo. */
  allowAutoApply?: boolean;
  /**
   * Internal recursion guard. A rejected typed code re-quotes once against the
   * blanket promo; that inner call must not re-enter the fallback, or a
   * rejected promo code would recurse.
   */
  __promoFallbackApplied?: boolean;
}): Promise<PriceQuote> {
  const {
    supabase,
    tier,
    quantity,
    email,
    allowAutoApply = true,
    __promoFallbackApplied = false,
  } = params;

  // Kept distinct from the effective `code`: only a code the delegate actually
  // presented earns the promo fallback below.
  const typedCode = params.code?.trim().toUpperCase() || null;
  let code = typedCode;

  if (!code && allowAutoApply) {
    const promo = await getAutoApplyPromo(supabase);
    if (promo) code = promo.code;
  }

  const unitPrice = toMoney(tier.price);
  const grossAmount = toMoney(unitPrice * quantity);
  const currency = tier.currency || "USD";

  const listPrice = (codeStatus: CodeStatus): PriceQuote => ({
    tier,
    tierName: tier.name,
    unitPrice,
    quantity,
    currency,
    grossAmount,
    discountCode: null,
    discountLabel: null,
    discountAmount: 0,
    netAmount: grossAmount,
    codeStatus,
    codeMessage: CODE_MESSAGES[codeStatus],
  });

  /**
   * A typed code that cannot be applied must not leave the delegate worse off
   * than typing nothing at all.
   *
   * While a blanket dated promo runs, everyone who enters no code receives it.
   * Without this fallback, someone presenting an expired NBAC27-EARLY5 would be
   * charged full list while the delegate beside them — who typed nothing — pays
   * the promo price. So re-quote against the promo, but keep the rejection's
   * codeStatus and message so the delegate is still told their code failed.
   */
  const standard = async (codeStatus: CodeStatus): Promise<PriceQuote> => {
    if (!typedCode || !allowAutoApply || __promoFallbackApplied) {
      return listPrice(codeStatus);
    }

    const promo = await getAutoApplyPromo(supabase);
    // Nothing to fall back to, or the rejected code *is* the promo — re-quoting
    // would only reproduce the same rejection.
    if (!promo || promo.code === typedCode) return listPrice(codeStatus);

    const fallback = await quotePrice({
      ...params,
      code: promo.code,
      __promoFallbackApplied: true,
    });

    if (fallback.codeStatus !== "applied") return listPrice(codeStatus);

    return { ...fallback, codeStatus, codeMessage: CODE_MESSAGES[codeStatus] };
  };

  if (!code) return listPrice("none");

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle<DiscountCodeRow>();

  if (error) {
    console.error("[pricing] discount_codes lookup failed:", error.message);
    return standard("unknown");
  }
  if (!data) return standard("unknown");
  if (!data.active) return standard("inactive");

  const now = Date.now();
  if (data.valid_from && new Date(data.valid_from).getTime() > now) {
    return standard("not_started");
  }
  if (data.valid_until && new Date(data.valid_until).getTime() < now) {
    return standard("expired");
  }
  if (
    data.max_redemptions !== null &&
    data.times_redeemed >= data.max_redemptions
  ) {
    return standard("exhausted");
  }
  if (quantity < data.min_delegates) {
    return standard("min_delegates");
  }

  const restrictedTiers = data.applies_to_tiers ?? [];
  if (restrictedTiers.length > 0 && !restrictedTiers.includes(tier.id)) {
    return standard("wrong_tier");
  }

  const normalizedEmail = email?.trim().toLowerCase() || null;

  // Email-scoped codes can only be judged when an email is known. The quote
  // endpoint passes none; registration always does, and enforces there.
  if (
    data.issued_to_email &&
    normalizedEmail &&
    data.issued_to_email.toLowerCase() !== normalizedEmail
  ) {
    return standard("not_yours");
  }

  // Per-email cap is read off the redemption ledger rather than a counter, so
  // it stays correct even if the code definition is edited later.
  if (normalizedEmail && data.max_per_email > 0) {
    const { count, error: countError } = await supabase
      .from("discount_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("code", code)
      .ilike("email", escapeLikePattern(normalizedEmail));

    if (countError) {
      console.warn(
        "[pricing] redemption count check failed, allowing:",
        countError.message,
      );
    } else if ((count ?? 0) >= data.max_per_email) {
      return standard("already_used");
    }
  }

  const rawDiscount =
    data.discount_type === "percent"
      ? grossAmount * (Number(data.value) / 100)
      : Number(data.value);

  // A fixed-value code larger than the basket must never produce a negative
  // total or a credit.
  const discountAmount = toMoney(Math.min(rawDiscount, grossAmount));
  const netAmount = toMoney(grossAmount - discountAmount);

  return {
    tier,
    tierName: tier.name,
    unitPrice,
    quantity,
    currency,
    grossAmount,
    discountCode: data.code,
    discountLabel: data.label,
    discountAmount,
    netAmount,
    codeStatus: "applied",
    codeMessage: null,
  };
}

/**
 * Record the redemption and bump the code's counter.
 *
 * The ledger row snapshots the money columns and carries no FK to
 * `discount_codes` on purpose: historical reporting must not shift when
 * somebody edits a percentage months later.
 *
 * Best-effort by design — a failure here must not roll back a registration
 * that has already been persisted and emailed.
 */
export async function recordRedemption(params: {
  supabase: SupabaseClient;
  quote: PriceQuote;
  reservationId: string;
  reservationReference: string;
  email: string;
}): Promise<void> {
  const { supabase, quote, reservationId, reservationReference, email } =
    params;
  if (!quote.discountCode || quote.discountAmount <= 0) return;

  const { error } = await supabase.from("discount_redemptions").insert({
    code: quote.discountCode,
    reservation_id: reservationId,
    reservation_reference: reservationReference,
    email,
    tier: quote.tierName,
    delegate_count: quote.quantity,
    gross_amount: quote.grossAmount,
    discount_amount: quote.discountAmount,
    net_amount: quote.netAmount,
    currency: quote.currency,
  });

  if (error) {
    console.error(
      "[pricing] failed to write discount_redemptions row:",
      error.message,
    );
    return;
  }

  const { error: bumpError } = await supabase.rpc(
    "increment_discount_redemption",
    {
      target_code: quote.discountCode,
    },
  );

  // Fall back to a read-modify-write if the RPC is missing (migration 003 not
  // yet applied). Adequate at this volume — a lost increment only affects the
  // convenience counter, never the ledger that reporting is built on.
  if (bumpError) {
    const { data } = await supabase
      .from("discount_codes")
      .select("times_redeemed")
      .eq("code", quote.discountCode)
      .maybeSingle<{ times_redeemed: number }>();

    if (data) {
      await supabase
        .from("discount_codes")
        .update({ times_redeemed: (data.times_redeemed ?? 0) + 1 })
        .eq("code", quote.discountCode);
    }
  }
}
