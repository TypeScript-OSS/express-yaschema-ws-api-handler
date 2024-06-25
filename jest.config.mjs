export default {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts'],
  coverageReporters: ['text', 'html'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: true
    }
  },
  moduleNameMapper: {
    'ipaddr\\.js': '$0',
    '(.+)\\.js': '$1'
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
