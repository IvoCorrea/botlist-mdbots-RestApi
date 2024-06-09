module.exports = class Log {
  /**
   * Registro de informação no console com horário
   * @param {String} message
   * @param {String[] | null} [tags]
   * @returns {void}
   */
  static info(message, tags = []) {
    console.info(
      `[${new Date().toLocaleTimeString()}] ${tags.map((tag) => `[${tag}] `).join(' ')}${message}`
    );
  }
  /**
   * Registro de erro no console com horário
   * @param {String} message
   * @param {String[] | null} [tags]
   * @returns {void}
   */
  static error(message, tags = []) {
    return console.error(
      `[${new Date().toLocaleTimeString()}] ${tags.map((tag) => `[${tag}] `).join(' ')}${message}`
    );
  }
};
