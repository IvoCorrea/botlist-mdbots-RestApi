const { isAuthenticated } = require('../../src/app/middlewares/isAuthenticated');
const BotRepository = require('../../src/app/repositories/botRepository');
const DiscordBot = require('../../src/app/services/DiscordBot');
const HttpError = require('../../src/core/HttpError');
const app = require('../../src/main');
const request = require('supertest');

jest.mock('../../src/app/middlewares/isAuthenticated');
jest.mock('../../src/app/repositories/botRepository');
jest.mock('../../src/app/services/DiscordBot');

describe('Testando rotas de bots', () => {
  let server;

  beforeAll(async () => {
    server = await app.listen(9098);
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rota GET /bots', () => {
    it('Deve retornar os bots e o total de bots', async () => {
      const bots = [
        { id: '1', name: 'Bot 1' },
        { id: '2', name: 'Bot 2' },
      ];
      const totalBots = 2;
      BotRepository.findAllBots.mockResolvedValue(bots);
      BotRepository.countAllBots.mockResolvedValue(totalBots);

      const res = await request(app).get('/bots');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        total: totalBots,
        data: bots,
        skip: 0,
        take: 10,
      });
    });

    it('Deve lidar com erros e passar para o middleware de erro', async () => {
      BotRepository.findAllBots.mockRejectedValue(
        new HttpError(HttpError.Status.BadRequest, 'Erro ao buscar bots')
      );

      const res = await request(app).get('/bots');
      expect(res.status).toBe(400);
      expect(res.body.statusText).toBe('Erro ao buscar bots');
    });
  });

  describe('Rota GET /bots/:id', () => {
    it('Deve retornar um bot', async () => {
      const botId = '1';
      const bot = { id: '1', name: 'Bot 1' };
      BotRepository.findOne.mockResolvedValue(bot);

      const res = await request(app).get(`/bots/${botId}`);

      expect(BotRepository.findOne).toHaveBeenCalledWith(botId);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(bot);
    });

    it('Deve lidar com erros e passar para o middleware de erro', async () => {
      const botId = '1';

      BotRepository.findOne.mockRejectedValue(
        new HttpError(HttpError.Status.BadRequest, 'Erro ao buscar bot')
      );

      const res = await request(app).get(`/bots/${botId}`);
      expect(res.status).toBe(400);
      expect(res.body.statusText).toBe('Erro ao buscar bot');
    });
  });

  describe('Rota POST /bots', () => {
    isAuthenticated.mockImplementation((req, res, next) => {
      req.auth = { sub: 'userId' };
      next();
    });

    it('Deve criar um novo bot', async () => {
      const data = {
        botId: '12345',
        ownerId: '12345',
        shortDescription: 'SHORTDESCRIPTION',
        isSlashCommands: true,
      };

      const discordData = {
        username: 'bot',
        avatar_url: 'avatar',
        banner_url: 'banner',
      };

      BotRepository.findOne.mockResolvedValue(null);
      DiscordBot.getBotById.mockResolvedValue(discordData);
      BotRepository.create.mockResolvedValue({
        ...data,
        username: discordData.username,
        avatarUrl: discordData.avatar_url,
        bannerUrl: discordData.banner_url,
      });

      const res = await request(app).post('/bots').send(data);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(
        expect.objectContaining({
          ...data,
          username: discordData.username,
          avatarUrl: discordData.avatar_url,
          bannerUrl: discordData.banner_url,
        })
      );
    });

    it('Deve lidar com erros e passar para o middleware de erro', async () => {
      BotRepository.create.mockRejectedValue(
        new HttpError(HttpError.Status.BadRequest, 'Erro ao buscar bot')
      );

      const data = {
        botId: '12345',
        ownerId: '12345',
        shortDescription: 'SHORTDESCRIPTION',
        isSlashCommands: true,
      };
      const res = await request(app).post('/bots').send(data);

      expect(res.status).toBe(400);
      expect(res.body.statusText).toBe('Erro ao buscar bot');
    });

    it('Deve retornar 409 se o bot já existir', async () => {
      const data = {
        botId: '12345',
        ownerId: '12345',
        shortDescription: 'SHORTDESCRIPTION',
        isSlashCommands: true,
      };
      BotRepository.findOne.mockResolvedValue(data);

      const res = await request(app).post('/bots').send(data);
      expect(res.status).toBe(409);
      expect(res.body.statusText).toBe('O bot 12345 já existe');
    });

    it('Deve retornar 401 se o usuário não estiver autenticado', async () => {
      isAuthenticated.mockImplementationOnce((req, res, next) => {
        next(new HttpError(HttpError.Status.Unauthorized));
      });

      const data = {
        botId: '12345',
        ownerId: '12345',
        shortDescription: 'SHORTDESCRIPTION',
        isVerifiedBot: false,
      };
      const res = await request(app).post('/bots').send(data);

      expect(res.status).toBe(401);
      expect(res.body.statusText).toBe('Unauthorized');
    });
  });

  describe('Rota PUT /bots/:id', () => {
    isAuthenticated.mockImplementation((req, res, next) => {
      req.auth = { sub: 'userId' };
      next();
    });

    it('Deve atualizar um bot', async () => {
      const botId = '1';
      const existingBot = { id: botId, ownerId: 'userId' };
      const updateData = { shortDescription: 'shortDescription', isVerifiedBot: true };

      BotRepository.findOne.mockResolvedValue(existingBot);
      BotRepository.update.mockResolvedValue({ ...existingBot, ...updateData });
      const res = await request(app).put(`/bots/${botId}`).send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          ...existingBot,
          ...updateData,
        })
      );
    });

    it('Deve lidar com erros e passar para o middleware de erro', async () => {
      const botId = '1';
      const updateData = {
        shortDescription: 'SHORTdescription',
        isVerifiedBot: true,
      };

      BotRepository.update.mockRejectedValue(
        new HttpError(HttpError.Status.BadRequest, 'Erro ao atualizar bot')
      );

      const res = await request(app).put(`/bots/${botId}`).send(updateData);
      expect(res.status).toBe(400);
      expect(res.body.statusText).toBe('Erro ao atualizar bot');
    });

    it('Deve retornar 400 se o bot não for encontrado', async () => {
      const botId = '1';
      const updateData = {
        shortDescription: 'SHORTdescription',
      };

      BotRepository.findOne.mockResolvedValue(null);
      const res = await request(app).put(`/bots/${botId}`).send(updateData);

      expect(res.status).toBe(400);
      expect(res.body.statusText).toBe('O bot não foi encontrado');
    });

    it('Deve retornar 401 se o usuário não estiver autorizado a atualizar o bot', async () => {
      const botId = '1';
      const existingBot = { id: botId, ownerId: '2' };
      const updateData = {
        shortDescription: 'SHORTdescription',
        isVerifiedBot: true,
      };

      BotRepository.findOne.mockResolvedValue(existingBot);
      const res = await request(app).put(`/bots/${botId}`).send(updateData);

      expect(res.status).toBe(401);
      expect(res.body.statusText).toBe('Você não está autorizado a atualizar esse bot');
    });

    it('Deve retornar 401 se o usuário não estiver autenticado', async () => {
      isAuthenticated.mockImplementationOnce((req, res, next) => {
        next(new HttpError(HttpError.Status.Unauthorized));
      });

      const botId = '1';
      const updateData = {
        shortDescription: 'SHORTdescription',
        isVerifiedBot: true,
      };
      const res = await request(app).put(`/bots/${botId}`).send(updateData);

      expect(res.status).toBe(401);
      expect(res.body.statusText).toBe('Unauthorized');
    });
  });

  describe('Rota DELETE /bots/:id', () => {
    isAuthenticated.mockImplementation((req, res, next) => {
      req.auth = { sub: 'userId' };
      next();
    });

    it('Deve deletar um bot', async () => {
      const botId = '1';
      const data = { id: botId, ownerId: 'userId' };

      BotRepository.findOne.mockResolvedValue(data);
      BotRepository.delete.mockResolvedValue(data);
      const res = await request(app).delete(`/bots/${botId}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
    });

    it('Deve lidar com erros e passar para o middleware de erro', async () => {
      const botId = '1';

      BotRepository.delete.mockRejectedValue(
        new HttpError(HttpError.Status.BadRequest, 'Erro ao deletar bot')
      );

      const res = await request(app).delete(`/bots/${botId}`);
      expect(res.status).toBe(400);
      expect(res.body.statusText).toBe('Erro ao deletar bot');
    });

    it('Deve retornar 400 se o bot não for encontrado', async () => {
      const botId = '1';

      BotRepository.findOne.mockResolvedValue(null);
      const res = await request(app).delete(`/bots/${botId}`);

      expect(res.status).toBe(400);
      expect(res.body.statusText).toBe('O bot não foi encontrado');
    });

    it('Deve retornar 401 se o usuário não estiver autorizado a atualizar o bot', async () => {
      const botId = '1';
      const data = { id: botId, ownerId: '2' };

      BotRepository.findOne.mockResolvedValue(data);
      const res = await request(app).delete(`/bots/${botId}`);

      expect(res.status).toBe(401);
      expect(res.body.statusText).toBe('Você não está autorizado a deletar esse bot');
    });

    it('Deve retornar 401 se o usuário não estiver autenticado', async () => {
      isAuthenticated.mockImplementationOnce((req, res, next) => {
        next(new HttpError(HttpError.Status.Unauthorized));
      });

      const botId = '1';
      const res = await request(app).delete(`/bots/${botId}`);

      expect(res.status).toBe(401);
      expect(res.body.statusText).toBe('Unauthorized');
    });
  });
});
