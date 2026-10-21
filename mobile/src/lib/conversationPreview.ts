import type { Conversation } from './api';

/** Each service named as the trade of the person who does it. */
const PROFESSIONS: Record<string, string> = {
  plumbing: 'Plumber',
  cleaning: 'Cleaner',
  handyman: 'Handyman',
  manicure: 'Manicurist',
  pedicure: 'Pedicurist',
};

/** The provider's trade for a job's service ("Plumbing" → "Plumber"); an unknown service keeps its own name. */
export function professionFor(service: string | null | undefined): string | null {
  const name = service?.trim();
  if (!name) return null;
  return PROFESSIONS[name.toLowerCase()] ?? name;
}

/**
 * One line for the newest message, like other chat apps: its text, or "Sent a photo" for a
 * photo with no text, starting with "You" when it is the viewer's own. Null when the server
 * sent no last-message fields, or the chat has no messages yet.
 */
export function lastMessagePreview(
  conversation: Partial<Pick<Conversation, 'last_message_body' | 'last_message_has_attachment' | 'last_message_sender_id'>>,
  myId: string | null | undefined,
): string | null {
  const sender = conversation.last_message_sender_id;
  if (!sender) return null;
  const mine = !!myId && sender === myId;
  const text = (conversation.last_message_body ?? '').replace(/\s+/g, ' ').trim();
  if (text) return mine ? `You: ${text}` : text;
  if (conversation.last_message_has_attachment) return mine ? 'You sent a photo' : 'Sent a photo';
  return null;
}
