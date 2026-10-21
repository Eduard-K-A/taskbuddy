begin;

create or replace function public.latest_conversation_messages(
  p_conversation_ids uuid[]
)
returns table (
  conversation_id uuid,
  last_message_body text,
  last_message_has_attachment boolean,
  last_message_sender_id uuid
)
language sql
stable
security invoker
set search_path = ''
as $function$
  select distinct on (m.conversation_id)
    m.conversation_id,
    m.body,
    m.attachment_path is not null,
    m.sender_id
  from public.messages m
  where m.conversation_id = any (p_conversation_ids)
  order by m.conversation_id, m.created_at desc, m.id desc;
$function$;

revoke all on function public.latest_conversation_messages(uuid[])
  from public, anon, authenticated;
grant execute on function public.latest_conversation_messages(uuid[])
  to service_role;

notify pgrst, 'reload schema';

commit;
