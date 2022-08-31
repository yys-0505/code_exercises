# key points

### init project

pnpm init: 生成 package.json
配置.npmrc: shamefully-hoist = true
pnpm i vue typescript
pnpm tsc --init 生成 tsconfig.json, 需自定义配置信息: 执行 tsc 时会到 node_modules 下的.bin 目录下找
新建 pnpm-workspace.yaml 并配置
新建 packages 及子文目录, components、utils、theme-chalk
依次到上面 3 个目录进行初始化: pnpm init, 并改包名
将 3 个包变成全局模块: vue3-component 目录下: pnpm i @test/components -w, package.json 出现"@test/components": "workspace:^1.0.0", 可把版本号删掉变成任意版本"workspace:\*"
pnpm create vite play --template vue-ts: 根目录创建 play 项目
新建 typings-> vue-shim.d.ts
最外层 package.json 配置启动 play 项目的命令: "dev": "pnpm -C play dev"
bem 规范： utils/create.ts
pnpm i unplugin-vue-define-options -D -w, 然后 play vite.config.ts 添加使用 DefineOptions 插件
play 工程：pnpm i -D @vicons/ionicons5 参考文档 xicons.org
编写 theme-chalk; pnpm i sass -D -w;

根目录：npx eslint --init, 生成.eslintrc.js[命令不好用直接手动创建]
创建 .eslintignore
编辑器需要安装 eslint 插件

代码风格插件: .prettierrc.js
床架 .prettierignore
编辑器需要安装 prettier 插件

编辑器配置：目的保存文件自动格式化
setting -> 搜 formatter -> Default Formatter -> prettier xx
搜 format on save -> 勾选 Format On Save

编辑器配置参数：
.editorconfig
需要插件支持： EditorConfig for VS Code

doc 目录
pnpm i
pnpm i vitepress -D
新建 index.md
package.json 写 dev 命令
工程 package.json 添加 doc:dev
新建.vitepress 文件夹, 添加 config.js 进行配置
