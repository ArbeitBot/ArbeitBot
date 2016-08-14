module.exports = {
  telegram_api_key: process.env.TELEGRAM_API_KEY,
  database: process.env.MONGO_DB_URL,
  staging_url: process.env.ARBEIT_BOT_STAGING_URL,
  production_url: process.env.ARBEIT_BOT_PRODUCTION_URL,
  should_use_webhooks: true,
  // todo: hide from general public before open sourcing
  webhook_token: 'D83Lw8AXaW793xup1Sxj9j6wR6kE7sJj',
  webhook_callback_url: 'https://138.68.6.70:8443/'
};