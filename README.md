# workers-slack

[`@sagi.io/workers-slack`](https://www.npmjs.com/package/@sagi.io/workers-slack) allows
you to use Slack's Web API within Cloudflare Workers.

⭐ We use it at **[OpenSay](https://opensay.co/s=workers-slack)** to access Slack's REST API through Cloudflare Workers.

Here is a [blog post](https://sagi.io/slack-api-for-cloudflare-workers/) that explains why I built it.


[![CircleCI](https://circleci.com/gh/sagi/workers-slack.svg?style=svg&circle-token=e5282bece02d965a8fcde66d517bb599f20aa2e4)](https://circleci.com/gh/sagi/workers-slack)
[![MIT License](https://img.shields.io/npm/l/@sagi.io/workers-slack.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![version](https://img.shields.io/npm/v/@sagi.io/workers-slack.svg?style=flat-square)](http://npm.im/@sagi.io/workers-slack)

## Installation

~~~
$ npm i @sagi.io/workers-slack
~~~

## Cloudflare Workers Usage

Initialize `SlackREST`:

~~~js

// Without token:
const SlackREST = require('@sagi.io/workers-slack')
const SlackAPI = new SlackREST()

// With token:
const botAccessToken = process.env.SLACK_BOT_ACCESS_TOKEN;
const SlackREST = require('@sagi.io/workers-slack')
const SlackAPI = new SlackREST({ botAccessToken })
~~~

You can then use supported [Slack methods](https://api.slack.com/methods).
For instance, here's how to use the [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage) method:

~~~js

// SlackREST was initialized with a token
const formData = { channel: 'general', text: 'hello world'}

// SlackREST wasn't initialized with a token
const botAccessToken = process.env.SLACK_BOT_ACCESS_TOKEN;
const formData = { token: botAcccessToken, channel: 'general', text: 'hello world' }

const result = await SlackREST.chat.postMessage(formData)
~~~

### Verifying requests from Slack

More information [here](https://api.slack.com/authentication/verifying-requests-from-slack).

The `SlackREST.helpers.verifyRequestSignature` method returns `true` when a signature from Slack is verified. Otherwise it throws an error.

~~~js
const SlackREST = require('@sagi.io/workers-slack')

const signingSecret = process.env.SLACK_SIGNING_SECRET
const isVerifiedRequest = await SlackREST.helpers.verifyRequestSignature(request, signingSecret)
~~~
