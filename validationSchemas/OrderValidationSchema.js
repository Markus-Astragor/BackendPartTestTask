const Joi = require('joi');
const { ItemValidationSchema } = require('./ItemValidationSchema');


const OrderValidationSchema = Joi.object({
  price: Joi.number().positive().required(),
  additionalMessage: Joi.string().optional().allow(''),
  itemsList: Joi.array().items(ItemValidationSchema).min(1).required(),
  orderDate: Joi.date().default(Date.now)
});

module.exports = { OrderValidationSchema };
