
module.exports ={
  chainWebpack: (config) => {
    config.module
        .rule('vue')
        .use('vue-loader')
        .tap((options) => {
          return {
            ...options,
            reactivityTransform: true
          }
        })
  },
  pages: {
    index: {
      entry: "src/renderer/main.js",
    },
  },
  pluginOptions:{
    electronBuilder:{
      nodeIntegration: true,
      mainProcessFile: "src/main/index.js",
      mainProcessWatch: ['src/main/index.js'],
      builderOptions:{
        appId:'net.xianYun.EasySrv',
        productName:'EasySrv',
        mac:{
          target:[
            {
              target: 'dmg',
              arch:['x64'],
            },
          ],
          extraFiles: {
            from: "./extra/darwin/",
            to: "./",
          },
          icon: 'build/icons/icon.icns',
        },
        win:{
          target: [
            {
              target: "zip",
              arch: ["x64"]
            },
          ],
          extraFiles: {
            from: "./extra/win32/",
            to: "./",
          },
          icon: 'build/icons/icon.ico',
        },
        artifactName:'${productName}-${version}-${arch}.${ext}',

      }
    }
  }
}
