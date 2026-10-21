import { before, after, it } from 'node:test';
import assert from 'node:assert/strict';
import { migratedDatabase } from './harness.mjs';

let db;
const client = '11111111-1111-1111-1111-111111111111';

before(async () => {
  db = await migratedDatabase();
  await db.query(
    "insert into auth.users (id, raw_user_meta_data) values ($1, '{\"role\":\"client\"}')",
    [client],
  );
});

after(async () => {
  await db.close();
});

it('stores a provider cancellation reason and allows it to be absent', async () => {
  const { rows: [job] } = await db.query(`insert into jobs
    (client_id, category_id, title, description, address, latitude, longitude)
    values ($1, 1, 'Test job', 'A valid description for the job.', 'Lipa City', 13.9, 121.1)
    returning cancellation_reason`, [client]);

  assert.deepEqual(job, { cancellation_reason: null });

  const { rows: [updated] } = await db.query(`update jobs
    set cancellation_reason = $2 where client_id = $1
    returning cancellation_reason`, [client, 'Double booked']);

  assert.deepEqual(updated, { cancellation_reason: 'Double booked' });
});

it('rejects cancellation reasons over 200 characters', async () => {
  await assert.rejects(
    db.query(`insert into jobs
      (client_id, category_id, title, description, address, latitude, longitude, cancellation_reason)
      values ($1, 1, 'Test job', 'A valid description for the job.', 'Lipa City', 13.9, 121.1, $2)`,
    [client, 'x'.repeat(201)]),
    /jobs_cancellation_reason_length/,
  );
});
