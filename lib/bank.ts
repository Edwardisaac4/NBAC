/**
 * NBAC bank account details for delegate transfers.
 *
 * Every value comes from the environment and NOTHING is defaulted in source.
 * Two reasons, both deliberate:
 *
 *   1. This file is committed. Account numbers in a public repo hand a
 *      would-be phisher the exact wording to imitate, and the site has no
 *      DMARC record yet — anyone can already send mail as @nbac.com.ng.
 *      Bank transfers are irreversible in a way card payments are not.
 *   2. Finance can switch accounts without a code change or a deploy.
 *
 * Set these in .env.local and in the deployment platform's environment.
 * If the USD block is incomplete the page simply does not offer a USD
 * account — it never renders a half-filled set of wire instructions, which
 * is worse than none at all.
 */

export interface UsdAccount {
  correspondentBank: string
  correspondentSwift: string
  abaNumber: string
  correspondentAccount: string
  beneficiaryBank: string
  beneficiarySwift: string
  beneficiaryName: string
  beneficiaryAccount: string
  beneficiaryAddress: string
}

export interface NgnAccount {
  bank: string
  accountName: string
  accountNumber: string
  address: string
}

function read(key: string): string {
  return process.env[key]?.trim() || ''
}

/**
 * Returns the account only when every field is present.
 *
 * A wire missing its ABA or correspondent SWIFT will be rejected or, worse,
 * float in limbo — so a partially configured account is treated as absent.
 */
export function usdAccount(): UsdAccount | null {
  const account: UsdAccount = {
    correspondentBank: read('BANK_USD_CORRESPONDENT'),
    correspondentSwift: read('BANK_USD_CORRESPONDENT_SWIFT'),
    abaNumber: read('BANK_USD_ABA'),
    correspondentAccount: read('BANK_USD_CORRESPONDENT_ACCOUNT'),
    beneficiaryBank: read('BANK_USD_BENEFICIARY_BANK'),
    beneficiarySwift: read('BANK_USD_BENEFICIARY_SWIFT'),
    beneficiaryName: read('BANK_USD_BENEFICIARY_NAME'),
    beneficiaryAccount: read('BANK_USD_BENEFICIARY_ACCOUNT'),
    beneficiaryAddress: read('BANK_USD_BENEFICIARY_ADDRESS'),
  }

  return Object.values(account).every(Boolean) ? account : null
}

export function ngnAccount(): NgnAccount | null {
  const account: NgnAccount = {
    bank: read('BANK_NGN_BANK'),
    accountName: read('BANK_NGN_ACCOUNT_NAME'),
    accountNumber: read('BANK_NGN_ACCOUNT'),
    address: read('BANK_NGN_ADDRESS'),
  }

  return Object.values(account).every(Boolean) ? account : null
}

/**
 * True when at least one account is configured in the environment.
 *
 * Note this answers a question about deployment, not about a given delegate:
 * the pay page asks what IT can render for a particular reservation, since the
 * naira account is only offered when a naira figure was locked at registration.
 */
export function hasAnyAccount(): boolean {
  return usdAccount() !== null || ngnAccount() !== null
}

/**
 * Whether the Paystack card option is offered alongside bank transfer.
 *
 * Off unless explicitly enabled. EAN's terminal began rejecting cards in
 * September 2026; keeping the code behind a flag rather than deleting it
 * means restoring cards is one environment variable, not a release.
 */
export function paystackEnabled(): boolean {
  return process.env.PAYSTACK_ENABLED?.trim().toLowerCase() === 'true'
}
