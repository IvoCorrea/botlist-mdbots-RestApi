const { existsSync, readdirSync } = require('fs');
const HttpError = require('../core/HttpError');
const responseTime = require('response-time');
const Monitor = require('./Monitor');
const { resolve } = require('path');
const Log = require('./Log');

module.exports = class Handler {
  /**
   * @param {Express} app
   * @param {object} folders
   * @param {String} folders.controllers
   */
  constructor(app, folders = { controllers }) {
    this.app = app;
    this.folders = folders;
  }
  /**
   * Carrega as Rotas/Controllers
   * @returns {Promise<void>}
   */
  async controllers() {
    try {
      const path = this.folders?.controllers;
      if (!path) throw new HttpError(HttpError.Status.InternalServerError);

      const pathResolved = resolve(path);
      if (!existsSync(pathResolved)) throw new HttpError(HttpError.Status.InternalServerError);

      const controllers = readdirSync(pathResolved)
        .filter((file) => file.endsWith('.js'))
        .map((file) => file.split('.')[0]);

      for (const controller of controllers) {
        const file = require(`${pathResolved}/${controller}`);
        this.app.use(`/${controller}`, file);
        Log.info(`${controller} Loaded!`, ['ROUTER']);
      }
    } catch (err) {
      Monitor.error(err);
    }
  }
  /**
   * Carrega Todos Os Componentes
   * @returns {Promise<void>}
   */
  async init() {
    try {
      this.app.use(
        responseTime((req, res, time) => {
          Log.info(`${req.originalUrl} [${req.ip}] - ${time.toFixed(2)}ms`, [
            `${req.method.toUpperCase()} => ${res.statusCode}`,
          ]);
        })
      );

      await this.controllers();

      this.app.use((err, req, res, next) => {
        const statusCode = err?.status || 500;
        const statusText = err?.message || HttpError.Status[statusCode] || 'InternalServerError';
        if (statusCode === 500) Monitor.error(err);
        return res.status(statusCode).json({
          statusCode,
          statusText,
        });
      });

      this.app.use((req, res) => {
        const statusCode = 404;
        const statusText = HttpError.Status[statusCode] || 'NotFound';
        return res.status(statusCode).json({
          statusCode,
          statusText,
        });
      });
    } catch (err) {
      Monitor.error(err);
    }
  }
};
