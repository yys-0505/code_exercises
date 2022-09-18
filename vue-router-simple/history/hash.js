import History from "./base.js";

function getHash() {
  return window.location.hash.slice(1)
}

function ensureSlash() {
  if (window.location.hash) {
    return
  }
  window.location.hash = '/'
}

export default class extends History {
  constructor(router) {
    super(router)
    
    ensureSlash()
  }
  getCurrentLocation() {
    return getHash()
  }
  setupListener() {
    console.log(12)

    window.addEventListener('hashchange', () => {
      console.log(12)
      this.transitionTo(getHash())
    })
  }
}