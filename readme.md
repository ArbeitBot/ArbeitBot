[![ArbeitBot](/docs/header.png?raw=true)](https://arbeitbot.com/)

[![Product Hunt](/docs/ph.png?raw=true)](https://www.producthunt.com/tech/arbeitbot)
[![Habrahabr](/docs/habr.png?raw=true)](https://habrahabr.ru/post/310434/)
[![Hacker News](/docs/hackernews.png?raw=true)](https://news.ycombinator.com/item?id=12821984)
[![Spark](/docs/spark.png?raw=true)](https://spark.ru/startup/arbeitbot/blog/18257/kak-arbeitbot-poluchil-pervie-1250-ustanovok)
[![Telegram Bot Store](/docs/bs.png?raw=true)](https://storebot.me/bot/arbeit_bot)
[![Reddit](/docs/reddit.png?raw=true)](https://www.reddit.com/r/javascript/comments/59y20u/first_free_opensource_telegram_freelance_market/)
[![vc.ru](/docs/vc.png?raw=true)](https://vc.ru/p/arbeitbot)

First free open-source Telegram freelance market. Built by people for people.

- [About Arbeit Bot](#about-arbeit-bot)
- [Want to contribute?](#want-to-contribute)
- [Installation](#installation)
  - [Necessary environment variables](#necessary-environment-variables)
  - [How to get ssl certificate and key](#how-to-get-ssl-certificate-and-key)
  - [I got it working, what's next?](#i-got-it-working-whats-next)
- [Where to seek help](#where-to-seek-help)
- [License](#license)

# About Arbeit Bot

Classic freelance markets have long been terrible: not only are they old, slow, expensive [(on average they take ~22% of your money)](https://support.upwork.com/hc/en-us/articles/211062538-Freelancer-Service-Fees), but also profit-oriented and not customer-oriented. Heck, [read this post about why upwork sucks](https://collegetimes.co/upwork-sucks/)! I mean, when I first started on Elance back in 2012 fees were around 10%, then they launched paid accounts, then raised fees to 15% and then finally raised them to the current figures when merging into Upwork.

[@arbeit_bot](https://telegram.me/arbeit_bot) — is freelance market, redesigned. Imagine if you didn't have to pay a dime to get job offers or the list of the best freelancers on the market. Imagine if you didn't get spammed with amateur job bids from sketchy companies or freelancers. Imagine if you could always contribute to your favourite freelance market and if all freelancer ranking algorithms were transparent. Imagine if you didn't have to copy-paste the same job bid from client to client. Imagined? Good, because that's what ArbeitBot is offering to you.

We are a completely non-profit organization driven by volunteer contributors who spend their spare time to make a difference in the freelancers' lives. We wanted to build a freelance market where the only person who matters is the client — not stockholders or greedy businessmen. But, if you found this text here, we would assume that you are aware of what ArbeitBot is and would want to help us out.

Well, first, please check out our [development roadmap](https://github.com/ArbeitBot/ArbeitBot/issues) to be on track with all the current tasks that we are working on. Then, continue reading.

# Want to contribute?

ArbeitBot is a completely non-profit and community-driven project which really depends on it's contributors. If you feel adventurous or just want to help out the project — please do so either by fixing issues from [the list](https://github.com/ArbeitBot/ArbeitBot/issues) and creating a pull request or by submitting issues to our [bug tracker](https://github.com/ArbeitBot/ArbeitBot/issues).

The best option to add a feature to the codebase is to first [open an issue](https://github.com/ArbeitBot/ArbeitBot/issues) with label `Enhancement` (to notify us that you are working on something) where you may also communicate with initial contributors, then fork this project and create a pull request.

If you want to fix a bug from [the list of the issues](https://github.com/ArbeitBot/ArbeitBot/issues), please comment under the issue that you are working on it, then fork the repository and create a pull request.

Please use [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) as the main tool to follow our project-wide code style.

We highly appreciate any help and that's why the most active contributors will get a 🐝 emoji beside their freelancer profile to stand out among other freelancers of the same category, like that:

![@isamsky profile](/docs/special.png?raw=true)

By the way, did you know how [@isamsky](https://telegram.me/isamsky) got his special symbol? He is the creator of our awesome logo!

# Installation

So, you decided to help us out — good, good. First, ArbeitBot can be launched with the latest [LTS release of Node.js](https://nodejs.org) — so go ahead and install it if you didn't do that yet. Secondly, we use MongoDB as our database, so go ahead and [get it as well](https://www.mongodb.com/). The next step would obviously be to run `npm i` in the root folder of the project to install all the dependencies with [Node Package Manager](https://www.npmjs.com/). Then you would want to setup some [environment variables](https://en.wikipedia.org/wiki/Environment_variable) to support configuration abstraction.

### Necessary environment variables

- `TELEGRAM_API_KEY` — api key for your telegram bot (obtained from [@BotFather](https://telegram.me/botfather))
- `MONGO_DB_URL` — url of your mongo database (i.e. `mongodb://localhost:27017/`)
- `ADMIN_CHAT_ID` — chat id of Telegram channel that should receive logs from bot
- `USE_WEBHOOKS` — flag identifying if bot should use [webhooks](https://core.telegram.org/bots/api/#setwebhook) or should fetch updates every 1000 seconds (webhooks make bot faster but require custom server with SSL setup)
- _(Optional)_ `WEBHOOK_CALLBACK_URL` — url that should be used by Telegram servers for webhooks, should be `https`
- _(Optional)_ `SSL_CERTIFICATE_PATH` — path to ssl certificate for webhooks
- _(Optional)_ `SSH_RSA_PATH` — path to ssh private certificate for webhooks (should not be password encrypted)
- _(Optional)_ `ARBEIT_BOT_PRODUCTION_URL` — url of your production server for flightplan (if you use flightplan)

### How to get ssl certificate and key

Fortunately, Telegram webhooks support self-signed SSL certificates. You can use this command on server to create self-signed ssl key that can be accepted by Telegram servers:

`openssl req -newkey rsa:2048 -sha256 -nodes -keyout key.key -x509 -days 365 -out crt.pem -subj "/C=US/ST=New York/L=Brooklyn/O=Arbeit_bot/CN={DOMAIN}"`

After execution you will have `key.key` (your ssl key) and `crt.pem` (your ssl certificate).

**Important:** please make sure to add your real server address instead of `{DOMAIN}` in this command. If you aren't using domain name, you can leave your IP there in the form of `1.1.1.1`. If you don't specify the correct address or domain here, you will not be able to receive any updates from Telegram servers.

### I got it working, what's next?

Wonderful! After you got everything working well, please follow instructions from [Want to contribute?](#want-to-contribute) We all hope to see you with the 🐝 emoji someday!

# Where to seek help?

In case you need a hand to figure something out, please feel free to [open an issue](https://github.com/ArbeitBot/ArbeitBot-landing/issues) or check out Telegram channel [@borodutch_support](https://telegram.me/borodutch_support) ❤️

# License

ArbeitBot is released under the MIT license. See LICENSE for details. ArbeitBot development would not be possible without help of [existing Node.js Telegram bot API](https://github.com/yagop/node-telegram-bot-api/) written by [@yagop](https://github.com/yagop). Thank you!
