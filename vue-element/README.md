# key points
### init project

#### yarn global add lerna
#### 根目录：lerna init
#### 根目录：lerna create button, package name填写@x-ui/button
#### lib 改名 src
#### button.js 改后缀 button.vue
#### 新建button/index.ts
#### 安装ts, 解决vue文件类型: yarn add typescript -W
#### 生成ts配置文件： npx tsc --init
#### 根目录：新建typings/vue-shim.d.ts
#### 根目录安装vue： yarn add vue@next -W
#### 根目录：lerna create icon, package name填写@x-ui/icon, lib->src, icon.js->icon.vue, __test__删掉, 新建icon/index.ts
#### 创建整合组件：lerna create x-ui，删除__test__, lib, 新建index.ts
#### 根目录yarn install: 解决import Button from '@x-ui/button'能找到问题，node_modules的@x-ui里有写好的包
#### 运行组件：新建website
#### 建webpack服务：yarn add webpack webpack-cli webpack-dev-server vue-loader@next @vue/compiler-sfc -D -W
#### yarn add babel-loader @babel/core @babel/preset-env @babel/preset-typescript babel-plugin-module-resolver url-loader file-loader html-webpack-plugin css-loader sass-loader style-loader sass -D -W
#### 配置babel: 新建babel.config.js
#### 新建webpack.config.js
#### bem 规范： 新建theme-chalk; package.json, 根目录yarn install, 使变成node_modules一个包, 这样可以在项目中全局引入: import 'theme-chalk/index.scss';