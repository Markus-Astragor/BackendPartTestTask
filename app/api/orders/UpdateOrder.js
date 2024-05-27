const { redisClient } = require('../../redisClient');
const Router = require('express');
const router = Router();
const { OrderValidationSchema } = require('../../validationSchemas/OrderValidationSchema');
const { verifyToken } = require('./utils');
const { Orders } = require('../../models/Orders.Schema');
const log = require('../../logger');

/**
 * @swagger
 * /updateOrder/{id}:
 *   put:
 *     summary: Update an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authorization
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to update
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
 *               orderDate:
 *                 type: string
 *                 format: date-time
 *                 description: The date when the order was placed
 *     responses:
 *       200:
 *         description: Order was updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Order with id {id} was updated successfully
 *       404:
 *         description: Order not found or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *               example: { error: "Order not found" }
 *       500:
 *         description: Something went wrong while updating the order
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Something went wrong while updating the order
 */

router.put('/updateOrder/:id', verifyToken, async (req, res) => {
  try {
    const { price, additionalMessage, itemsList, orderDate } = req.body;
    const { error } = OrderValidationSchema.validate(req.body);

    if (error) {
      log.error(`UpdateOrder: Error connected to validation: ${error.details[0].message}`);
      return res.status(404).send(error.details[0].message);
    }

    const updatedOrder = await Orders.findByIdAndUpdate(
      req.params.id,
      { price, additionalMessage, itemsList, orderDate },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      log.error(`UpdateOrder: Order not found`);
      return res.status(404).json('Order not found');
    }

    log.info('UpdateOrder: Orders were removed from redis cache');
    await redisClient.del('orders:list')

    log.info(`UpdateOrder: Order with id ${req.params.id} was updated successfully`);
    return res.status(200).send(`Order with id ${req.params.id} was updated successfully`);

  } catch (error) {
    log.error(`UpdateOrder: Problem with updating an order`);
    return res.status(500).send(`Something went wrong while updating order ${error}`);
  }
})

module.exports = { router }