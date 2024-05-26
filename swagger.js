const swaggerJsDocs = require('swagger-jsdoc');
require('dotenv').config()
const swaggerUi = require('swagger-ui-express');
const { version } = require('./package.json');
const swaggerJSDoc = require('swagger-jsdoc');
const log = require('./logger');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "REST API for Orders Documentation",
      version
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./api/**/*.js", "./models/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app, port) {
  //Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  })

  log.info(`Docs are available at http://localhost:${port}/docs`);

}

module.exports = swaggerDocs