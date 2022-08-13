import { NodeTypes } from "./ast"

function createParserContext(template) {
  return {
    line: 1,
    column: 1,
    offset: 0,
    source: template, // 此字段会被不停的解析 slice
    originalSource: template
  }
}

function isEnd(context) {
  const source = context.source
  if (source.startsWith('</')) {
    return true
  }
  return !source // source为空串时表示解析完毕
}

function getCursor(context){
  const { line, column, offset } = context
  return { line, column, offset }
}

function advancePositionWithMutation(context, source, endIndex) {
  let linesCount = 0
  let linePos = -1 // 换行符的位置
  for (let i = 0; i < endIndex; i++) {
    if (source.charCodeAt(i) === 10) {
      linesCount++
      linePos = i
    }
  }
  
  context.line += linesCount
  context.offset += endIndex
  context.column = linePos === -1 ? context.column + endIndex : endIndex - linePos
}

function advanceBy(context, endIndex) {
  // 每次删除都要更新行、列、偏移量信息
  const source = context.source
  advancePositionWithMutation(context, source, endIndex)

  context.source = source.slice(endIndex)
}

function parseTextData(context, endIndex) {
  const rawText = context.source.slice(0, endIndex)
  advanceBy(context, endIndex)
  return rawText
}

function getSelection(context, start, end?) {
  end = end || getCursor(context)
  return {
    start,
    end,
    source: context.originalSource.slice(start.offset, end.offset)
  }
}

function parseText(context) {
  const endTokens = ['<', '{{']
  let endIndex = context.source.length // 默认到最后
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }
  
  // 创建行列信息
  const start = getCursor(context)
  // 取内容
  const content = parseTextData(context, endIndex)
  // 获取结束位置
  return {
    type: NodeTypes.TEXT,
    content,
    loc: getSelection(context, start)
  }
}

function parseInterpolation(context) {
  const start = getCursor(context)
  // const closeIndex = context.source.indexOf('}}', '{{') // 结束大括号
  const closeIndex = context.source.indexOf('}}', 2) // 结束大括号
  advanceBy(context, 2) // 空格空格xxx空格空格}}
  const innerStart = getCursor(context)
  const innerEnd = getCursor(context)
  const rawContentLength = closeIndex - 2 // 原始内容长度
  const preContent = parseTextData(context, rawContentLength)//文本内容,带空格: 空格空格xxx空格空格
  const content = preContent.trim() // xxx
  const startOffset = preContent.indexOf(content)
  if (startOffset > 0) {
    advancePositionWithMutation(innerStart, preContent, startOffset)
  }
  const endOffset = startOffset + content.length
  advancePositionWithMutation(innerEnd, preContent, endOffset)
  advanceBy(context, 2)
  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
      loc: getSelection(context, innerStart, innerEnd)
    },
    loc: getSelection(context, start)
  }
}

function advanceBySpaces(context) {
  const match = /^[ \t\r\n]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

function parseAttributeValue(context) {
  const start = getCursor(context)
  const quote = context.source[0]
  let content;
  if (quote === '"' || quote === "'") {
    advanceBy(context, 1)
    const endIndex = context.source.indexOf(quote)
    content = parseTextData(context, endIndex)
    advanceBy(context, 1)
  }
  return {
    content,
    loc: getSelection(context, start)
  }
}

function parseAttribute(context) {
  const start = getCursor(context)
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
  const name = match[0] // 属性名
  advanceBy(context, name.length)
  advanceBySpaces(context)
  advanceBy(context, 1) // 去掉=
  const value = parseAttributeValue(context)

  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: {
      type: NodeTypes.TEXT,
      ...value
    },
    loc: getSelection(context, start)
  }
}

function parseAttributes(context) {
  const props = []

  while(context.source.length > 0 && !context.source.startsWith('>')) {
    const prop = parseAttribute(context)
    props.push(prop)
    advanceBySpaces(context)
  }
  return props
}

function parseTag(context) {
  const start = getCursor(context) // <div    name=11>banana</div>
  const match = /^<\/?([a-z][^ \t\r\n/>]*)/.exec(context.source)
  const tag = match[1] // div
  advanceBy(context, match[0].length) // match[0]: <div
  advanceBySpaces(context) // name=11>banana</div>

  const props = parseAttributes(context)

  const isSelfClosing = context.source.startsWith('/>')
  advanceBy(context, isSelfClosing ? 2 : 1)
  return {
    type: NodeTypes.ELEMENT,
    tag,
    isSelfClosing,
    children: [],
    props,
    loc: getSelection(context, start)
  }
}

function parseElement(context) {
  const ele = parseTag(context) // <div></div>, 这种情况的<div>
  // 儿子, 可能没有
  const children = parseChildren(context)
  if (context.source.startsWith('</')) { // <div></div>, 这种情况的</div>
    parseTag(context)
  }
  ele.loc = getSelection(context, ele.loc.start)
  ele.children = children
  return ele
}

export function parse(template) {
  // 创建一个解析的上下文
  const context = createParserContext(template)

  const start = getCursor(context)

  return createRoot(parseChildren(context), getSelection(context, start))
}

function createRoot(children, loc) {
  return {
    type: NodeTypes.ROOT,
    children,
    loc
  }
}

function parseChildren(context) {
  // <开头是元素; {{}}是表达式; 其他是文本
  let nodes = []
  while (!isEnd(context)) {
    const source = context.source
    let node;
    if (source.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (source[0] === '<') { // 标签
      node = parseElement(context)
    }
    if (!node) { // 文本
      node = parseText(context)
    }
    nodes.push(node)
  }
  nodes.forEach((node, i) => {
    if (node.type === NodeTypes.TEXT) {
      if (!/[^\t\r\n\f ]/.test(node.content)) {
        nodes[i] = null
      }
    }
  })
  nodes = nodes.filter(Boolean)
  return nodes
}