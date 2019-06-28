import '@sagi.io/globalthis';
import merge from 'lodash.merge';
import { utils } from './utils';

export const METHODS = [
  'im.open',
  'team.info',
  'users.list',
  'dialog.open',
  'groups.list',
  'oauth.access',
  'channels.list',
  'reactions.add',
  'apps.uninstall',
  'chat.postMessage',
  'chat.postEphemeral',
];

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

export const slackAPIRequest = (url, botAccessToken) => async (
  formData = {}
) => {
  const formDataWithToken = addTokenToFormData(botAccessToken, formData);
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
      throw new Error(`@sagi.io/cfw-slack: No fetch nor fetchImpl were found.`);
    } else {
      globalThis.fetch = fetchImpl;
    }
  }

  if (!globalThis.URLSearchParams) {
    if (!URLSearchParamsImpl) {
      throw new Error(
        `@sagi.io/cfw-slack: No URLSearchParams nor URLSearchParamsImpl were found.`
      );
    } else {
      globalThis.URLSearchParams = URLSearchParamsImpl;
    }
  }
};

export const SlackREST = ({
  botAccessToken,
  fetchImpl = null,
  URLSearchParamsImpl = null,
}) => {
  setGlobals(fetchImpl, URLSearchParamsImpl);

  const methodsObjArr = METHODS.map(method => {
    const url = getSlackAPIURL(method);
    const methodAPIRequest = slackAPIRequest(url, botAccessToken);
    return dotStringToObj(method, methodAPIRequest);
  });

  const SlackAPI = merge(...methodsObjArr);
  SlackAPI.utils = utils(SlackAPI);

  return SlackAPI;
};
