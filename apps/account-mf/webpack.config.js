const { createRemoteConfig } = require('@grocery-delivery/webpack-config')
const pkg = require('./package.json')

module.exports = createRemoteConfig({
  appDir: __dirname,
  entry: 'src/index.tsx',
  appName: 'accountMf',
  dependencies: pkg.dependencies,
  devPort: Number(process.env.ACCOUNT_MF_DEV_PORT || 8082),
  exposes: {
    './OrdersPage': './src/OrdersPage',
    './ProfilePage': './src/ProfilePage'
  }
})
