const { redisClient } = require('../../redisClient')
const Router = require('express');
const router = Router();
const { Orders } = require('../../models/Orders.Schema');
const { OrderValidationSchema } = require('../../validationSchemas/OrderValidationSchema');
const { verifyToken } = require('./utils');
const log = require('../../logger');

/**
 * @swagger
 * /createOrder:
 *   post:
 *     summary: Creates an order
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - price
 *               - itemsList
 *             properties:
 *               price:
 *                 type: number
 *                 description: The total price of the order
 *               additionalMessage:
 *                 type: string
 *                 description: Additional message for the order
 *               itemsList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemId:
 *                       type: string
 *                       description: The ID of the item
 *                     name:
 *                       type: string
 *                       description: The name of the item
 *                     description:
 *                       type: string
 *                       description: The description of the item
 *                     quantity:
 *                       type: number
 *                       description: The quantity of the item
 *               customerId:
 *                 type: string
 *                 description: The ID of the user who created the order
 *     responses:
 *       200:
 *         description: Order was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Order was created successfully
 *       400:
 *         description: Bad request, validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: { error: "Validation error message" }
 *       500:
 *         description: An error occurred while creating the order
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: An error occurred while creating the order
 */

router.post('/createOrder', verifyToken, async (req, res) => {
  try {
    const { price, additionalMessage, itemsList } = req.body;
    const { error } = OrderValidationSchema.validate(req.body);

    if (error) {
      log.error(`CreateOrder: This is an error connected to validation: ${error.details[0].message}`)
      return res.status(404).send(error.details[0].message);
    }


    const order = new Orders({ price, additionalMessage, itemsList, customerId: req.user.userId });
    await order.save();

    log.info('CreateOrder: Orders were deleted from cache');
    await redisClient.del('orders:list')

    log.info(`CreateOrder: Order was created successfully`);
    return res.status(200).send('Order was created successfully');
  } catch (error) {
    log.error(`CreateOrder: Error while creating order`);
    return res.status(500).send(`An error occurred while creating the order ${error}`);
  }
});

module.exports = { router };
