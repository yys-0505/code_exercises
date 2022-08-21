export function addSubscription(subscritions, cb) {
  subscritions.push(cb)
  return function removeSubscription() {
    const idx = subscritions.indexOf(cb)
    if (idx > -1) {
      subscritions.splice(idx, 1)
    }
  }
}

export function triggerSubscription(subscritions, ...args) {
  subscritions.forEach(cb => cb(...args))
}