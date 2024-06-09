const { config } = require('dotenv');
config();

module.exports = {
  discord: {
    clientId: process.env.DIS_ID,
    clientSecret: process.env.DIS_SECRET,
    redirectUrl: process.env.DIS_REDIRECT,
    webhookUrlError: process.env.DIS_WEBHOOK_ERROR,
    botToken: process.env.DIS_BOT_TOKEN,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
    cookie: process.env.FRONTEND_TOKEN_COOKIE,
  },
  state: process.env.NODE_ENV,
};
