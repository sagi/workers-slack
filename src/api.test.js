import '@sagi.io/globalthis';

import fetchImpl from 'cross-fetch';
import { URLSearchParams as URLSearchParamsImpl } from 'url';
import * as api from './api';
import get from 'lodash.get';

describe('api', () => {
  test('getSlackAPIURL', () => {
    const method = 'x.y.z';
    const expected = `https://slack.com/api/${method}`;
    expect(api.getSlackAPIURL(method)).toEqual(expected);
  });

  test('addTokenToFormData', () => {
    const token = 'DEADBEEF';
    const formData = { a: 'b' };
    const expectedFormData = { token, a: 'b' };

    expect(api.addTokenToFormData(token, formData)).toEqual(expectedFormData);
  });

  test('dotStringToObj', () => {
    const method = 'x.y.z';
    const value = 'Why so Serious!?!';
    const expected = { x: { y: { z: value } } };

    expect(api.dotStringToObj(method, value)).toEqual(expected);
  });

  test('slackAPIRequest', async () => {
    const botAccessToken = 'xoxb-1234-5678-abcdefg';
    const url = 'https://slack.com/api/chat.postMessage';
    const formData = { channel: 'CAFEBABE', text: 'hey there!' };

    const json = jest.fn();
    const fetchMock = jest.fn(() => ({ json }));
    globalThis.fetch = fetchMock;
    const resBodyJSON1 = { ok: true, data: { just: 'random' } };

    const formDataWithToken = api.addTokenToFormData(botAccessToken, formData);
    const expectedBody = api.getBodyFromFormData(formDataWithToken);

    const expectedUrl = `https://slack.com/api/chat.postMessage`;
    const expectedOptions = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: expectedBody,
    };

    json.mockReturnValueOnce(resBodyJSON1);

    await expect(
      api.slackAPIRequest(url, botAccessToken)(formData)
    ).resolves.toEqual(resBodyJSON1);

    expect(globalThis.fetch).toHaveBeenCalledWith(expectedUrl, expectedOptions);

    const resBodyJSON2 = { ok: false, error: 'not_authed' };
    json.mockReturnValueOnce(resBodyJSON2);

    await expect(
      api.slackAPIRequest(url, botAccessToken)(formData)
    ).rejects.toEqual(new Error('not_authed'));
  });

  test('verifyGlobals', () => {
    globalThis.fetch = null;
    globalThis.URLSearchParams = null;

    let fetchImpl = null;
    let URLSearchParamsImpl = null;
    expect(() => api.verifyGlobals(fetchImpl, URLSearchParamsImpl)).toThrow(
      new Error('@sagi.io/cfw-slack: No fetch nor fetchImpl were found.')
    );

    expect(() => api.verifyGlobals()).toThrow(
      new Error('@sagi.io/cfw-slack: No fetch nor fetchImpl were found.')
    );

    fetchImpl = 1;
    URLSearchParamsImpl = null;
    expect(() => api.verifyGlobals(fetchImpl, URLSearchParamsImpl)).toThrow(
      new Error(
        '@sagi.io/cfw-slack: No URLSearchParams nor URLSearchParamsImpl were found.'
      )
    );
  });

  test('SlackREST', async () => {
    const botAccessToken = 'xoxb-1234-5678-abcdefg';

    const json = jest.fn();
    const fetchMock = jest.fn(() => ({ json }));
    globalThis.fetch = fetchMock;

    globalThis.URLSearchParams = URLSearchParamsImpl;

    const Slack = api.SlackREST({ botAccessToken });

    json.mockReturnValueOnce({ ok: true, data: { just: 'random' } });

    const method = 'chat.postMessage';
    const channel = 'DEADBEEF';
    const text = 'hello there';
    const formData = { channel, text };

    await get(Slack, method)(formData);

    const formDataWithToken = api.addTokenToFormData(botAccessToken, formData);
    const expectedBody = api.getBodyFromFormData(formDataWithToken);

    const expectedOptions = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: expectedBody,
    };

    const expectedUrl = `https://slack.com/api/${method}`;
    expect(globalThis.fetch).toHaveBeenCalledWith(expectedUrl, expectedOptions);

    globalThis.URLSearchParams = null;
  });

  describe('methods', () => {
    api.methods.map(method => {
      test(`${method}`, async () => {
        const botAccessToken = 'xoxb-1234-5678-abcdefg';

        const json = jest.fn();
        const fetchMock = jest.fn(() => ({ json }));
        globalThis.fetch = fetchMock;

        const Slack = api.SlackREST({
          botAccessToken,
          fetchImpl,
          URLSearchParamsImpl,
        });

        json.mockReturnValueOnce({ ok: true, data: { just: 'random' } });

        const channel = 'DEADBEEF';
        const text = 'hello there';
        const formData = { channel, text };

        await get(Slack, method)(formData);

        const formDataWithToken = api.addTokenToFormData(
          botAccessToken,
          formData
        );
        const expectedBody = api.getBodyFromFormData(formDataWithToken);

        const expectedOptions = {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: expectedBody,
        };

        const expectedUrl = `https://slack.com/api/${method}`;
        expect(globalThis.fetch).toHaveBeenCalledWith(
          expectedUrl,
          expectedOptions
        );
      });
    });
  });
});
