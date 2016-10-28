[![ArbeitBot](/docs/header.png?raw=true)](https://arbeitbot.com/)

[![Product Hunt](/docs/ph.png?raw=true)](https://www.producthunt.com/tech/arbeitbot)
[![Habrahabr](/docs/habr.png?raw=true)](https://habrahabr.ru/post/310434/)
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
This is the source code of [@arbeit_bot](https://telegram.me/arbeit_bot) – first Telegram-based open source freelance market.

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
* `TELEGRAM_API_KEY` – api key for your telegram bot (obtained from [@BotFather](https://telegram.me/botfather))
* `MONGO_DB_URL` – url of your mongo database (i.e. `mongodb://localhost:27017/`)
* `USE_WEBHOOKS` – flag identifying if bot should use [webhooks](https://core.telegram.org/bots/api/#setwebhook) or should fetch updates every 1000 seconds (webhooks make bot faster but require custom server with SSL setup)
* *(Optional)* `WEBHOOK_CALLBACK_URL` – url that should be used by Telegram servers for webhooks, should be `https`
* *(Optional)* `SSL_CERTIFICATE_PATH` – path to ssl certificate for webhooks
* *(Optional)* `SSH_RSA_PATH` – path to ssh private certificate for webhooks (should not be password encrypted)
* *(Optional)* `ARBEIT_BOT_STAGING_URL` – url of your staging server for flightplan (if you use flightplan)
* *(Optional)* `ARBEIT_BOT_PRODUCTION_URL` – url of your production server for flightplan (if you use flightplan)

### How to get ssl certificate and key
Fortunately, Telegram webhooks support self-signed SSL certificates. You can use this command on server to create self-signed ssl key that can be accepted by Telegram servers:

`openssl req -newkey rsa:2048 -sha256 -nodes -keyout key.key -x509 -days 365 -out crt.pem -subj "/C=US/ST=New York/L=Brooklyn/O=Arbeit_bot/CN={DOMAIN}"`

After execution you will have `key.key` (your ssl key) and `crt.pem` (your ssl certificate).

**Important:** please make sure to add your real server address instead of `{DOMAIN}` in this command. If you aren't using domain name, you can leave your IP there in the form of `1.1.1.1`. If you don't specify the correct address or domain here, you will not be able to receive any updates from Telegram servers.

### I got it working, what's next?
Wonderful! After you got everything working well, please follow instructions from [Want to contribute?](#want-to-contribute) We all hope to see you with the 🐝 emoji someday!

# Where to seek help?
In case you need a hand to figure something out, please feel free to [open an issue](https://github.com/ArbeitBot/ArbeitBot/issues) or chat with us on our [Telegram channel](https://telegram.me/borodutcher) (careful, channel is conquered by Russians) ❤️. Or bug the person responsible for the majority of bot's bugs — [@borodutch](https://telegram.me/borodutch).

# License
ArbeitBot is released under the MIT license. See LICENSE for details. ArbeitBot development would not be possible without help of [existing Node.js Telegram bot API](https://github.com/yagop/node-telegram-bot-api/) written by [@yagop](https://github.com/yagop). Thank you!
