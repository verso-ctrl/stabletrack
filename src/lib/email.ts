import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'BarnKeep <noreply@barnkeep.com>';

/**
 * Send email notification when an owner directly invites someone.
 * Fire-and-forget: errors are logged, never block the API response.
 */
export function notifyDirectInvite(email: string, barnName: string, role: string) {
  if (!resend) return;

  resend.emails
    .send({
      from: FROM_EMAIL,
      to: email,
      subject: `You've been invited to ${barnName} on BarnKeep`,
      html: `
        <h2>You're invited!</h2>
        <p>You've been added to <strong>${barnName}</strong> as a <strong>${role}</strong>.</p>
        <p>Sign in to BarnKeep to get started.</p>
        <p style="margin-top:24px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
             style="background:#d97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard
          </a>
        </p>
        <p style="color:#78716c;font-size:13px;margin-top:32px">— The BarnKeep Team</p>
      `,
    })
    .catch((err) => console.error('[email] notifyDirectInvite failed:', err));
}

/**
 * Send email notification when an owner approves a pending join request.
 */
export function notifyJoinApproved(email: string, barnName: string, role: string) {
  if (!resend) return;

  resend.emails
    .send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your request to join ${barnName} has been approved!`,
      html: `
        <h2>Welcome aboard!</h2>
        <p>Your request to join <strong>${barnName}</strong> has been approved. You've been added as a <strong>${role}</strong>.</p>
        <p>Sign in to BarnKeep to start collaborating with your team.</p>
        <p style="margin-top:24px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
             style="background:#d97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Go to Dashboard
          </a>
        </p>
        <p style="color:#78716c;font-size:13px;margin-top:32px">— The BarnKeep Team</p>
      `,
    })
    .catch((err) => console.error('[email] notifyJoinApproved failed:', err));
}

/**
 * Send email notification to the barn owner when someone requests to join via invite code.
 */
export function notifyOwnerOfJoinRequest(ownerEmail: string, requesterName: string, barnName: string) {
  if (!resend) return;

  resend.emails
    .send({
      from: FROM_EMAIL,
      to: ownerEmail,
      subject: `New join request for ${barnName}`,
      html: `
        <h2>New team member request</h2>
        <p><strong>${requesterName}</strong> has requested to join <strong>${barnName}</strong>.</p>
        <p>Head to your Team page to approve or reject this request.</p>
        <p style="margin-top:24px">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/team"
             style="background:#d97706;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Review Request
          </a>
        </p>
        <p style="color:#78716c;font-size:13px;margin-top:32px">— The BarnKeep Team</p>
      `,
    })
    .catch((err) => console.error('[email] notifyOwnerOfJoinRequest failed:', err));
}
