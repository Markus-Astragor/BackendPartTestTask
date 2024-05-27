const { Schema } = require('mongoose');

const itemSchema = new Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true }
});

module.exports = itemSchema; 