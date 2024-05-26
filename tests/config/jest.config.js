module.exports = {
  rootDir: '../../',
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js?$',
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverage: true,
  coverageReporters: ['text', 'lcov'],
  clearMocks: true,
};