export function mapState(useStore, keysOrMapper) {
  return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
    // { count: function() { return useStore()[key] }, xxx: ... }
    reduced[key] = function() {
      return useStore()[key]
    }
    return reduced
  }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
    reduced[key] = function() {
      const store = useStore()
      const storeKey = keysOrMapper[key]
      return store[storeKey]
    }
    return reduced
  }, {})
}

export function mapActions(useStore, keysOrMapper) {
  return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
    reduced[key] = function(...args) {
      return useStore()[key](...args)
    }
    return reduced
  }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
    reduced[key] = function(...args) {
      const store = useStore()
      const storeKey = keysOrMapper[key]
      return store[storeKey](...args)
    }
    return reduced
  }, {})
}

export function mapWritableState(useStore, keysOrMapper) {
  return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
    // { count: function() { return useStore()[key] }, xxx: ... }
    reduced[key] = {
      get() {
        return useStore()[key]
      },
      set(value) {
        useStore()[key] = value
      }
    }
    return reduced
  }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
    reduced[key] = {
      get() {
        const store = useStore()
        const storeKey = keysOrMapper[key]
        return store[storeKey]
      },
      set(value) {
        const store = useStore()
        const storeKey = keysOrMapper[key]
        store[storeKey] = value
      }
    }
    return reduced
  }, {})
}