const { redisClient } = require('../../redisClient');
const Router = require('express');
const router = Router();
const { Orders } = require('../../models/Orders.Schema');
const { verifyToken } = require('./utils');

/**
 * @swagger
 * /getOrders:
 *   get:
 *     summary: Return all orders available in the database
 *     tags: [Orders]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token for authorization
 *     responses:
 *       200:
 *         description: All orders which are available
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: The order ID
 *                   customerId:
 *                     type: string
 *                     description: The customer ID who created the order
 *                   price:
 *                     type: number
 *                     description: The total price of the order
 *                   additionalMessage:
 *                     type: string
 *                     description: Additional message for the order
 *                   itemsList:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         itemId:
 *                           type: string
 *                           description: The ID of the item
 *                         name:
 *                           type: string
 *                           description: The name of the item
 *                         description:
 *                           type: string
 *                           description: The description of the item
 *                         quantity:
 *                           type: number
 *                           description: The quantity of the item
 *                         _id:
 *                           type: string
 *                           description: The ID of the item entry
 *                   orderDate:
 *                     type: string
 *                     format: date-time
 *                     description: The date when the order was created
 *                   __v:
 *                     type: number
 *                     description: Version key
 *               example:
 *                 - _id: "665042716750ac3e9f2119f0"
 *                   customerId: "664f24318a42be766fcbf2cd"
 *                   price: 1200
 *                   additionalMessage: ""
 *                   itemsList:
 *                     - itemId: "2"
 *                       name: "jeans"
 *                       description: "the best jeans i have ever seen they are blue colour"
 *                       quantity: 1
 *                       _id: "665042716750ac3e9f2119f1"
 *                   orderDate: "2024-05-24T07:32:01.674Z"
 *                   __v: 0
 *                 - _id: "665042716750ac3e9f2119f2"
 *                   customerId: "664f24318a42be766fcbf2ce"
 *                   price: 1500
 *                   additionalMessage: "Urgent delivery"
 *                   itemsList:
 *                     - itemId: "3"
 *                       name: "shirt"
 *                       description: "a nice blue shirt"
 *                       quantity: 2
 *                       _id: "665042716750ac3e9f2119f3"
 *                   orderDate: "2024-05-24T08:32:01.674Z"
 *                   __v: 0
 *       500:
 *         description: Something went wrong while fetching the orders
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Something went wrong while fetching the orders
 */

router.get('/getOrders', verifyToken, async (req, res) => {
  try {
    const cacheResult = await redisClient.get("orders:list");
    if (cacheResult) {
      console.log("get from cache");
      return res.status(200).send(cacheResult);
    } else {
      const orders = await Orders.find();

      if (orders.length === 0) {
        return res.status(200).send('There are not any orders yet');
      }

      redisClient.setEx("orders:list", 3600, JSON.stringify(orders));

      return res.status(200).json(orders);
    }

  } catch (error) {
    return res.status(500).send(`Something went wrong while fetching orders ${error}`);
  }
})

module.exports = { router };