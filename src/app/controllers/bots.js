const { botCreate, botUpdate } = require('../repositories/models/botModel');
const { isAuthenticated } = require('../middlewares/isAuthenticated');
const BotRepository = require('../repositories/botRepository');
const DiscordBot = require('../services/DiscordBot');
const HttpError = require('../../core/HttpError');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const take = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.offset) || 0;

    const total = await BotRepository.countAllBots();
    const data = await BotRepository.findAllBots({
      pagination: { skip, take },
    });

    return res.json({
      total,
      data,
      skip,
      take,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const botId = req.params?.id;

    const data = await BotRepository.findOne(botId);
    if (!data) throw new HttpError(HttpError.Status.BadRequest, 'O bot não foi encontrado');

    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    const { error, value } = await botCreate.validate(req.body);
    if (error) throw new HttpError(HttpError.Status.BadRequest, error.details[0].message);

    const bot = await BotRepository.findOne(value.botId);
    if (bot) throw new HttpError(HttpError.Status.Conflict, `O bot ${value.botId} já existe`);

    const discordBotData = await DiscordBot.getBotById(value.botId);
    value.username = discordBotData.username;
    value.avatarUrl = discordBotData.avatar_url;
    value.bannerUrl = discordBotData.banner_url;

    const data = await BotRepository.create(value);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const botId = req.params?.id;
    const userId = req.auth?.sub;

    const bot = await BotRepository.findOne(botId);
    if (!bot) throw new HttpError(HttpError.Status.BadRequest, 'O bot não foi encontrado');

    if (bot?.ownerId !== userId)
      throw new HttpError(
        HttpError.Status.Unauthorized,
        `Você não está autorizado a atualizar esse bot`
      );

    const { error, value } = await botUpdate.validate(req.body);
    if (error) throw new HttpError(HttpError.Status.BadRequest, error.details[0].message);

    const data = await BotRepository.update(botId, value);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', isAuthenticated, async (req, res, next) => {
  try {
    const botId = req.params?.id;
    const userId = req.auth?.sub;

    const bot = await BotRepository.findOne(botId);
    if (!bot) throw new HttpError(HttpError.Status.BadRequest, 'O bot não foi encontrado');

    if (bot?.ownerId !== userId)
      throw new HttpError(
        HttpError.Status.Unauthorized,
        `Você não está autorizado a deletar esse bot`
      );

    const data = await BotRepository.delete(botId);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
