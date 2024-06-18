const { create, isAxiosError } = require('axios').default;
const HttpError = require('../../core/HttpError');
const { discord } = require('../../config');

module.exports = class DiscordBot {
  static instance = create({
    baseURL: 'https://discord.com/api/v10',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${discord.botToken}`,
    },
  });
  /**
   * Busca informações de um bot do Discord
   * @param {string} id
   * @returns {Promise<{ id: string; username: string; avatar_url: string; banner_url: string; }>}
   */
  static async getBotById(id) {
    try {
      if (!id) throw new HttpError(HttpError.Status.BadRequest, 'Id do bot não definido');

      const res = await DiscordBot.instance.get(`/users/${id}`);
      const data = res.data;
      if (res.status !== 200 || !data) throw new Error();
      if (!data.bot) throw new HttpError(HttpError.Status.BadRequest, 'Esse id não é de um bot');

      const avatarFormat = data.avatar.startsWith('a_') ? 'gif' : 'png';
      const avatarUrl = data.avatar
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${avatarFormat}?size=4096`
        : 'https://cdn.discordapp.com/embed/avatars/0.png?size=4096';

      const bannerFormat = data.banner.startsWith('a_') ? 'gif' : 'png';
      const bannerUrl = data.banner
        ? `https://cdn.discordapp.com/banners/${data.id}/${data.banner}.${bannerFormat}?size=4096`
        : 'https://cdn.discordapp.com/embed/avatars/0.png?size=4096';

      return {
        id: data.id,
        username: `${data.username}#${data.discriminator}`,
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
      };
    } catch (err) {
      if (isAxiosError(err))
        throw new HttpError(HttpError.Status.BadRequest, 'Erro ao buscar dados do bot');
      else
        throw new HttpError(
          HttpError.Status.BadRequest,
          err?.message || 'Erro ao buscar dados do bot'
        );
    }
  }
};
