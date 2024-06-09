const { isAuthenticated } = require('../middlewares/isAuthenticated');
const UserRepository = require('../repositories/userRepository');
const DiscordAuth = require('../services/DiscordAuth');
const router = require('express').Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const token = req?.auth?.access_token;
    const data = await DiscordAuth.fetchAuthUser(token);
    return res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/bots', isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.auth?.sub;
    const data = await UserRepository.findAllBots(userId);
    const total = await UserRepository.countAllBots(userId);
    return res.json({
      total,
      data,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
