# Keys points

### pnpm 支持monorepo, 配置pnpm-workspace.yaml即可； lerna也可实现monorepo, 但是老
### .npmrc 配置 shamefully-hoist = true， 使某个package依赖的包被使用。不推荐，因为这个package不依赖了，外部使用会报错
### pnpm install -w 才会把node_modules放到项目根目录, -w 代表--workspace-root
### tsconfig.json
{
  "compilerOptions": {
    "outDir": "dist", // 输出目录
    "sourceMap": true,
    "target": "es2016",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": false,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "lib": ["esnext", "dom"],
    "baseUrl": ".", // 配置，结合下面一行，可以实现不同包相互引用
    "paths": {
      "@vue/*": ["packages/*/src"] // import .. from @vue/share 会到packages/shared/src下去找
    }
  }
}
### 具体package下的package.json
{
  "name": "@vue/reactivity", // 包名字
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "buildOptions": {
    "name": "VueReactivity", // 全局变量, 即引入script之后，暴露在window下的变量
    "format": [
      "global",
      "cjs",
      "esm-bundler"
    ]
  }
}
### minimist 解析命令行参数包
### esbuild： script/dev.js const { build } = require('esbuild') 支持ts 开发esbuild 生产rollup

