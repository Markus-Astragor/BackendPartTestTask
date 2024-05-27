const Router = require('express');
require('dotenv').config();
const router = Router()
const jwt = require('jsonwebtoken');
const { RegisterGoogleValidationSchema } = require('../../validationSchemas/RegisterGoogleValidationSchema');
const secretKey = process.env.SECRET_KEY;
const expiredTime = process.env.EXPIRED_TIME;
const log = require('../../logger');


router.post('/createToken', async (req, res) => {
  const { username, familyname, emailVerified, userId } = req.body;
  const changedUsername = username.trim();
  const changedFamilyname = familyname.trim();
  const { error } = RegisterGoogleValidationSchema.validate({ username: changedUsername, familyname: changedFamilyname });

  if (!emailVerified) {
    log.error(`CreateTokenFromGoogle: User ${username} tries to receive access in not proper way`)
    return res.status(400).send('Auth declined');
  }

  if (error) {
    log.error('CreateTokenFromGoogle: User tries to receive access in not proper way')
    return res.status(400).send(error.details[0].message);
  }

  const token = jwt.sign({ username: changedUsername, familyname: changedFamilyname, userId }, secretKey, { expiresIn: `${expiredTime}h` });
  log.info('CreateTokenFromGoogle: token was created successfully');
  return res.status(200).send({ token });
})

module.exports = { router }