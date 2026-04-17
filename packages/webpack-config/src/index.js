const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const { ModuleFederationPlugin } = webpack.container

function createShared(dependencies = {}) {
  return {
    react: { singleton: true, requiredVersion: dependencies.react || false },
    'react-dom': { singleton: true, requiredVersion: dependencies['react-dom'] || false },
    'react-router-dom': { singleton: true, requiredVersion: dependencies['react-router-dom'] || false },
    mobx: { singleton: true, requiredVersion: dependencies.mobx || false },
    'mobx-react-lite': { singleton: true, requiredVersion: dependencies['mobx-react-lite'] || false },
    'react-redux': { singleton: true, requiredVersion: dependencies['react-redux'] || false },
    '@reduxjs/toolkit': { singleton: true, requiredVersion: dependencies['@reduxjs/toolkit'] || false },
    '@grocery-delivery/app-core': { singleton: true, requiredVersion: false },
    '@grocery-delivery/shared': { singleton: true, requiredVersion: false }
  }
}

function createBaseConfig({ appDir, entry, outputDir = 'dist', devPort, html = true }) {
  const rootDir = path.resolve(appDir, '../..')

  return {
    mode: process.env.NODE_ENV || 'production',
    entry: path.resolve(appDir, entry),
    output: {
      path: path.resolve(appDir, outputDir),
      publicPath: 'auto',
      clean: true
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: [
            path.resolve(appDir, 'src'),
            path.resolve(rootDir, 'packages'),
            path.resolve(rootDir, 'shared')
          ],
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.STATE_MANAGER': JSON.stringify(process.env.STATE_MANAGER || 'redux')
      }),
      ...(html
        ? [new HtmlWebpackPlugin({ templateContent: ({ htmlWebpackPlugin }) => `<!DOCTYPE html><html lang=\"ru\"><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/><title>${htmlWebpackPlugin.options.title}</title></head><body><div id=\"root\"></div></body></html>`, title: 'FreshBox' })]
        : [])
    ],
    devServer: devPort
      ? {
          port: devPort,
          historyApiFallback: true,
          hot: true,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      : undefined,
    stats: 'minimal'
  }
}

function createHostConfig({ appDir, entry, appName, dependencies, remotes, devPort }) {
  const base = createBaseConfig({ appDir, entry, devPort, html: true })

  return {
    ...base,
    plugins: [
      ...base.plugins,
      new ModuleFederationPlugin({
        name: appName,
        remotes,
        shared: createShared(dependencies)
      })
    ]
  }
}

function createRemoteConfig({ appDir, entry, appName, dependencies, exposes, devPort }) {
  const base = createBaseConfig({ appDir, entry, devPort, html: true })

  return {
    ...base,
    plugins: [
      ...base.plugins,
      new ModuleFederationPlugin({
        name: appName,
        filename: 'remoteEntry.js',
        exposes,
        shared: createShared(dependencies)
      })
    ]
  }
}

module.exports = {
  createHostConfig,
  createRemoteConfig
}
