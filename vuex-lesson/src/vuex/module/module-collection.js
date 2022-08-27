import Module from "./module";
import { forEachValue } from "../utils"

export default class ModuleCollection {
  constructor(rootModule) {
    this.root = null
    this.register(rootModule, [])
  }

  register(rawModule, path) {
    const newModule = new Module(rawModule)
    if (path.length === 0) { // 根模块
      this.root = newModule
    } else {
      const parent = path.slice(0, -1).reduce((module, current) => {
        return module.getChild(current)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }
    if (rawModule.modules) {
      forEachValue(rawModule.modules, (rawChildModule, key) => {
        this.register(rawChildModule, path.concat(key))
      })
    }
    return newModule
  }

  getNamespaced(path) { // ['a', 'b', 'c'] a/b/c
    let module = this.root
    return path.reduce((namespaceStr, key) => {
      module = module.getChild(key) // 子模块
      return namespaceStr + (module.namespaced ? key + '/' : '')
    }, '')
  }
}

// 格式化数据目标:
// root = {
//   _raw: rootModule,
//   state: rootModule.state,
//   _children: {
//     aCount: {
//       _raw: aModule,
//       state: aModule.state,
//       _children: {}
//     },
//     bCount: {
//       _raw: bModule,
//       state: bModule.state,
//       _children: {}
//     }
//   }
// }
