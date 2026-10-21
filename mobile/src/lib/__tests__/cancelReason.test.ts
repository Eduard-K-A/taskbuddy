import type { NotificationRow } from '../api';
import { cancelledByProvider, providerCancelReason } from '../cancelReason';

const declined = (body: string, over: Partial<NotificationRow> = {}): NotificationRow => ({
  id: 'n1', type: 'job_update', title: 'Booking declined', body, read_at: null,
  created_at: '2026-10-21T00:00:00Z', data: { job_id: 'job-1' }, ...over,
});
const JOB = { id: 'job-1', title: 'Fix the sink', cancellation_reason: null };

describe('cancelledByProvider', () => {
  const base = { status: 'cancelled' as const, assigned_provider_id: 'p1' };
  it('is true when the hired provider cancelled', () => expect(cancelledByProvider({ ...base, cancelled_by: 'p1' })).toBe(true));
  it('is false when the client cancelled', () => expect(cancelledByProvider({ ...base, cancelled_by: 'client-1' })).toBe(false));
  it('is false when the API did not say who cancelled', () => expect(cancelledByProvider(base)).toBe(false));
  it('is false for a job that is not cancelled', () => expect(cancelledByProvider({ ...base, status: 'completed', cancelled_by: 'p1' })).toBe(false));
  it('is false with no hired provider', () => expect(cancelledByProvider({ status: 'cancelled', assigned_provider_id: null, cancelled_by: null })).toBe(false));
});

describe('providerCancelReason', () => {
  it('uses the reason saved on the job first', () => {
    expect(providerCancelReason({ ...JOB, cancellation_reason: ' Tools broke ' }, [declined('Ana declined "Fix the sink": Sick')])).toBe('Tools broke');
  });
  it('reads the reason from the Booking declined notification', () => {
    expect(providerCancelReason(JOB, [declined('Ana Reyes declined "Fix the sink": Family emergency. Sorry!')])).toBe('Family emergency. Sorry!');
  });
  it('copes with a job title that itself contains a colon and quotes', () => {
    const job = { ...JOB, title: 'Sink: "urgent"' };
    expect(providerCancelReason(job, [declined('Ana declined "Sink: "urgent"": Not available')])).toBe('Not available');
  });
  it("ignores other jobs' notifications and other kinds of notification", () => {
    expect(providerCancelReason(JOB, [
      declined('Ana declined "Other job": Busy', { data: { job_id: 'job-2' } }),
      declined('Job started', { title: 'Job update' }),
    ])).toBeNull();
  });
  it('shows the whole notification text when its wording is not the expected one', () => {
    expect(providerCancelReason(JOB, [declined('Ana cannot make it today')])).toBe('Ana cannot make it today');
  });
  it('takes the newest matching notification (the list is newest first)', () => {
    expect(providerCancelReason(JOB, [
      declined('Ana declined "Fix the sink": Second'),
      declined('Ana declined "Fix the sink": First', { id: 'n0' }),
    ])).toBe('Second');
  });
  it('is null with no notifications', () => {
    expect(providerCancelReason(JOB, null)).toBeNull();
    expect(providerCancelReason(JOB, [])).toBeNull();
  });
});
