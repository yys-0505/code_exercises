(function(window){
  const PENDING = 'pending'
  const RESOLVED = 'resolved'
  const REJECTED = 'rejected'

  class Promise {
    constructor (executor) {
      const self = this
      self.status = PENDING
      self.data = undefined
      self.callbacks = []
  
      function resolve(value) {
        const { status, callbacks } = self
        // 当前状态不是pending
        if (status !== PENDING) return
  
        self.status = RESOLVED
        self.data = value
        if (callbacks.length) {
          setTimeout(() => {
            callbacks.forEach(({ onResolved }) => {
              onResolved(value)
            })
          })
        }
      }
      function reject(reason) {
        const { status, callbacks } = self
        if (status !== PENDING) return
  
        self.status = REJECTED
        self.data = reason
        if (callbacks.length) {
          setTimeout(() => {
            callbacks.forEach(({ onRejected }) => {
              onRejected(reason)
            })
          })
        }
      }
  
      // executor本身报错, 既没有调resolve, 也没有调reject
      try {
        executor(resolve, reject)
      } catch (error) {
        reject(error)
      }
    }

    // 指定成功、失败的回调函数
    then(onResolved, onRejected) {
      const self = this
      const { status, callbacks } = self

      onResolved = typeof onResolved === 'function' ? onResolved : value => value
      onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

      // 返回一个新的promise对象
      return new Promise((resolve, reject) => {

        // 成功、失败回调处理, 结果作为下一个promise对象的data, 即上一个回调函数的结果与下一个promise对象关联
        const handle = (callback) => {
          try {
            const result = callback(self.data)
            // 处理链式调用 p.then().then()
            if (result instanceof Promise) { // 前一个then是promise对象, 可能同步, 可能异步
              result.then(
                value => resolve(value),
                reason => reject(reason)
              )
              // 上面可简写成: result.then(resolve, reject)
            } else {
              resolve(result) // 前一个then同步执行
            }
          } catch (error) {
            reject(error)
          }
        }

        if (status === PENDING) { // 某个异步之后resolve、reject, 要先存储回调; 即改变状态在后
          // callbacks.push({ onResolved, onRejected }) // 执行的时候不能关联下一个promise对象的状态, 需改造
          callbacks.push({
            onResolved() {
              // onResolved(data)
              handle(onResolved)
            },
            onRejected() {
              // onRejected(data)
              handle(onRejected)
            }
          })
        } else if (status === RESOLVED) { // 执行executor时已经resolve, 立即执行回调; 即改变状态在先
          setTimeout(() => {
            handle(onResolved)
          })
        } else { // rejected; 执行executor时已经reject, 立即执行回调
          setTimeout(() => {
            handle(onRejected)
          })
        }
      })
    }

    catch(onRejected) {
      return this.then(undefined, onRejected)
    }

    // 返回成功、失败的promise
    static resolve = function(value) {
      return new Promise((resolve, reject) => {
        if (value instanceof Promise) {
          value.then(resolve, reject)
        } else {
          resolve(value)
        }
      })
    }

    // 返回一个指定reason的失败的promise
    static reject = function(reason) {
      return new Promise((_, reject) => {
        reject(reason)
      })
    }

    static all = function(promises) {
      const values = new Array(promises.length)
      let resolvedCount = 0
      return new Promise((resolve, reject) => {
        promises.forEach((p, index) => {
          Promise.resolve(p).then( // 数组可能有非promise对象,如数字[p, 1], 所以用Promise.resolve包一层
            value => {
              resolvedCount ++
              values[index] = value
              (resolvedCount === promises.length) && resolve(values)
            },
            reason => reject(reason) // 只要有一个失败, return的promise就失败
          )
        })
      })
    }

    static race = function(promises) {
      return new Promise((resolve, reject) => {
        promises.forEach(p => Promise.resolve(p).then(resolve, reject))
      })
    }

    // 返回一个promise对象, 在指定时间后才确定结果
    static resolveDelay = function(value, time) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (value instanceof Promise) {
            value.then(resolve, reject)
          } else {
            resolve(value)
          }
        }, time)
      })
    }

    static rejectDelay = function(reason, time) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(reason)
        }, time)
      })
    }
  }

  window.Promise = Promise
})(window)
