begin;

alter table public.jobs
  add column if not exists cancellation_reason text
  constraint jobs_cancellation_reason_length
  check (
    cancellation_reason is null
    or char_length(cancellation_reason) <= 200
  );

notify pgrst, 'reload schema';

commit;
