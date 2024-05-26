const mongoose = require('mongoose');
require('dotenv').config()

const Start = async (MONGO_DB_URL) => {
  try {
    await mongoose.connect(MONGO_DB_URL).then(() => {
      console.log('Database is connected');
    })
  } catch (error) {
    console.log('Some error occured', error);
  }
}

module.exports = {Start}