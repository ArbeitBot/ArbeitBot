# Arbeit Bot
This is the source code of [@arbeit_bot](https://telegram.me/arbeit_bot) – first Telegram-based open source freelance market.

# Necessary environment variables
* `TELEGRAM_API_KEY` – api key for your telegram bot
* `MONGO_DB_URL` – url of your mongo database
* `ARBEIT_BOT_STAGING_URL` – url of your staging server for flightplan
* `ARBEIT_BOT_PRODUCTION_URL` – url of your production server for flightplan
* *(Optional)* `USE_WEBHOOKS` – flag identifying if bot should use webhooks or should fetch updates every 1000 seconds, `false` if isn't set
* *(Optional)* `WEBHOOK_CALLBACK_URL` – url that should be used by Telegram servers for webhooks, should be `https`
* *(Optional)* `SSL_CERTIFICATE_PATH` – path to ssl certificate
* *(Optional)* `SSL_KEY_PATH` – path to ssl key

# How to get ssl certificate and key
You can use this command on server to create self-signed ssl key that can be accepted by Telegram servers:

`openssl req -newkey rsa:2048 -sha256 -nodes -keyout key.key -x509 -days 365 -out crt.pem -subj "/C=US/ST=New York/L=Brooklyn/O=Arbeit_bot/CN={DOMAIN}"`

After execution you will have `key.key` (your ssl key) and `crt.pem` (your ssl certificate).

**Important:** please make sure to add your real server address instead of `{DOMAIN}` in this command. If you aren't using domain name, you can leave your IP there in the form of `1.1.1.1`. If you don't specify the correct address or domain here, you will not be able to receive any updates from Telegram servers.

# Where to seek help?
Just bug our group on Telegram: [@borodutcher](https://telegram.me/borodutcher).