module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 50,
      lines: 70,
      statements: 70
    }
  }
};
