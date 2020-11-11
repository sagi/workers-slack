import '@sagi.io/globalthis';
import merge from 'lodash.merge';

export const METHODS = {
  'im.open': { token: true },
  'team.info': { token: true },
  'users.list': { token: true },
  'users.info': { token: true },
  'dialog.open': { token: true },
  'groups.list': { token: true },
  'groups.info': { token: true },
  'oauth.access': { token: false },
  'oauth.v2.access': { token: false },
  'conversations.list': { token: true },
  'conversations.join': { token: true },
  'conversations.open': { token: true },
  'conversations.replies': { token: true },
  'conversations.info': { token: true },
  'channels.list': { token: true },
  'channels.info': { token: true },
  'reactions.add': { token: true },
  'apps.uninstall': { token: true },
  'users.identity': { token: true },
  'users.profile.get': { token: true },
  'chat.update': { token: true },
  'chat.postMessage': { token: true },
  'chat.postEphemeral': { token: true },
  'views.publish': { token: true },
  'views.open': { token: true },
  'views.push': { token: true },
  'views.update': { token: true },
};

export const getSlackAPIURL = method => `https://slack.com/api/${method}`;

export const addTokenToFormData = (botAccessToken, formData) =>
  Object.assign({}, formData, { token: botAccessToken });

export const dotStringToObj = (str, value) => {
  const obj = {};
  str.split('.').reduce((acc, v, i, arr) => {
    acc[v] = i + 1 === arr.length ? value : (acc[v] = {});
    return acc[v];
  }, obj);
  return obj;
};

export const getBodyFromFormData = formData => {
  const body = new URLSearchParams();
  Object.entries(formData).map(([k, v]) => body.append(k, v));
  return body;
};

export const slackAPIRequest = (method, botAccessToken) => async (
  formData = {}
) => {
  if (!botAccessToken && METHODS[method].token && !formData['token']) {
    throw new Error(
      `@sagi.io/workers-slack: Neither botAccessToken nor formData.token were provided. method: ${method}.`
    );
  }
  const url = getSlackAPIURL(method);

  const formDataWithToken = botAccessToken
    ? addTokenToFormData(botAccessToken, formData)
    : formData;

  const body = getBodyFromFormData(formDataWithToken);

  const headers = { 'content-type': 'application/x-www-form-urlencoded' };
  const options = { method: 'POST', body, headers };

  const postMsgRes = await fetch(url, options);
  const postMsgResObj = await postMsgRes.json();

  const { ok } = postMsgResObj;

  if (!ok) {
    const { error } = postMsgResObj;
    throw new Error(error);
  }

  return postMsgResObj;
};

export const setGlobals = (fetchImpl = null, URLSearchParamsImpl = null) => {
  if (!globalThis.fetch) {
    if (!fetchImpl) {
      throw new Error(
        `@sagi.io/workers-slack: No fetch nor fetchImpl were found.`
      );
    } else {
      globalThis.fetch = fetchImpl;
    }
  }

  if (!globalThis.URLSearchParams) {
    if (!URLSearchParamsImpl) {
      throw new Error(
        `@sagi.io/workers-slack: No URLSearchParams nor URLSearchParamsImpl were found.`
      );
    } else {
      globalThis.URLSearchParams = URLSearchParamsImpl;
    }
  }
};

export const SlackREST = function({
  botAccessToken = null,
  fetchImpl = null,
  URLSearchParamsImpl = null,
} = {}) {
  setGlobals(fetchImpl, URLSearchParamsImpl);

  const methodsObjArr = Object.keys(METHODS).map(method => {
    const methodAPIRequest = slackAPIRequest(method, botAccessToken);
    return dotStringToObj(method, methodAPIRequest);
  });

  const SlackAPI = merge(...methodsObjArr);

  return SlackAPI;
};
