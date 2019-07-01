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
    const formDataWithoutToken = { channel: 'CAFEBABE', text: 'hey there!' };

    const json = jest.fn();
    const fetchMock = jest.fn(() => ({ json }));
    globalThis.fetch = fetchMock;
    const resBodyJSON1 = { ok: true, data: { just: 'random' } };

    const formDataWithToken = api.addTokenToFormData(
      botAccessToken,
      formDataWithoutToken
    );
    globalThis.URLSearchParams = URLSearchParamsImpl;
    const expectedBody = api.getBodyFromFormData(formDataWithToken);

    const method = 'chat.postMessage';
    const expectedUrl = `https://slack.com/api/${method}`;
    const expectedOptions = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: expectedBody,
    };

    json.mockReturnValueOnce(resBodyJSON1);

    await expect(
      api.slackAPIRequest(method, null)(formDataWithToken)
    ).resolves.toEqual(resBodyJSON1);

    expect(globalThis.fetch).toHaveBeenCalledWith(expectedUrl, expectedOptions);

    const resBodyJSON2 = { ok: false, error: 'not_authed' };
    json.mockReturnValueOnce(resBodyJSON2);

    await expect(
      api.slackAPIRequest(method, botAccessToken)(formDataWithoutToken)
    ).rejects.toEqual(new Error('not_authed'));

    await expect(
      api.slackAPIRequest(method, null)(formDataWithoutToken)
    ).rejects.toEqual(
      new Error(
        `@sagi.io/cfw-slack: Neither botAccessToken nor formData.token were provided.`
      )
    );
  });

  test('setGlobals', () => {
    globalThis.fetch = null;
    globalThis.URLSearchParams = null;

    let fetchImpl = null;
    let URLSearchParamsImpl = null;
    expect(() => api.setGlobals(fetchImpl, URLSearchParamsImpl)).toThrow(
      new Error('@sagi.io/cfw-slack: No fetch nor fetchImpl were found.')
    );

    expect(() => api.setGlobals()).toThrow(
      new Error('@sagi.io/cfw-slack: No fetch nor fetchImpl were found.')
    );

    fetchImpl = 1;
    URLSearchParamsImpl = null;
    expect(() => api.setGlobals(fetchImpl, URLSearchParamsImpl)).toThrow(
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

    const Slack = api.SlackREST();

    json.mockReturnValueOnce({ ok: true, data: { just: 'random' } });

    const method = 'chat.postMessage';
    const channel = 'DEADBEEF';
    const text = 'hello there';
    const formDataWithoutToken = { channel, text };

    const formDataWithToken = api.addTokenToFormData(
      botAccessToken,
      formDataWithoutToken
    );

    await get(Slack, method)(formDataWithToken);
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

  describe('Slack Methods', () => {
    test(`method that doesn't require a token - oauth.access`, async () => {
      const json = jest.fn();
      const fetchMock = jest.fn(() => ({ json }));
      globalThis.fetch = fetchMock;

      const SlackAPIWithoutToken = api.SlackREST({
        fetchImpl,
        URLSearchParamsImpl,
      });

      json.mockReturnValueOnce({ ok: true, data: { just: 'random' } });

      const client_id = 'DEADBEEF';
      const client_secret = 'hello there';
      const formDataWithoutToken = { client_id, client_secret, etc: 'etc' };

      await SlackAPIWithoutToken.oauth.access(formDataWithoutToken);

      const expectedBody = api.getBodyFromFormData(formDataWithoutToken);

      const expectedOptions = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: expectedBody,
      };

      const expectedUrl = `https://slack.com/api/oauth.access`;
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expectedUrl,
        expectedOptions
      );
    });

    Object.keys(api.METHODS).map(method => {
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
