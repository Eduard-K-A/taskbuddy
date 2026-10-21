import { lastMessagePreview, professionFor } from '../conversationPreview';

describe('professionFor', () => {
  it.each([
    ['Plumbing', 'Plumber'],
    ['Cleaning', 'Cleaner'],
    ['Handyman', 'Handyman'],
    ['Manicure', 'Manicurist'],
    ['Pedicure', 'Pedicurist'],
  ])('%s is done by a %s', (service, profession) => {
    expect(professionFor(service)).toBe(profession);
  });
  it('ignores case and spaces', () => expect(professionFor('  plumbing ')).toBe('Plumber'));
  it('keeps an unknown service name as it is', () => expect(professionFor('Aircon cleaning')).toBe('Aircon cleaning'));
  it('is null with no service', () => {
    expect(professionFor(null)).toBeNull();
    expect(professionFor(undefined)).toBeNull();
    expect(professionFor('   ')).toBeNull();
  });
});

describe('lastMessagePreview', () => {
  const ME = 'me';
  const msg = (body: string | null, has_attachment: boolean, sender: string | null) => ({
    last_message_body: body, last_message_has_attachment: has_attachment, last_message_sender_id: sender,
  });
  it('is null when the server sent no last-message fields', () => expect(lastMessagePreview({}, ME)).toBeNull());
  it('is null when the chat has no messages yet', () => expect(lastMessagePreview(msg(null, false, null), ME)).toBeNull());
  it('shows their text as it is', () => expect(lastMessagePreview(msg('On my way', false, 'them'), ME)).toBe('On my way'));
  it('starts my own text with You:', () => expect(lastMessagePreview(msg('See you at 3', false, ME), ME)).toBe('You: See you at 3'));
  it('folds line breaks into one line', () => expect(lastMessagePreview(msg('Line one\n\n line two', false, 'them'), ME)).toBe('Line one line two'));
  it('says Sent a photo for their photo with no text', () => expect(lastMessagePreview(msg('', true, 'them'), ME)).toBe('Sent a photo'));
  it('says You sent a photo for my photo with no text', () => expect(lastMessagePreview(msg('', true, ME), ME)).toBe('You sent a photo'));
  it('shows the text when a photo has some', () => expect(lastMessagePreview(msg('Here it is', true, 'them'), ME)).toBe('Here it is'));
  it('treats a missing viewer id as not mine', () => expect(lastMessagePreview(msg('Hi', false, ME), null)).toBe('Hi'));
  it('is null for a message with neither text nor photo', () => expect(lastMessagePreview(msg('  ', false, 'them'), ME)).toBeNull());
});
