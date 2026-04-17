const { createHostConfig } = require('@grocery-delivery/webpack-config')
const pkg = require('./package.json')

const mode = process.env.NODE_ENV || 'production'

module.exports = createHostConfig({
  appDir: __dirname,
  entry: 'src/index.tsx',
  appName: 'hostApp',
  dependencies: pkg.dependencies,
  devPort: Number(process.env.HOST_DEV_PORT || 8080),
  remotes: {
    catalogMf: process.env.CATALOG_REMOTE_URL || (mode === 'development' ? 'catalogMf@http://localhost:8081/remoteEntry.js' : 'catalogMf@/catalog-mf/remoteEntry.js'),
    accountMf: process.env.ACCOUNT_REMOTE_URL || (mode === 'development' ? 'accountMf@http://localhost:8082/remoteEntry.js' : 'accountMf@/account-mf/remoteEntry.js')
  }
})
