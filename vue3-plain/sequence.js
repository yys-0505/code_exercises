function getSequence(arr) {
  const len = arr.length
  const result = [0] // 默认第0个为基准; 存的是索引值
  const q = new Array(len).fill(0) // 标记索引, 放的东西不关心, 但要和数组一样长

  let start
  let end
  let middle
  let resultLastIndex
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI !== 0) { // 0特殊含义, 需要创建
      resultLastIndex = result[result.length - 1]
      if (arr[resultLastIndex] < arrI) { // 比较结果最后一项和当前的值, 如果比最后一项大, 则将当前索引放到结果集中
        result.push(i)
        q[i] = resultLastIndex // 当前放到末尾的要记住前一个元素的index
        continue
      }

      // 二分法查找, 在结果集找第一个比当前值大的, 用当前索引值替换原来的索引
      // 递增序列 采用二分法查找是最快的
      start = 0
      end = result.length - 1
      while (start < end) {
        middle = ((start + end) / 2) | 0 // 结果集数组的index
        // 1 2 3 4 middle 6 7 8 9 9; 6
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }

      if (arr[result[end]] > arrI) { // result[start] 这里start/end都可以
        result[end] = i
        q[i] = result[end - 1] // 记住前一个是谁
      }

    }
  }

  //过程分3步
  // 1默认追加 2替换 3记录每个人的前驱节点
  // 通过最后一项进行回溯
  ;let i = result.length
  ;let last = result[i - 1]
  while (i-- >0) { // 倒序追溯
    result[i] = last
    last = q[last]
  }
  return result
}