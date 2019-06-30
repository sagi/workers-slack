require('@sagi.io/globalthis');
const fetchImpl = require('cross-fetch');
const { URLSearchParams: URLSearchParamsImpl } = require('url');

(async () => {
  // Cloudflare Workers have fetch and URLSearchParams in their global scope.
  // Let's imitate that.
  globalThis.fetch = fetchImpl;
  globalThis.URLSearchParams = URLSearchParamsImpl;

  const botAccessToken = process.env.SLACK_BOT_ACCESS_TOKEN;

  // Instantiate without a token - i.e. token must be passed within formData
  const SlackREST1 = require('../')();
  const formData1 = { token: botAccessToken };
  const teamInfo1 = await SlackREST1.team.info(formData1);
  console.log(JSON.stringify(teamInfo1, null, 2));

  // Instantiate with a token that is provided to SlackREST
  const SlackREST2 = require('../')({ botAccessToken });
  const formData2 = {};
  const teamInfo2 = await SlackREST2.team.info(formData2);
  console.log(JSON.stringify(teamInfo2, null, 2));

  // Node.js doesn't have fetch and URLSearchParams in its global scope.
  // Let's imitate that and provide a token tken to SlackREST.
  globalThis.fetch = null;
  globalThis.URLSearchParams = null;

  const SlackREST3 = require('../')({
    botAccessToken,
    fetchImpl,
    URLSearchParamsImpl,
  });
  const formData3 = {};
  const teamInfo3 = await SlackREST3.team.info(formData3);
  console.log(JSON.stringify(teamInfo3, null, 2));
})();
