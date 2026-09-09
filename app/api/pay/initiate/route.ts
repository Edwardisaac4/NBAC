import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Stamps a reservation as 'initiated' when the delegate clicks through to
 * EAN's Paystack terminal.
 *
 * This is the only visibility we have into payment intent. With no Paystack
 * API keys and no reference field on their payment page, nothing else tells us
 * a delegate tried to pay — so this row is what produces the "clicked pay,
 * never confirmed" follow-up list.
 *
 * Never returns an error the client acts on: the caller redirects to Paystack
 * regardless. Losing a stamp costs us a chase-up entry; blocking a payment
 * costs a delegate.
 */
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) return NextResponse.json({ success: false }, { status: 500 })

    // Only advances from 'pending'. A reservation already 'claimed' or
    // 'verified' must not be dragged backwards by a delegate revisiting the
    // page, and 'initiated' keeps its first timestamp so the chase-up list
    // reflects when they first tried.
    const { error } = await supabase
      .from('reservations')
      .update({
        payment_status: 'initiated',
        initiated_at: new Date().toISOString(),
      })
      .eq('pay_token', token)
      .eq('payment_status', 'pending')

    if (error) {
      console.error('[pay/initiate] stamp failed:', error.message)
      return NextResponse.json({ success: false }, { status: 200 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[pay/initiate] error:', err)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
