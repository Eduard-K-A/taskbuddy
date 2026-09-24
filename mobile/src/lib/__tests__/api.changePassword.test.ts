import { api, configureApiAuth } from '../api';

/**
 * A wrong current password returns 401 (QA #10). Without `skipRefreshOn401`,
 * `authRequest` treats any 401 as an expired session, refreshes the token
 * and re-sends the same wrong password a second time before giving up.
 */
describe('api.changePassword — no refresh-retry on a wrong current password (#10)', () => {
  const jsonResponse = (status: number, body: unknown) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(JSON.stringify(body)),
    } as Response);

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects with the server message and does not call the refresher', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => jsonResponse(401, { message: 'Current password is incorrect' }));
    const refresher = jest.fn();
    configureApiAuth(() => 'old-token', refresher);

    await expect(
      api.changePassword({ current_password: 'wrong', new_password: 'newpassword1' }),
    ).rejects.toMatchObject({ message: 'Current password is incorrect', status: 401 });

    expect(refresher).not.toHaveBeenCalled();
    // Exactly one request: no retry with a refreshed token.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('an ordinary authRequest call still refreshes and retries once on 401', async () => {
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementationOnce(() => jsonResponse(401, { message: 'Unauthorized' }))
      .mockImplementationOnce(() => jsonResponse(200, []));
    const refresher = jest.fn().mockResolvedValue('new-token');
    configureApiAuth(() => 'expired-token', refresher);

    await expect(api.myApplications()).resolves.toEqual([]);

    expect(refresher).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // The retry used the refreshed token, not the expired one.
    const secondCallHeaders = (fetchMock.mock.calls[1][1] as RequestInit).headers as Record<string, string>;
    expect(secondCallHeaders.Authorization).toBe('Bearer new-token');
  });

  it('still refreshes and retries once when the 401 is a genuinely expired token, not a wrong password', async () => {
    // The backend's JwtAuthGuard rejects an expired/invalid token with this
    // message, before changePassword's own re-auth logic ever runs — a
    // different message than 'Current password is incorrect'. A user who
    // leaves the Change Password screen open past token expiry should still
    // get a silent refresh-and-retry, not a raw error (code-review finding).
    const fetchMock = jest
      .spyOn(globalThis, 'fetch')
      .mockImplementationOnce(() => jsonResponse(401, { message: 'Invalid or expired token' }))
      .mockImplementationOnce(() => jsonResponse(200, { success: true }));
    const refresher = jest.fn().mockResolvedValue('new-token');
    configureApiAuth(() => 'expired-token', refresher);

    await expect(
      api.changePassword({ current_password: 'correct-password', new_password: 'newpassword1' }),
    ).resolves.toEqual({ success: true });

    expect(refresher).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCallHeaders = (fetchMock.mock.calls[1][1] as RequestInit).headers as Record<string, string>;
    expect(secondCallHeaders.Authorization).toBe('Bearer new-token');
  });
});
