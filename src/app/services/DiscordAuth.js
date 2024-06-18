const { create, isAxiosError } = require('axios').default;
const HttpError = require('../../core/HttpError');
const { discord } = require('../../config');

module.exports = class DiscordAuth {
  static instance = create({
    baseURL: 'https://discord.com/api',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  /**
   * Obtém a URL de login OAuth2 do Discord
   * @returns {String}
   */
  static getOAuthUrl() {
    const discordQueryParams = new URLSearchParams({
      scope: 'guilds.join identify email',
      redirect_uri: discord.redirectUrl,
      client_id: discord.clientId,
      response_type: 'code',
    });

    const url = `https://discord.com/oauth2/authorize?${discordQueryParams.toString()}`;
    return url;
  }
  /**
   * Solicita um token do Discord
   * @param {String} code
   * @returns {Promise<{ token_type: String; access_token: String; expires_in: Number; refresh_token: String; scope: String; }>}
   */
  static async requestToken(code) {
    try {
      if (!code) throw new HttpError(HttpError.Status.BadRequest, 'Code não definido');

      const discordQueryParams = new URLSearchParams({
        client_id: discord.clientId,
        client_secret: discord.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: discord.redirectUrl,
        code,
      });

      const res = await DiscordAuth.instance.post('/oauth2/token', discordQueryParams.toString());
      const data = res.data;
      if (res.status !== 200 || !data) throw new Error();

      return data;
    } catch (err) {
      if (isAxiosError(err))
        throw new HttpError(HttpError.Status.BadRequest, 'Erro ao solicitar token');
      else
        throw new HttpError(HttpError.Status.BadRequest, err?.message || 'Erro ao solicitar token');
    }
  }
  /**
   * Atualiza o token do Discord
   * @param {String} refreshToken
   * @returns {Promise<{ token_type: String; access_token: String; expires_in: Number; refresh_token: String; scope: String; }>}
   */
  static async refreshToken(refreshToken) {
    try {
      if (!refreshToken)
        throw new HttpError(HttpError.Status.BadRequest, 'RefreshToken não definido');

      const discordQueryParams = new URLSearchParams({
        client_id: discord.clientId,
        client_secret: discord.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      const res = await DiscordAuth.instance.post('/oauth2/token', discordQueryParams.toString());
      const data = res.data;

      if (res.status !== 200 || !data) throw new Error();

      return data;
    } catch (err) {
      if (isAxiosError(err))
        throw new HttpError(HttpError.Status.BadRequest, 'Erro ao da refresh no token');
      else
        throw new HttpError(
          HttpError.Status.BadRequest,
          err?.message || 'Erro ao da refresh no token'
        );
    }
  }
  /**
   * Busca informações do usuário autenticado no Discord
   * @param {String} token
   * @returns {Promise<{ id: String; username: String; avatar_url: String; email: String; }>}
   */
  static async fetchAuthUser(token) {
    try {
      if (!token) throw new HttpError(HttpError.Status.BadRequest, 'Token não definido');

      const res = await DiscordAuth.instance.get('/users/@me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      const format = data.avatar.startsWith('a_') ? 'gif' : 'png';
      const avatarUrl = data.avatar
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${format}?size=4096`
        : 'https://cdn.discordapp.com/embed/avatars/0.png?size=4096';

      return {
        id: data.id,
        username: data.username,
        avatar_url: avatarUrl,
        email: data.email,
      };
    } catch (err) {
      if (isAxiosError(err))
        throw new HttpError(
          HttpError.Status.BadRequest,
          'Erro ao buscar dados do usuário autenticado'
        );
      else
        throw new HttpError(
          HttpError.Status.BadRequest,
          err?.message || 'Erro ao buscar dados do usuário autenticado'
        );
    }
  }
};
