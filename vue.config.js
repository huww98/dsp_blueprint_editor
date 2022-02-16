const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
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
