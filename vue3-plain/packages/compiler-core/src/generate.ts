import { NodeTypes } from "./ast"
import { helperMap, TO_DISPLAY_STRING } from "./runtimeHelpers"



function createCodegenContext(ast) {
  const context = {
    code: '',
    helper(name) {
      return `${helperMap[name]}`
    },
    push(code) {
      context.code += code
    },
    indentLevel: 0,
    indent() { // 向后缩进
      ++context.indentLevel
      context.newLine()
    },
    deindent(withoutNewLine = false) { // 向前缩进
      if (withoutNewLine) {
        --context.indentLevel
      } else {
        --context.indentLevel
        context.newLine()
      }
    },
    newLine() { // 根据indentLevel生成新的行
      newLine(context.indentLevel)
    }
  }

  function newLine(n) {
    context.push('\n' + '  '.repeat(n))
  }

  return context
}

function genFunctionPreable(ast, context) {
  if (ast.helpers.length > 0) {
    const importFn = `${ast.helpers.map(h => `${context.helper(h)} as _${context.helper(h)}`).join(',')}`
    context.push(`import { ${importFn} } from "vue" `)
    context.newLine()
  }
  
  context.push(`export `)
}

function genText(node, context) {
  context.push(JSON.stringify(node.content))
}

function genInterpolation(node, context) {
  context.push(`${helperMap[TO_DISPLAY_STRING]}(`)
  genNode(node.content, context)
  context.push(')')
}

function genExpression(node, context) {
  context.push(node.content)
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context)
      break
    default:
      break;
  }
}

export function generate(ast) {
  const context = createCodegenContext(ast)
  
  const { push, indent, deindent, } = context

  genFunctionPreable(ast, context)
  
  const functionName = 'render'

  const args = ['_ctx', '_cache', '$props']
  
  push(`function ${functionName}(${args.join(',')}) {`)
  indent()
  push(`return `)

  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push('null')
  }

  deindent()
  push('}')



  console.log(context.code);
  

}