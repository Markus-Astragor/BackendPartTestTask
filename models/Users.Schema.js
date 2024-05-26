const { Schema, model } = require('mongoose');

const users = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
})

const Users = new model('Users', users);

module.exports = { Users };
