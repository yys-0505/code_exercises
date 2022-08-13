import { PatchFlags } from "@vue/shared";
import { createCallExpression, NodeTypes } from "../ast";


export function isText(node) {
  return node.type === NodeTypes.INTERPOLATION || node.type === NodeTypes.TEXT
}
export function transformText(node, context) {
  // 遇到元素的时候 才能处理多个子节点
  if (node.type === NodeTypes.ELEMENT || node.type === NodeTypes.ROOT) {
    return () => {
      // COMPOUND_EXPRESSION, // 复合表达式 {{ aaa }} abc, 5 2, 即表达式和文本
      let currentContainer = null
      let children = node.children
      let hasText = false
      // <div> 123 {{ abc }} abc {{ ddd }}</div>
      for (let i = 0; i < children.length; i++) {
        const child = children[i]; // 第一个孩子
        if (isText(child)) {
          hasText = true
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]
            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child]
                }
              }
              currentContainer.children.push('+', next) // 下一个节点和第一个节点拼接
              children.splice(j, 1)
              j--
            } else {
              currentContainer = null
              break
            }
          }
        }
      }

      if (!hasText || children.length === 1) { // 不是文本(元素), 或是文本且长度是1, 不处理
        return
      }

      // 添加patchFlag
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const callArgs = []
        if (isText(child) || child.type === NodeTypes.COMPOUND_EXPRESSION) { // 都是文本
          callArgs.push(child)
          if (node.type !== NodeTypes.TEXT) { // 动态节点
            callArgs.push(PatchFlags.TEXT) // 为了靶向更新
          }

          children[i] = {
            type: NodeTypes.TEXT_CALL,
            content: child,
            codegenNode: createCallExpression(context, callArgs) // 通过createTextVNode来实现
          }
        }
      }

    }
  }
}