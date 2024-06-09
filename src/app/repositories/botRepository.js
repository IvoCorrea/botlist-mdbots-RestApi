const DiscordBot = require('../services/DiscordBot');
const HttpError = require('../../core/HttpError');
const prisma = require('../services/Prisma');

module.exports = class BotRepository {
  /**
   * Deleta um bot específico
   * @param {string} botId
   * @returns {Promise<import('@prisma/client').Bot | Error>}
   */
  static async delete(botId) {
    try {
      if (!botId) throw new HttpError(HttpError.Status.BadRequest, 'Id do Bot não definido');

      const data = await prisma.bot.delete({
        where: {
          botId,
        },
      });

      return data;
    } catch (err) {
      throw err;
    }
  }
  /**
   * Busca um bot específico
   * @param {string} botId
   * @returns {Promise<import('@prisma/client').Bot | Error>}
   */
  static async findOne(botId) {
    try {
      if (!botId) throw new HttpError(HttpError.Status.BadRequest, 'Id do Bot não definido');

      const data = await prisma.bot.findUnique({
        where: {
          botId,
        },
      });

      return data;
    } catch (err) {
      throw err;
    }
  }
  /**
   * Cria um novo bot no banco de dados
   * @param {object} body
   * @param {string} body.botId
   * @param {string} body.ownerId
   * @param {string} body.username
   * @param {string} body.shortDescription
   * @param {string} [body.description]
   * @param {boolean} [body.isVerifiedBot]
   * @param {boolean} [body.isSlashCommands]
   * @param {string} body.authorId
   * @param {string} body.authorUsername
   * @param {boolean} [body.isPending]
   * @param {boolean} [body.isPromoted]
   * @param {string} [body.totalVotes]
   * @param {string} [body.lastVoteAt]
   * @returns {Promise<import('@prisma/client').Bot | Error>}
   */
  static async create(body) {
    try {
      if (!body) throw new HttpError(HttpError.Status.BadRequest, 'Body não definido');

      const data = await prisma.bot.create({
        data: { ...body },
      });

      return data;
    } catch (err) {
      throw err;
    }
  }
  /**
   * Atualiza um bot específico
   * @param {string} botId
   * @param {object} body
   * @param {string} body.botId
   * @param {string} body.ownerId
   * @param {string} body.username
   * @param {string} body.shortDescription
   * @param {string} [body.description]
   * @param {boolean} [body.isVerifiedBot]
   * @param {boolean} [body.isSlashCommands]
   * @param {string} body.authorId
   * @param {string} body.authorUsername
   * @param {boolean} [body.isPending]
   * @param {boolean} [body.isPromoted]
   * @param {string} [body.totalVotes]
   * @param {string} [body.lastVoteAt]
   * @returns {Promise<import('@prisma/client').Bot | Error>}
   */
  static async update(botId, body) {
    try {
      if (!botId) throw new HttpError(HttpError.Status.BadRequest, 'Id do Bot não definido');
      if (!body) throw new HttpError(HttpError.Status.BadRequest, 'Body não definido');

      const data = await prisma.bot.update({
        where: {
          botId,
        },
        data: {
          ...body,
        },
      });

      return data;
    } catch (err) {
      throw err;
    }
  }
  /**
   * Retorna todos os bots no banco de dados
   * @param {object} options
   * @param {object} options.filters
   * @param {boolean} [options.filters.isPromoted] Filtrar apenas bots promovidos
   * @param {boolean} [options.filters.isPending] Filtrar apenas bots pendentes
   * @param {object} options.pagination
   * @param {number} [options.pagination.skip] Número de bots a serem pulados
   * @param {number} [options.pagination.take] Número máximo de bots a retornar
   * @returns {Promise<import('@prisma/client').Bot[] | Error>}
   */
  static async findAllBots({ filters = {}, pagination = { skip, take } } = {}) {
    try {
      const where = {};

      if (typeof filters.isPromoted === 'boolean') {
        where.isPromoted = filters.isPromoted;
      }

      if (typeof filters.isPending === 'boolean') {
        where.isPending = filters.isPending;
      }

      const data = await prisma.bot.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
      });

      return data;
    } catch (err) {
      throw err;
    }
  }
  /**
   * Conta o total de bots no banco de dados
   * @param {object} options
   * @param {object} options.filters
   * @param {boolean} [options.filters.isPromoted] Filtrar apenas bots promovidos
   * @param {boolean} [options.filters.isPending] Filtrar apenas bots pendentes
   * @returns {Promise<Number | Error>}
   */
  static async countAllBots({ filters = {} } = {}) {
    try {
      const where = {};

      if (typeof filters.isPromoted === 'boolean') {
        where.isPromoted = filters.isPromoted;
      }

      if (typeof filters.isPending === 'boolean') {
        where.isPending = filters.isPending;
      }

      const data = await prisma.bot.count({ where });
      return data;
    } catch (err) {
      throw err;
    }
  }
};
