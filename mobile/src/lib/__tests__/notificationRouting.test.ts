import { resolveNotificationTarget } from '../notificationRouting';

describe('resolveNotificationTarget', () => {
  it('homeowner + application_id routes to proposals', () => {
    expect(
      resolveNotificationTarget('homeowner', { job_id: 'job-1', application_id: 'app-1' }),
    ).toEqual({ kind: 'proposals', jobId: 'job-1' });
  });

  it('homeowner + only job_id routes to job', () => {
    expect(resolveNotificationTarget('homeowner', { job_id: 'job-1' })).toEqual({
      kind: 'job',
      jobId: 'job-1',
    });
  });

  it('provider + job_id routes to job, ignoring application_id', () => {
    expect(
      resolveNotificationTarget('provider', { job_id: 'job-1', application_id: 'app-1' }),
    ).toEqual({ kind: 'job', jobId: 'job-1' });
  });

  it('homeowner with neither job_id nor application_id resolves to none', () => {
    expect(resolveNotificationTarget('homeowner', {})).toEqual({ kind: 'none' });
  });

  it('provider with neither job_id nor application_id resolves to none', () => {
    expect(resolveNotificationTarget('provider', {})).toEqual({ kind: 'none' });
  });

  it('homeowner + application_id but no job_id resolves to none (matches existing screen logic)', () => {
    expect(resolveNotificationTarget('homeowner', { application_id: 'app-1' })).toEqual({
      kind: 'none',
    });
  });
});
