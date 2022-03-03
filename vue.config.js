const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const { execSync } = require('child_process')

module.exports = defineConfig({
  publicPath: '/dsp_blueprint_editor/',
  transpileDependencies: false,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\/assets\//,
          type: 'asset',
        }, {
          test: /\/assets\/icons\/(item_recipe|signal|tech)\//,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      alias: {
        three$: 'three/src/Three.js',
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(execSync('git describe --always --dirty', { encoding: 'utf8' }).trim()),
      }),
    ],
  },
  pwa: {
    name: '戴森球计划蓝图预览',
    themeColor: '#000000',
    msTileColor: null,
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestOptions: {
      short_name: '蓝图预览',
      icons: [
        {
          'src': './img/icons/android-chrome-192x192.png',
          'sizes': '192x192',
          'type': 'image/png'
        },
        {
          'src': './img/icons/android-chrome-512x512.png',
          'sizes': '512x512',
          'type': 'image/png'
        },
      ],
    },
    iconPaths: {
      faviconSVG: 'img/icons/favicon.svg',
      favicon32: 'img/icons/favicon-32x32.png',
      favicon16: 'img/icons/favicon-16x16.png',
      appleTouchIcon: null,
      maskIcon: null,
      msTileImage: null,
    },
  },
})
