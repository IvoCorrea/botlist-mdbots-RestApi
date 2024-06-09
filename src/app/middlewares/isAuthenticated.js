const HttpError = require('../../core/HttpError');
const { frontend } = require('../../config');
const Token = require('../../core/Token');
const { parse } = require('cookie');

/**
 * Middleware para verificar se o usuário está autenticado
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 * @returns {Promise<void>}
 */
async function isAuthenticated(req, res, next) {
  try {
    const cookiesHeader = req.headers.cookie;
    if (!cookiesHeader) throw new HttpError(HttpError.Status.Unauthorized, `Cookie não encontrado`);

    const cookies = parse(cookiesHeader);
    const token = cookies[frontend.cookie];
    if (!token) throw new HttpError(HttpError.Status.Unauthorized, `Token não encontrado`);

    const decoded = await Token.decode(token);
    if (!decoded || decoded?.err) throw new HttpError(HttpError.Status.Unauthorized);

    req.auth = decoded;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { isAuthenticated };
