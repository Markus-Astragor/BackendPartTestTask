const { redisClient } = require('../../redisClient');
const Router = require('express');
const router = Router();
const { verifyToken } = require('./utils');
const { Orders } = require('../../models/Orders.Schema');

/**
 * @swagger
 * /deleteOrder/{id}:
 *   delete:
 *     summary: Deletes an order
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
 *         description: The ID of the order you want to delete
 * 
 *     
 *     responses:
 *       200:
 *         description: Order with {id} was deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Order with {id} was deleted successfully
 *   
 *       404:
 *         description: order with such id was not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example: order with such id was not found
 *       500:
 *         description: Something went wrong while deleting
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Something went wrong while deleting
 */

router.delete('/deleteOrder/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Orders.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).send(`Order with id ${id} wasn't found`);
    }

    await redisClient.del("orders:list");

    return res.status(200).send(`Order with id ${id} was deleted successfully`);

  } catch (error) {
    res.status(500).send(`Something went wrong while deleting: ${error.message}`);
  }
});

module.exports = { router };
