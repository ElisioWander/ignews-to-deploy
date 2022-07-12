module.exports = {
  testPathIgnorePatterns: ["/node_modules/", "/.next/"], //pastas que o jest deve ignorar
  setupFilesAfterEnv: [
    "<rootDir>/src/tests/setupTests.ts"
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest" //configurando o jest para conseguir compreender essas extenções
  },
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy'
  },
  testEnvironment: 'jsdom',
  preset: "ts-jest",
}