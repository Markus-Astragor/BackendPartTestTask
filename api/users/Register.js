const { Users } = require('../../models/Users.Schema');
require('dotenv').config();
const Router = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { RegisterValidationSchema } = require('../../validationSchemas/RegisterValidationSchema');
const saltRounds = 10;
const secretKey = process.env.SECRET_KEY;
const expiredTime = process.env.EXPIRED_TIME;


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The user's username
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       403:
 *         description: Account with this username already exists
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Account with this username already exists
 * 
 *       400:
 *         description: validation error(username should be more than 2 symbols and less than 30, password should be more or equal 8 and less or equal 16 symbols)
 *         content:
 *           text/plain:
 *             schema:
 *               type: object
 *               example: "\"password\" length must be at least 8 characters long"
 * 
 * 
 * 
 *       500:
 *         description: An error occurred while registering the user
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: An error occurred while registering the user
 */


router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUsername = username.trim();

    const { error } = RegisterValidationSchema.validate({ username: newUsername, password });
    const check = await Users.findOne({ username });

    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    if (check) {
      return res.status(403).send('Account with this username already exists');
    }

    else {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const doc = new Users({ username: username, password: hashedPassword });
      await doc.save();

      const token = jwt.sign({ userId: doc._id }, secretKey, { expiresIn: `${expiredTime}h` })
      res.status(200).json({ token })
    }

  } catch (error) {
    res.status(500).send(`An error occurred while registering the user ${error}`);
  }
})



module.exports = { router };