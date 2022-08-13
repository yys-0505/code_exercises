import { createObjectExpression, createVnodeCall, NodeTypes } from "../ast";

export function transformElement(node, context) {
  // 给所有儿子处理完后 给元素重新添加children属性
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const vnodeTag = `"${node.tag}"`
      const properties = []
      const props = node.props
      for (let i = 0; i < props.length; i++) {
        properties.push({
          key: props[i].name,
          value: props[i].value.content
        })
      }
      
      const propsExpression = properties.length > 0 ? createObjectExpression(properties) : null
      
      let childrenNode = null
      if (node.children.length === 1) {
        childrenNode = node.children[0]
      } else if (node.children.length > 1) {
        childrenNode = node.children
      }

      // 添加 createElementVnode()
      node.codegenNode = createVnodeCall(context, vnodeTag, propsExpression, childrenNode)

    }
  }
}