/**
 * notificationRouting.ts
 *
 * Pure routing decision, extracted from HONotificationsScreen.tsx and
 * SPNotificationsScreen.tsx's near-duplicate `openNotification` logic so
 * there's one rule instead of two, and so it's usable from a push-tap
 * handler in App.tsx (which has no in-app notification row to read from).
 *
 * Deliberately mirrors each screen's existing behavior exactly, not a
 * redesign: homeowners with an application_id go to Proposals, everyone
 * else with a job_id goes to the job, and a provider's application_id is
 * ignored (providers don't have a Proposals screen keyed by job).
 */

export type NotificationTarget =
  | { kind: 'proposals'; jobId: string }
  | { kind: 'job'; jobId: string }
  | { kind: 'none' };

export function resolveNotificationTarget(
  role: 'homeowner' | 'provider',
  data: { job_id?: string; application_id?: string },
): NotificationTarget {
  const jobId = data.job_id;
  if (!jobId) return { kind: 'none' };

  if (role === 'homeowner' && data.application_id) {
    return { kind: 'proposals', jobId };
  }
  return { kind: 'job', jobId };
}
