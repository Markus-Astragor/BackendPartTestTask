const { Schema, model } = require('mongoose');
const itemSchema = require('./Item.schema');

const orders = new Schema({
  customerId: { type: String, required: true },
  price: { type: Number, required: true },
  additionalMessage: { type: String },
  itemsList: { type: [itemSchema], required: true },
  orderDate: { type: Date, default: Date.now }
});

const Orders = new model('orders', orders);

module.exports = { Orders }; 
