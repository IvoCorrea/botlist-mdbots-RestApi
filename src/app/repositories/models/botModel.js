const Joi = require('joi');

const botCreate = Joi.object({
  botId: Joi.string().required(),
  ownerId: Joi.string().required(),
  shortDescription: Joi.string().min(10).max(140).required(),
  description: Joi.string(),
  isSlashCommands: Joi.boolean().default(false),
});

const botUpdate = Joi.object({
  ownerId: Joi.string(),
  username: Joi.string(),
  shortDescription: Joi.string().min(10).max(140),
  description: Joi.string(),
  isVerifiedBot: Joi.boolean(),
  isSlashCommands: Joi.boolean(),
  authorId: Joi.string(),
  authorUsername: Joi.string(),
  isPending: Joi.boolean(),
  isPromoted: Joi.boolean(),
  totalVotes: Joi.number(),
  lastVoteAt: Joi.date(),
});

module.exports = { botCreate, botUpdate };
