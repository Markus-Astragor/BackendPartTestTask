const Joi = require('joi');

const RegisterValidationSchema = Joi.object({
  username: Joi.string().min(2).max(30).required(),
  password: Joi.string().min(8).max(16).required(),
})

module.exports = { RegisterValidationSchema };