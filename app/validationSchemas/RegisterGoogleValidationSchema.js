const Joi = require('joi');

const RegisterGoogleValidationSchema = Joi.object({
  username: Joi.string().min(2).max(30).required(),
  familyname: Joi.string().min(2).max(30).required(),
})

module.exports = { RegisterGoogleValidationSchema };