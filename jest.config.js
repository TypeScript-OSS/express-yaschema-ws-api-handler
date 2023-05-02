module.exports = {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: [".ts"],
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  },
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 40,
      lines: 70,
      statements: 70
    }
  }
};
