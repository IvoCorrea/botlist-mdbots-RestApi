const { isAuthenticated } = require('../../src/app/middlewares/isAuthenticated');
const UserRepository = require('../../src/app/repositories/userRepository');
const DiscordAuth = require('../../src/app/services/DiscordAuth');
const HttpError = require('../../src/core/HttpError');
const app = require('../../src/main');
const request = require('supertest');

jest.mock('../../src/app/repositories/UserRepository');
jest.mock('../../src/app/middlewares/isAuthenticated');
jest.mock('../../src/app/services/DiscordAuth');

describe('Testando rotas de usuário autenticado', () => {
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

  describe('Rota GET /me/profile', () => {
    isAuthenticated.mockImplementation((req, res, next) => {
      req.auth = { access_token: 'accessToken', sub: 'userId' };
      next();
    });

    it('Deve retornar os dados do usuário autenticado', async () => {
      const userData = { id: 'userId', username: 'user' };
      DiscordAuth.fetchAuthUser.mockResolvedValue(userData);

      const res = await request(app).get('/me/profile');

      expect(DiscordAuth.fetchAuthUser).toHaveBeenCalledWith('accessToken');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(userData);
    });

    it('Deve lidar com erros e passar para o middleware de erro', async () => {
      DiscordAuth.fetchAuthUser.mockRejectedValue(
        new HttpError(HttpError.Status.BadRequest, 'Erro ao buscar dados do usuário')
      );

      const res = await request(app).get('/me/profile');
      expect(res.statusCode).toBe(400);
      expect(res.body.statusText).toBe('Erro ao buscar dados do usuário');
    });
  });

  describe('Rota GET /me/bots', () => {
    isAuthenticated.mockImplementation((req, res, next) => {
      req.auth = { access_token: 'accessToken', sub: 'userId' };
      next();
    });

    it('Deve retornar os bots do usuário autenticado e o total de bots', async () => {
      const bots = [
        { id: '1', username: 'Bot 1' },
        { id: '2', username: 'Bot 2' },
      ];
      const totalBots = 2;
      UserRepository.findAllBots.mockResolvedValue(bots);
      UserRepository.countAllBots.mockResolvedValue(totalBots);

      const res = await request(app).get('/me/bots');

      expect(UserRepository.findAllBots).toHaveBeenCalledWith('userId');
      expect(UserRepository.countAllBots).toHaveBeenCalledWith('userId');
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        total: totalBots,
        data: bots,
      });
    });

    it('Deve lidar com erros e passar para o middleware de erro', async () => {
      UserRepository.findAllBots.mockRejectedValue(
        new HttpError(HttpError.Status.BadRequest, 'Erro ao buscar bots')
      );

      const res = await request(app).get('/me/bots');
      expect(res.statusCode).toBe(400);
      expect(res.body.statusText).toBe('Erro ao buscar bots');
    });
  });
});
