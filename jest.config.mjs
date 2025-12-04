const defaultConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  coveragePathIgnorePatterns: ['src/__tests__/utils/', '/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: false
      }
    ]
  }
}

/** @type {import("jest").Config} **/
export default {
  ...defaultConfig,
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  projects: [
    {
      ...defaultConfig,
      displayName: 'UNIT',
      testMatch: ['<rootDir>/src/**/__tests__/*.test.ts'],
      testPathIgnorePatterns: ['.integration.']
    },
    {
      ...defaultConfig,
      displayName: 'INTEGRATION',
      runner: 'jest-serial-runner',
      testMatch: ['<rootDir>/src/**/__tests__/*.integration.test.ts']
    }
  ]
}
