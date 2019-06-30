# cfw-slack

[`@sagi.io/cfw-slack`](https://www.npmjs.com/package/@sagi.io/cfw-slack) allows
you to use Slack's Web API within Cloudflare Workers.

[![CircleCI](https://circleci.com/gh/sagi/cfw-slack.svg?style=svg&circle-token=e5282bece02d965a8fcde66d517bb599f20aa2e4)](https://circleci.com/gh/sagi/cfw-slack)
[![MIT License](https://img.shields.io/npm/l/@sagi.io/cfw-slack.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![version](https://img.shields.io/npm/v/@sagi.io/cfw-slack.svg?style=flat-square)](http://npm.im/@sagi.io/cfw-slack)

## Installation

~~~
$ npm i @sagi.io/cfw-slack
~~~

## Cloudflare Workers Usage

Initialize `SlackREST`:

~~~js

// Without token:
const SlackREST = require('@sagi.io/cfw-slack')()

// With token:
const botAccessToken = process.env.SLACK_BOT_ACCESS_TOKEN;
const SlackREST = require('@sagi.io/cfw-slack')({ botAccessToken })
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
