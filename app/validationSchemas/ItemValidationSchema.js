const Joi = require('joi');

const ItemValidationSchema = Joi.object({
  itemId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required()
});

module.exports = { ItemValidationSchema };