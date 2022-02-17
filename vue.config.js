const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: '/dsp_blueprint_editor/',
  transpileDependencies: false,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.txt$/,
          type: 'asset/source',
        }, {
          test: /assets\/icons/,
          type: 'asset/resource'
        }
      ],
    }
  },
})
