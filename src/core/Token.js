const { jwtDecrypt, EncryptJWT } = require('jose');
const HttpError = require('./HttpError');
const { hkdf } = require('@panva/hkdf');
const { jwt } = require('../config');

module.exports = class Token {
  /**
   * Criptografa Chave Secreta
   */
  static async encryptionSecret() {
    try {
      const JWT_SECRET = jwt.secret;
      if (!JWT_SECRET)
        throw new HttpError(HttpError.Status.Unauthorized, 'Chave secreta não definida');

      const secret = await hkdf('sha256', JWT_SECRET, '', 'Chave de criptografia gerada', 32);
      return secret;
    } catch {
      return false;
    }
  }
  /**
   * Codificar token JWT
   * @param {any} data
   */
  static async encode(data) {
    try {
      if (!data) throw new HttpError(HttpError.Status.Unauthorized, 'Data não disponível');

      const jwtSecret = await Token.encryptionSecret();
      if (!jwtSecret) throw new HttpError(HttpError.Status.Unauthorized, 'Erro ao codificar token');

      const jwtEncrypt = new EncryptJWT(data)
        .setProtectedHeader({ alg: 'A256KW', enc: 'A256GCM' })
        .setIssuedAt()
        .setExpirationTime('6d')
        .setIssuer('MDCommunity')
        .setAudience('api.mdbots.com.br')
        .encrypt(jwtSecret);
      return jwtEncrypt;
    } catch {
      return false;
    }
  }
  /**
   * Decodificar token JWT
   * @param {String} token
   */
  static async decode(token) {
    try {
      if (!token) throw new HttpError(HttpError.Status.Unauthorized, 'Token não definido');

      const jwtSecret = await Token.encryptionSecret();
      if (!jwtSecret)
        throw new HttpError(HttpError.Status.Unauthorized, 'Erro ao decodificar token');

      const { payload } = await jwtDecrypt(token, jwtSecret, {
        audience: 'api.mdbots.com.br',
        clockTolerance: 15,
      });

      return payload;
    } catch {
      return false;
    }
  }
};
