const DiscordAuth = require('../../src/app/services/DiscordAuth');
const { frontend } = require('../../src/config');
const Token = require('../../src/core/Token');
const app = require('../../src/main');
const request = require('supertest');

jest.mock('../../src/app/services/DiscordAuth');
jest.mock('../../src/core/Token');

describe('Testando rotas de autenticação', () => {
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

  describe('Rota GET /auth/login', () => {
    it('Deve redirecionar o usuário a URL de login no Discord', async () => {
      DiscordAuth.getOAuthUrl.mockReturnValue('https://discord.com/oauth2/authorize?test=true');
      const res = await request(app).get('/auth/login');

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('https://discord.com/oauth2/authorize?test=true');
    });
  });

  describe('Rota GET /auth/callback', () => {
    it('Deve definir o cookie e redirecionar', async () => {
      DiscordAuth.requestToken.mockResolvedValue({ access_token: 'accessToken' });
      DiscordAuth.fetchAuthUser.mockResolvedValue({ id: 'userId' });
      Token.encode.mockResolvedValue('jwtToken');

      const res = await request(app).get('/auth/callback?code=authCode');
      expect(DiscordAuth.requestToken).toHaveBeenCalledWith('authCode');
      expect(DiscordAuth.fetchAuthUser).toHaveBeenCalledWith('accessToken');
      expect(Token.encode).toHaveBeenCalledWith(expect.objectContaining({ sub: 'userId' }));

      expect(res.status).toBe(302);
      expect(res.header['set-cookie'][0]).toMatch(new RegExp(`${frontend.cookie}=jwtToken;`));
      expect(res.header.location).toBe(`${frontend.url}/auth/callback`);
    });

    it('Deve tratar erros e redirecionar', async () => {
      DiscordAuth.requestToken.mockResolvedValue(null);
      const res = await request(app).get('/auth/callback?code=authCode');

      expect(res.status).toBe(302);
      expect(res.header.location).toMatch(new RegExp(`${frontend.url}/auth/callback\\?error=.*`));
    });
  });

  describe('Rota POST /auth/logout', () => {
    it('Deve limpar o cookie de autenticação', async () => {
      const res = await request(app).post('/auth/logout');

      expect(res.status).toBe(200);
      expect(res.header['set-cookie'][0]).toMatch(new RegExp(`${frontend.cookie}=;`));
    });
  });

  describe('Rota POST /auth/verify', () => {
    it('Deve retornar 200 se o cookie de autenticação for válido', async () => {
      Token.decode.mockResolvedValue({ sub: 'userId' });

      const res = await request(app)
        .post('/auth/verify')
        .set('Cookie', `${frontend.cookie}=userId`);
      expect(res.status).toBe(200);
    });

    it('Deve retornar 401 se o cookie de autenticação for inválido', async () => {
      const res = await request(app).post('/auth/verify');
      expect(res.status).toBe(401);
      expect(res.body.statusText).toBe('Cookie não encontrado');
    });
  });
});
