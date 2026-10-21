import { before, after, it } from 'node:test';
import assert from 'node:assert/strict';
import { migratedDatabase } from './harness.mjs';

let db;
const client = '11111111-1111-1111-1111-111111111111';
const provider = '22222222-2222-2222-2222-222222222222';
const conversationWithMessages = '33333333-3333-3333-3333-333333333333';
const conversationWithoutMessages = '44444444-4444-4444-4444-444444444444';

before(async () => {
  db = await migratedDatabase();
  await db.query(`insert into auth.users (id, raw_user_meta_data) values
    ($1, '{"role":"client"}'), ($2, '{"role":"provider"}')`, [client, provider]);
  const { rows: [jobWithMessages] } = await db.query(`insert into jobs
    (client_id, category_id, title, description, address, latitude, longitude)
    values ($1, 1, 'Chat job one', 'A valid description for the job.', 'Lipa City', 13.9, 121.1)
    returning id`, [client]);
  const { rows: [jobWithoutMessages] } = await db.query(`insert into jobs
    (client_id, category_id, title, description, address, latitude, longitude)
    values ($1, 1, 'Chat job two', 'A valid description for the job.', 'Lipa City', 13.9, 121.1)
    returning id`, [client]);
  await db.query(`insert into conversations (id, job_id, client_id, provider_id)
    values ($1, $2, $4, $5), ($3, $6, $4, $5)`, [
    conversationWithMessages,
    jobWithMessages.id,
    conversationWithoutMessages,
    client,
    provider,
    jobWithoutMessages.id,
  ]);
  await db.query(`insert into messages
    (conversation_id, sender_id, body, attachment_path, created_at)
    values ($1, $2, 'Are you on the way?', null, '2026-10-20T10:00:00Z'),
           ($1, $3, '', 'provider/photo.jpg', '2026-10-20T10:05:00Z')`, [
    conversationWithMessages,
    client,
    provider,
  ]);
});

after(async () => {
  await db.close();
});

it('returns only the newest message in each requested conversation', async () => {
  const { rows } = await db.query(
    `select * from public.latest_conversation_messages($1::uuid[])`,
    [[conversationWithMessages, conversationWithoutMessages]],
  );

  assert.deepEqual(rows, [
    {
      conversation_id: conversationWithMessages,
      last_message_body: '',
      last_message_has_attachment: true,
      last_message_sender_id: provider,
    },
  ]);
});

it('limits function execution to the backend service role', async () => {
  const { rows: [privileges] } = await db.query(`select
    has_function_privilege('service_role', 'public.latest_conversation_messages(uuid[])', 'execute') as service_role,
    has_function_privilege('anon', 'public.latest_conversation_messages(uuid[])', 'execute') as anon,
    has_function_privilege('authenticated', 'public.latest_conversation_messages(uuid[])', 'execute') as authenticated`);

  assert.deepEqual(privileges, {
    service_role: true,
    anon: false,
    authenticated: false,
  });
});
