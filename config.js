module.exports = {
  telegram_api_key: process.env.TELEGRAM_API_KEY,
  database: process.env.MONGO_DB_URL,
  staging_url: process.env.ARBEIT_BOT_STAGING_URL,
  production_url: process.env.ARBEIT_BOT_PRODUCTION_URL,
  should_use_webhooks: process.env.USE_WEBHOOKS || false,
  webhook_token: process.env.WEBHOOK_TOKEN,
  webhook_callback_url: process.env.WEBHOOK_CALLBACK_URL
};