require('@sagi.io/globalthis');
const fetchImpl = require('cross-fetch');
const { URLSearchParams: URLSearchParamsImpl } = require('url');

(async () => {
  // Cloudflare Workers have fetch and URLSearchParams in their global scope.
  // Let's imitate that.
  globalThis.fetch = fetchImpl;
  globalThis.URLSearchParams = URLSearchParamsImpl;

  const botAccessToken = process.env.SLACK_BOT_ACCESS_TOKEN;

  const SlackREST = require('../');

  // Instantiate without a token - i.e. token must be passed within formData
  const SlackAPI1 = new SlackREST();
  const formData1 = { token: botAccessToken };
  const teamInfo1 = await SlackAPI1.team.info(formData1);
  console.log(JSON.stringify(teamInfo1, null, 2));

  // Instantiate with a token that is provided to SlackREST
  const SlackAPI2 = new SlackREST({ botAccessToken });
  const formData2 = {};
  const teamInfo2 = await SlackAPI2.team.info(formData2);
  console.log(JSON.stringify(teamInfo2, null, 2));

  // Node.js doesn't have fetch and URLSearchParams in its global scope.
  // Let's imitate that and provide a token tken to SlackREST.
  globalThis.fetch = null;
  globalThis.URLSearchParams = null;

  const SlackAPI3 = new SlackREST({
    botAccessToken,
    fetchImpl,
    URLSearchParamsImpl,
  });
  const formData3 = {};
  const teamInfo3 = await SlackAPI3.team.info(formData3);
  console.log(JSON.stringify(teamInfo3, null, 2));
})();
