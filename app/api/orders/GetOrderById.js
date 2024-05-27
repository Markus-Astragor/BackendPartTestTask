const { redisClient } = require('../../redisClient');
// const async = require('async');
const Router = require('express');
const router = Router();
const { verifyToken } = require('./utils');
const { Orders } = require('../../models/Orders.Schema');
const log = require('../../logger');

/**
 * @swagger
 * /getOrders/{id}:
 *   get:
 *     summary: Return an order with provided id
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
 *         description: The ID of the order you want to get
 *     responses:
 *       200:
 *         description: Order with provided id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The order ID
 *                 customerId:
 *                   type: string
 *                   description: The customer ID who created the order
 *                 price:
 *                   type: number
 *                   description: The total price of the order
 *                 additionalMessage:
 *                   type: string
 *                   description: Additional message for the order
 *                 itemsList:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       itemId:
 *                         type: string
 *                         description: The ID of the item
 *                       name:
 *                         type: string
 *                         description: The name of the item
 *                       description:
 *                         type: string
 *                         description: The description of the item
 *                       quantity:
 *                         type: number
 *                         description: The quantity of the item
 *                       _id:
 *                         type: string
 *                         description: The ID of the item entry
 *                 orderDate:
 *                   type: string
 *                   format: date-time
 *                   description: The date when the order was created
 *                 __v:
 *                   type: number
 *                   description: Version key
 *               example: {
 *                 "_id": "665042716750ac3e9f2119f0",
 *                 "customerId": "664f24318a42be766fcbf2cd",
 *                 "price": 1200,
 *                 "additionalMessage": "",
 *                 "itemsList": [
 *                   {
 *                     "itemId": "2",
 *                     "name": "jeans",
 *                     "description": "the best jeans i have ever seen they are blue colour",
 *                     "quantity": 1,
 *                     "_id": "665042716750ac3e9f2119f1"
 *                   }
 *                 ],
 *                 "orderDate": "2024-05-24T07:32:01.674Z",
 *                 "__v": 0
 *               }
 *       404:
 *         description: Order with such id was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   description: Error message
 *               example: {
 *                 "error": "Order with such id was not found"
 *               }
 *       500:
 *         description: Something went wrong while fetching the order
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Something went wrong while fetching the order
 */


router.get('/getOrders/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const redisKey = `order:${id}`;
  try {
    const cacheResult = await redisClient.get(redisKey);
    if (cacheResult) {
      log.info(`GetOrderById: Redis returns order by id ${id}`);
      return res.status(200).send(cacheResult);
    } else {
      const order = await Orders.findById(id);

      if (!order) {
        log.error(`GetOrderById: Order with id ${id} was not found in databse`);
        return res.status(404).send(`The order with id ${id} doesn't exist`);
      }

      log.info('GetOrderById: redis has set an order');
      await redisClient.setEx(redisKey, 3600, JSON.stringify(order));
      log.info(`GetOrderById: Order was found and was sent to client`);
      return res.status(200).send(order);
    }
  } catch (error) {
    log.error(`GetOrderById: Error while getting order`);
    res.status(500).send(`Something went wrong while fetching order ${error}`)
  }
})

module.exports = { router }