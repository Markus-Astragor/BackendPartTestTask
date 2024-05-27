const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  collectCoverage: false,
  verbose: true,
};