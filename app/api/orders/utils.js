const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
const log = require('../../logger');

function verifyToken(req, res, next) {
  const token = req.headers['token'];

  if (!token) {
    log.error(`VerifyToken: User is not authorized`);
    return res.status(403).send('User is not authorized');
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {

      if (err.name === 'TokenExpiredError') {
        log.error(`VerifyToken: Token has expired`);
        return res.status(401).send('Token has expired');
      }

      log.error(`VerifyToken: Failed to authenticate token or token is artificial`);
      return res.status(500).send('Failed to authenticate token');
    }

    req.user = decoded;
    next();
  });
}

module.exports = { verifyToken };
