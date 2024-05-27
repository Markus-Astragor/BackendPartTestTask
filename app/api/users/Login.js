const { Users } = require('../../models/Users.Schema');
const Router = require('express');
const router = Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const expiredTime = process.env.EXPIRED_TIME;

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
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
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 username:
 *                   type: string
 *                   description: The username
 *       404:
 *         description: User not found or incorrect password
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: The user with such credentials wasn't found
 *       500:
 *         description: Internal Server Error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal Server Error
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username: username });

    if (!user) {
      return res.status(404).send('The user with such credentials wasn`t found');
    }

    const matchedPassword = await bcrypt.compare(password, user.password);

    if (!matchedPassword) {
      return res.status(404).send('Please check username or password');
    }

    const token = jwt.sign({ userId: user._id, username }, secretKey, { expiresIn: `${expiredTime}h` });
    return res.status(200).json({ token, username });
  } catch (error) {
    return res.status(500).send(`Internal Server Error: ${error}`);
  }
});

module.exports = { router };
