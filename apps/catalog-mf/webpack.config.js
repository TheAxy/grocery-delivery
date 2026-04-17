const { createRemoteConfig } = require('@grocery-delivery/webpack-config')
const pkg = require('./package.json')

module.exports = createRemoteConfig({
  appDir: __dirname,
  entry: 'src/index.tsx',
  appName: 'catalogMf',
  dependencies: pkg.dependencies,
  devPort: Number(process.env.CATALOG_MF_DEV_PORT || 8081),
  exposes: {
    './CatalogPage': './src/CatalogPage',
    './AdminProductsPage': './src/AdminProductsPage'
  }
})
