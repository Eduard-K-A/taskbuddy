import type { Job, NotificationRow } from './api';

/** True when the hired provider cancelled (declined) the booking, not the client. */
export function cancelledByProvider(job: Pick<Job, 'status' | 'assigned_provider_id' | 'cancelled_by'>): boolean {
  return job.status === 'cancelled' && !!job.assigned_provider_id && job.cancelled_by === job.assigned_provider_id;
}

/**
 * The reason the provider gave when they declined, for the client. The job's own
 * `cancellation_reason` once the API sends it (backend handoff, 2026-10-21). Until then it is
 * read from the "Booking declined" notification, whose body is `<name> declined "<title>": <reason>`;
 * only the 50 newest notifications are listed, so an old decline may have none. Null when none is found.
 */
export function providerCancelReason(
  job: Pick<Job, 'id' | 'title' | 'cancellation_reason'>,
  notifications: readonly NotificationRow[] | null,
): string | null {
  const saved = job.cancellation_reason?.trim();
  if (saved) return saved;
  const marker = `declined "${job.title}": `;
  for (const row of notifications ?? []) {
    if (row.title !== 'Booking declined' || row.data?.job_id !== job.id) continue;
    const at = row.body.indexOf(marker);
    const reason = (at === -1 ? row.body : row.body.slice(at + marker.length)).trim();
    if (reason) return reason;
  }
  return null;
}
