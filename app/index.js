const { app } = require('./app');
require('dotenv').config();
const mongoDbConnect = require('./setup/mongoose');
const swaggerDocs = require('./swagger');

const PORT = process.env.PORT || 3000;
const MongoDbURL = process.env.MONGO_DB_URL;

async function startServer() {
  await mongoDbConnect.Start(MongoDbURL);
  app.listen(PORT, () => {
    console.log(`Server was started on ${PORT}`);
    swaggerDocs(app, PORT);
  });
}

startServer();