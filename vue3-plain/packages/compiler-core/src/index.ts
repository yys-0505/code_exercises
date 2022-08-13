import { generate } from "./generate";
import { parse } from "./parse";
import { transform } from "./transform";

export function compile(template) {

  // 将模板转成抽象语法树 编译原理
  const ast = parse(template)

  // 对ast语法树进行预处理, 生成一些信息
  transform(ast)
  
  // 代码生成
  return generate(ast)
}