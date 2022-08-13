import { createVnodeCall, NodeTypes } from "./ast"
import { CREATE_ELEMENT_BLOCK, CREATE_ELEMENT_VNODE, FRAGMENT, OPEN_BLOCK, TO_DISPLAY_STRING } from "./runtimeHelpers"
import { transformElement } from "./transforms/transformElement"
import { transformExpression } from "./transforms/transformExpression"
import { transformText } from "./transforms/transformText"


function createTransformContext(root) {
  const context = {
    currentNode: root, // 当前正在转化的节点
    parent: null, // 父节点
    helpers: new Map(), // 优化, 超过20个相同的节点会被字符串化
    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    },
    removeHelper(name) {
      const count = context.helpers.get(name)
      if (count) {
        const currentCount = count - 1
        if (!currentCount) {
          context.helpers.delete(name)
        } else {
          context.helpers.set(name, currentCount)
        }
      }
    },
    nodeTransforms: [
      transformElement,
      transformText,
      transformExpression,
    ]
  }
  return context
}

function traverse(node, context) {
  context.currentNode = node
  const nodeTransforms = context.nodeTransforms
  const exitFns = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    onExit && exitFns.push(onExit)
    if (!context.currentNode) { // 当前节点被删掉, 就不考虑儿子了
      return
    }
  }
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      for (let i = 0; i < node.children.length; i++) {
        context.parent = node
        traverse(node.children[i], context)
      }
      break;
    default:
      break;
  }

  context.currentNode = node // 执行退出函数时currentNode指向依旧是对的
  let i = exitFns.length
  while(i--) {
    exitFns[i]()
  }
}

export function createRootCodegen(ast, context) {
  let { children } = ast
  if (children.length === 1) { // 只一个节点
    const child = children[0]
    if (child.type === NodeTypes.ELEMENT && child.codegenNode) { // 元素
      ast.codegenNode = child.codegenNode // 不再调用createElementVnode
      // 调用 openBlock createElementBlock
      context.removeHelper(CREATE_ELEMENT_VNODE)
      context.helper(OPEN_BLOCK)
      context.helper(CREATE_ELEMENT_BLOCK)
      ast.codegenNode.isBlock = true // 只有一个元素, 那么当前元素只有一个block节点
    } else {
      ast.codegenNode = child
    }
  } else {
    if (children.length === 0) {
      return
    }
    ast.codegenNode = createVnodeCall(context, context.helper(FRAGMENT), null, children)
    context.helper(OPEN_BLOCK)
    context.helper(CREATE_ELEMENT_BLOCK)
    ast.codegenNode.isBlock = true
  }
}

// 对树进行遍历
export function transform(ast) {
  const context = createTransformContext(ast)

  traverse(ast, context)

  createRootCodegen(ast, context);
  ast.helpers = [...context.helpers.keys()]
}