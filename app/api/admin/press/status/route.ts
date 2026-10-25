import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { SENDERS } from '@/lib/form-emails';
import {
  pressAccreditationApprovedEmail,
  pressAccreditationDeclinedEmail,
} from '@/lib/payment-emails';
import { PRESS_STATUSES, mediaTypeLabel, type PressStatus } from '@/lib/press';

const NOTE_MAX = 1000;

/**
 * Sets a press accreditation's status and, for approve/decline, emails the
 * journalist the decision.
 *
 * Requires a real admin session — no dev-cookie fallback as in
 * /api/admin/tickets, because this route sends mail to real people. The
 * update runs through the caller's own session client, so the table's
 * admin-only RLS policy applies as a second check.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Session expired or invalid' }, { status: 401 });
    }

    const userRole = user.app_metadata?.role;
    if (userRole !== 'head_admin' && userRole !== 'editor') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    const body = await request.json();
    const id = typeof body.id === 'string' ? body.id : '';
    const status = body.status as PressStatus;
    const notify = body.notify !== false;
    const note = typeof body.note === 'string' ? body.note.trim() : '';

    if (!id) {
      return NextResponse.json({ error: 'Missing request id.' }, { status: 400 });
    }
    if (!PRESS_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    if (note.length > NOTE_MAX) {
      return NextResponse.json({ error: `Message is too long (max ${NOTE_MAX} chars).` }, { status: 400 });
    }

    const reviewedAt = status === 'pending' ? null : new Date().toISOString();

    // Conditional on the status actually changing: a double-clicked Approve
    // updates nothing the second time, so it cannot send a second email.
    const { data: row, error: updateError } = await supabase
      .from('press_accreditations')
      .update({ status, reviewed_at: reviewedAt })
      .eq('id', id)
      .neq('status', status)
      .select('id, reference, full_name, email, outlet, media_type, status, reviewed_at')
      .maybeSingle();

    if (updateError) {
      console.error('[Press Status API] update failed:', updateError.message);
      return NextResponse.json({ error: 'Could not update the status. Please try again.' }, { status: 500 });
    }

    if (!row) {
      return NextResponse.json(
        { error: 'This request already has that status, or no longer exists. Refresh the page.' },
        { status: 409 }
      );
    }

    let emailed = false;
    if (notify && status !== 'pending') {
      const emailData = {
        name: row.full_name,
        reference: row.reference,
        outlet: row.outlet,
        mediaTypeLabel: mediaTypeLabel(row.media_type),
        note,
      };
      const email = status === 'approved'
        ? pressAccreditationApprovedEmail(emailData)
        : pressAccreditationDeclinedEmail(emailData);

      const result = await sendEmail({
        to: row.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        fromName: SENDERS.media,
        // reviewed_at is unique per decision, so approve → reset → approve
        // still sends, while a retried request for the same decision does not.
        idempotencyKey: `press-${status}-${row.id}-${row.reviewed_at}`,
        tags: [{ name: 'type', value: `press_accreditation_${status}` }],
        logContext: 'press-decision',
      });

      emailed = result.success;
      if (!result.success) {
        console.warn('[Press Status API] decision email failed:', result.error);
      }
    }

    return NextResponse.json({
      success: true,
      status: row.status,
      reviewed_at: row.reviewed_at,
      emailed,
    });
  } catch (err: unknown) {
    console.error('Unexpected error in press status API:', err);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}
