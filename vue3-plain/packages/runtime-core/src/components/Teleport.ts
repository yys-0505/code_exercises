export const TeleportImpl = {
  __isTeleport: true,
  process(n1, n2, container, anchor, internals) {
    const { mountChildren, patchChildren, move } = internals
    if (!n1) {
      const target = document.querySelector(n2.props.to)
      if (target) {
        mountChildren(n2.children, target)
      }
    } else {
      patchChildren(n1, n2, container) // 在老的container里更新子元素
      if (n2.props.to !== n1.props.to) {
        const nextTarget = document.querySelector(n2.props.to)
        n2.children.forEach((child) => {
          move(child, nextTarget)
        })
      }
    }
  }
}

export const isTeleport = type => type.__isTeleport