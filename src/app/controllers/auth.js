const { isAuthenticated } = require('../middlewares/isAuthenticated');
const DiscordAuth = require('../services/DiscordAuth');
const { frontend, state } = require('../../config');
const HttpError = require('../../core/HttpError');
const router = require('express').Router();
const Token = require('../../core/Token');

router.get('/login', (req, res) => {
  const url = DiscordAuth.getOAuthUrl();
  return res.redirect(url);
});

router.get('/callback', async (req, res) => {
  try {
    const { error, code } = req.query;
    if (error) throw new HttpError(HttpError.Status.BadRequest, error);

    const DiscordAuthToken = await DiscordAuth.requestToken(code);
    if (!DiscordAuthToken) throw new HttpError(HttpError.Status.BadRequest, `Token não definido`);

    const userData = await DiscordAuth.fetchAuthUser(DiscordAuthToken.access_token);
    if (!userData)
      throw new HttpError(HttpError.Status.BadRequest, `Dados do usuário não disponível`);

    const jwtToken = await Token.encode({
      ...DiscordAuthToken,
      sub: userData.id,
    });
    if (!jwtToken) throw new HttpError(HttpError.Status.BadRequest, `Erro ao gerar token`);

    return res
      .cookie(frontend.cookie, jwtToken, {
        httpOnly: true,
        secure: state === 'production',
        sameSite: 'strict',
        maxAge: 518400000, // 6 days
      })
      .redirect(`${frontend.url}/auth/callback`);
  } catch (err) {
    return res.redirect(`${frontend.url}/auth/callback?error=${err?.message}`);
  }
});

router.post('/logout', (req, res) => {
  try {
    return res
      .clearCookie(frontend.cookie, {
        httpOnly: true,
        secure: state === 'production',
      })
      .sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.post('/verify', isAuthenticated, (req, res) => {
  return res.sendStatus(200);
});

module.exports = router;
