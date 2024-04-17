import MockDate from 'mockdate';

import fetchImpl from 'cross-fetch';
import SlackREST from './index';

describe('helpers', () => {
  globalThis.crypto = require('node:crypto').webcrypto;
  globalThis.fetch = fetchImpl;

  const SlackAPI = new SlackREST();

  // Example taken from  https://api.slack.com/authentication/verifying-requests-from-slack
  const signingSecret = '8f742231b10e8888abcd99yyyzzz85a5';
  const requestBody =
    'token=xyzz0WbapA4vBCDEFasx0q6G&team_id=T1DC2JH3J&team_domain=testteamnow&channel_id=G8PSS9T3V&channel_name=foobar&user_id=U2CERLKJA&user_name=roadrunner&command=%2Fwebhook-collect&text=&response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT1DC2JH3J%2F397700885554%2F96rGlfmibIGlgcZRskXaIFfN&trigger_id=398738663015.47445629121.803a0bc887a14d10d2c447fce8b6703c';

  const xSlackRequestTimestamp = '1531420618';
  const xSlackSignature =
    'v0=a2114d57b48eac39b9ad189dd8316235a7b4a8d21a10bd27519666489c69b503';
  const headers = new Map(
    Object.entries({
      'x-slack-signature': xSlackSignature,
      'X-Slack-Request-Timestamp': xSlackRequestTimestamp,
    })
  );

  const clone = () => ({
    text: () => requestBody,
  });

  const request = { clone, headers };

  test('verifyRequestSignature; all good', async () => {
    MockDate.set(1531420617000);
    await expect(
      SlackAPI.helpers.verifyRequestSignature(request, signingSecret)
    ).resolves.toBe(true);
  });

  test('verifyRequestSignature; older date from Slack', async () => {
    // Throws on older request date - prevent Replay Attacks.
    MockDate.set(1541420617000);
    await expect(
      SlackAPI.helpers.verifyRequestSignature(request, signingSecret)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  test('verifyRequestSignature; bad sig from Slack', async () => {
    MockDate.set(1531420617000);
    request.headers.set('X-Slack-Signature', 'v0=bad_sig_hash');
    await expect(
      SlackAPI.helpers.verifyRequestSignature(request, signingSecret)
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
