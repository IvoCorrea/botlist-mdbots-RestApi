const HttpError = require('../../core/HttpError');
const prisma = require('../services/Prisma');

module.exports = class UserRepository {
  /**
   * Retorna todos os bots de um usuário
   * @param {String} userId
   * @returns {Promise<import('@prisma/client').Bot[] | Error>}
   */
  static async findAllBots(userId) {
    try {
      if (!userId) throw new HttpError(HttpError.Status.BadRequest, 'Id do usuário não definido');

      const bots = await prisma.bot.findMany({
        where: {
          ownerId: userId,
        },
      });

      return bots;
    } catch (err) {
      throw err;
    }
  }
  /**
   * Conta todos os bots de um usuário
   * @param {String} userId
   * @returns {Promise<Number | Error>}
   */
  static async countAllBots(userId) {
    try {
      if (!userId) throw new HttpError(HttpError.Status.BadRequest, 'Id do usuário não definido');

      const total = await prisma.bot.count({
        where: {
          ownerId: userId,
        },
      });

      return total;
    } catch (err) {
      throw err;
    }
  }
};
