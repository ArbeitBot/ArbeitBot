[![ArbeitBot](/docs/header.png?raw=true)](https://arbeitbot.com/)

[![Product Hunt](/docs/ph.png?raw=true)](https://www.producthunt.com/tech/arbeitbot)
[![Habrahabr](/docs/habr.png?raw=true)](https://habrahabr.ru/post/310434/)
[![vc.ru](/docs/vc.png?raw=true)](https://vc.ru/p/arbeitbot)

First free open-source Telegram freelance market. Built by people for people.

# Attention!
This readme page is under development. Also, the code in this repository is yet to be cleaned and documented. We will notify all users of [@arbeit_bot](https://telegram.me/arbeit_bot) on Telegram as soon as the code will be clean enough for general public.

# Arbeit Bot
This is the source code of [@arbeit_bot](https://telegram.me/arbeit_bot) – first Telegram-based open source freelance market.

# Want to contribute?
ArbeitBot is a completely non-profit and community-driven project which really depends on it's contributors. If you feel adventurous or just want to help out the project — please do so either by fixing issues from [the list](https://github.com/ArbeitBot/ArbeitBot/issues) and creating a pull request or by submitting issues to our [bug tracker](https://github.com/ArbeitBot/ArbeitBot/issues).

The best option to add a feature to the codebase is to first [open an issue](https://github.com/ArbeitBot/ArbeitBot/issues) with label `Enhancement` (to notify us that you are working on something) where you may also communicate with initial contributors, then fork this project and create a pull request.

If you want to fix a bug from [the list of the issues](https://github.com/ArbeitBot/ArbeitBot/issues), please comment under the issue that you are working on it, then fork the repository and create a pull request.

Please use [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) as the main tool to follow our project-wide codestyle.

We highly appreciate any help and that's why the most active contributors will get a 🐝 emoji beside their freelancer profile to stand out among other freelancers of the same category, like that:

![@isamsky profile](/docs/special.png?raw=true)

By the way, did you know how [@isamsky](https://telegram.me/isamsky) got his special symbol? He is the creator of our awesome logo!

### Necessary environment variables
* `TELEGRAM_API_KEY` – api key for your telegram bot
* `MONGO_DB_URL` – url of your mongo database
* `ARBEIT_BOT_STAGING_URL` – url of your staging server for flightplan
* `ARBEIT_BOT_PRODUCTION_URL` – url of your production server for flightplan
* `ARBEIT_BOT_PRODUCTION_URL` – url of your production server for flightplan
* *(Optional)* `USE_WEBHOOKS` – flag identifying if bot should use webhooks or should fetch updates every 1000 seconds, `false` if isn't set
* *(Optional)* `WEBHOOK_CALLBACK_URL` – url that should be used by Telegram servers for webhooks, should be `https`
* *(Optional)* `SSL_CERTIFICATE_PATH` – path to ssl certificate
* *(Optional)* `SSH_RSA_PATH` – path to ssh private certificate (should not be password encrypted)

### How to get ssl certificate and key
You can use this command on server to create self-signed ssl key that can be accepted by Telegram servers:

`openssl req -newkey rsa:2048 -sha256 -nodes -keyout key.key -x509 -days 365 -out crt.pem -subj "/C=US/ST=New York/L=Brooklyn/O=Arbeit_bot/CN={DOMAIN}"`

After execution you will have `key.key` (your ssl key) and `crt.pem` (your ssl certificate).

**Important:** please make sure to add your real server address instead of `{DOMAIN}` in this command. If you aren't using domain name, you can leave your IP there in the form of `1.1.1.1`. If you don't specify the correct address or domain here, you will not be able to receive any updates from Telegram servers.


#Where to seek help?
In case you need a hand to figure something out, please feel free to [open an issue](https://github.com/ArbeitBot/ArbeitBot/issues) or chat with us on our [Telegram channel](https://telegram.me/borodutcher) (careful, channel is conquered by Russians) ❤️. Or bug the person responsible for the majority of bot's bugs — [@borodutch](https://telegram.me/borodutch).

#License
ArbeitBot is released under the MIT license. See LICENSE for details.
