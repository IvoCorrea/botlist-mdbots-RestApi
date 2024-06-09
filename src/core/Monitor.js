const HttpError = require('../core/HttpError');
const { discord } = require('../config');
const Log = require('./Log');

module.exports = class Monitor {
  /**
   * Enviar Webhook - Discord
   * @param {String} url
   * @param {object} data
   * @returns {Promise<boolean>}
   */
  static async useWebhook(url, data) {
    try {
      if (!url)
        throw new HttpError(
          HttpError.Status.InternalServerError,
          'Erro na url do webhook, não está definida'
        );
      if (!data)
        throw new HttpError(
          HttpError.Status.InternalServerError,
          'Erro no webhook, data não definida'
        );

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return res.ok;
    } catch (err) {
      Log.error(err);
      return false;
    }
  }
  /**
   * Enviar Erro via Webhook - Discord
   * @param {String} message
   * @returns {Promise<boolean>}
   */
  static async error(message) {
    try {
      if (!message)
        throw new HttpError(
          HttpError.Status.InternalServerError,
          'Erro no webhook, mensagem não definida'
        );
      const data = {
        content: `Data: ${new Date()}\n\`\`\`javascript\n${message}\`\`\``,
      };

      const webhookUrl = discord.webhookUrlError;
      if (!webhookUrl)
        throw new HttpError(
          HttpError.Status.InternalServerError,
          'Erro na url do webhook, não está definida'
        );

      const sendWebhook = await Monitor.useWebhook(webhookUrl, data);
      return sendWebhook;
    } catch (err) {
      Log.error(err);
      return false;
    }
  }
};
