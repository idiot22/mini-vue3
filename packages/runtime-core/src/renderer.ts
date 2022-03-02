import { effect } from '../../reactivity/src/effect'
import { patchProp } from '../../runtime-dom/src/patchProp'
import { ShapeFlags } from '../../shared/src/shapeFlags'
import { createAppApi } from './apiCreateApp'
import { invokeArrayFn } from './apiLifecycle'
import { createComponentInstance, setupComponent } from './component'
import { queueJob } from './queueJob'
import { normalizeVNode, Text } from './vnode'
// 创建渲染器
export function createRenderer(renderOptions){ // 告诉core怎么渲染
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    cloneNode: hostCloneNode,
    insertStaticContent: hostInsertStaticContent
  } = renderOptions
  // ---------处理组件-----------
  const setupRenderEffect = (instance, container) => {
    // 需要创建一个effect，在effect中调用render方法
    instance.update = effect(function componentEffect(){ // 每个组件都有一个effect，vue3是组件级更新，数据变化会重新执行对应的effect
      if(!instance.isMounted){
        // 初次渲染
        let {bm, m} = instance
        if(bm){
          invokeArrayFn(bm)
        }
        let proxyToUse = instance.proxy
        let subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse)
        patch(null, subTree, container)
        instance.isMounted = true
        if(m){
          invokeArrayFn(m)
        }
        console.log(subTree, 'subTree')
      }else{
        let {bu, u} = instance
        if(bu){
          invokeArrayFn(bu)
        }
        // diff算法
        // 更新逻辑
        const prevTree = instance.subTree
        let proxyToUse = instance.proxy
        const nextTree = instance.render.call(proxyToUse, proxyToUse)
        patch(prevTree, nextTree, container)
        if(u){
          invokeArrayFn(u)
        }
      }
    }, {
      scheduler: queueJob(instance)
    })
  }
  const mountComponent = (initialVnode, container) => {
    // 组件的渲染流程
    // 拿到setup的返回值，获取render函数返回的结果来进行渲染
    // 1. 先有实例
    const instance = initialVnode.componet = createComponentInstance(initialVnode)
    console.log(instance, 'instance')
    // 2. 需要的数据解析到实例上
    setupComponent(instance)
    // 3. 创建一个effect，让render函数执行
    setupRenderEffect(instance, container)
  }
  const processComponent = (n1, n2, container) => {
    if(n1 == null){
      mountComponent(n2, container)
    }else{
      // 组件更新流程
    }
  }
  // ---------处理组件-----------

  // ---------处理元素-----------
  const mountChildren = (children, el) => {
    for(let i=0; i<children.length; i++){
      let child = normalizeVNode(children[i])
      patch(null, child, el)
    }
  }
  const mountElement = (vnode, container, anchor) => {
    // 递归渲染
    const { props, shapeFlag, type, children} = vnode
    let el = vnode.el = hostCreateElement(type)
    if(props){
      for(const key in props){
        hostPatchProp(el, key, null, props[key])
      }
    }
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      hostSetElementText(el, children)
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
      mountChildren(children, el)
    }
    hostInsert(el, container, anchor)
  }
  const patchProps = (oldProps, newProps, el) => {
    if(oldProps !== newProps){
      for(let key in newProps){
        const oldProp = oldProps[key]
        const newProp = newProps[key]
        hostPatchProp(el, key, oldProp, newProp)
      }
      for(let key in oldProps){
        if(!(key in newProps)){
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }
  const unmountChildren = (child) => {
    child.forEach(it => {
      unmount(it)
    })
  }
  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // sync from start 从头开始一个个比 遇到不同的就停止了
    while(i <= e1 && i <= e2){
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVNode(n1, n2)){
        patch(n1, n2, el)
      }else{
        break
      }
      i++
    }
    // sync from end
    while(i <= e1 && i <= e2){
      const n1 = c1[i]
      const n2 = c2[i]
      if(isSameVNode(n1, n2)){
        patch(n1, n2, el)
      }else{
        break
      }
      e1--
      e2--
    }
    // common sequence + mount
    // 比较后 有一方已经完全比对完成了
    // 如果完成后，最终i的值大于e1，说明老的少
    if(i > e1){
      if(i <= e2){ // 表示有新增部分
        while(i <= e2){
          const nextPos = e2 + 1
          // 想知道是向前插入，还是向后插入
          const anchor = nextPos < c2.length ? c2[nextPos].el : null
          patch(null, c2[i], el, anchor) // 只向后增加
          i++
        }
      }
    }else if(i > e2){ // 老的多新的少
      // common sequence + unmount
      while(i <= e1){
        unmount(c1[i])
        i++
      } 
    }else{
      // unknown sequence
      // 乱序比较，需要尽可能的复用
      // 用新的元素做成一个映射表去老的表里找，一样的就复用，不一样的要不插入，要不删除
      let s1 = i
      let s2 = i
      // vue3用的是新做的映射表，vue2用的是老的做映射表
      const keyToNewIndexMap = new Map()
      for(let i = s2;i<=e2; i++){
        const childVNode = c2[i]
        keyToNewIndexMap.set(childVNode.key, i)
      }
      // 获取新数组中无序的个数
      const toBePatched = e2 - s2 + 1
      // newIndexToOldIndexMap用索引和值建立新旧数组的顺序关系，索引是新数组，要是值有0就说明这个元素的新增的
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0)
      for(let i=s1; i<=e1; i++){
        const oldVNode = c1[i]
        let newIndex = keyToNewIndexMap.get(oldVNode.key)
        if(newIndex === undefined){ // 老的里不再新的中
          unmount(oldVNode)
        }else{ // 新老比对
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(oldVNode, c2[newIndex], el)
        }
      }
      let increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
      let j = increasingNewIndexSequence.length
      for(let i = toBePatched - 1; i >= 0; i--){
        // 找到新数组对应的索引
        let currentIndex = i + s2
        // 找到h对应的节点
        let child = c2[currentIndex]
        let anchor = currentIndex + 1 < c2.length ? c2[currentIndex+1].el : null
        // 如果是0就是新增的
        if(newIndexToOldIndexMap[i] == 0){
          patch(null, child, el, anchor)
        }else{
          // 这种操作需要将节点全部移动一遍
          // hostInsert(child, el, anchor)
          if(i !== increasingNewIndexSequence[j]){
            hostInsert(child, el, anchor)
          }else{
            // 跳过不需要移动的元素
            j--
          }
        }
      }
      // 最后就是移动节点，并且将新增的节点插入
      // 最长递增子序列
    }
  }
  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children
    const c2 = n2.children
    // 老的有儿子 新的没儿子， 新的有儿子老的没儿子，新老都有儿子， 新老都是文本
    const preShapFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
      if(preShapFlag & ShapeFlags.ARRAY_CHILDREN){
        // 老的是n个孩子，但是新的是文本
        unmountChildren(c1)
      }
      if(c1 !== c2){
        hostSetElementText(el, c2)
      }
    }else{
      if(preShapFlag & ShapeFlags.ARRAY_CHILDREN){
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
          // 当前是数组，之前是数组
          // 两个数组的比对 => diff算法
          patchKeyedChildren(c1, c2, el)
        }else{
          // 没有孩子
          unmountChildren(c1)
        }
      }else{
        // 上一次是文本
        if(preShapFlag & ShapeFlags.TEXT_CHILDREN){
          hostSetElementText(el, '')
        }
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){
          mountChildren(c2, el)
        }
      }
    }
  }
  const patchElement = (n1, n2, container) => {
    // 元素是相同节点
    let el = n2.el = n1.el
    // 更新属性 更新儿子
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    patchProps(oldProps, newProps, el)
    patchChildren(n1, n2, container)
  }
  const processElement = (n1, n2, container, anchor) => {
    if(n1 === null){
      mountElement(n2, container, anchor)
    }else{
      // 元素的更新
      patchElement(n1, n2, container)
    }
  }
  // ---------处理元素-----------

  // ---------处理Text-----------
  const processText = (n1,n2,container) => {
    if(n1 === null){
      hostInsert(n2.el = hostCreateText(n2.children), container)
    }
  }
  // ---------处理Text-----------
  const isSameVNode = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key
  }
  const unmount = (n1) => {
    hostRemove(n1)
  }
  const patch = (n1, n2, container, anchor = null) => {
    // 针对不同类型，做初始化操作
    const { shapeFlag, type } = n2
    if(n1 && !isSameVNode(n1, n2)){
      // 不是一样的就删掉原来的，换成n2
      anchor = hostNextSibling(n1.el)
      unmount(n1)
      n1 = null
    }
    switch (type){
      case Text:
        processText(n1,n2,container)
        break;
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(n1, n2, container, anchor)
          console.log('元素')
        }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
          console.log('组件')
          processComponent(n1,n2, container)
        }
        break;
    }
  }
  const render = (vnode, container) => {
    // 根据不同的虚拟节点，创建对应的真实元素
    patch(null, vnode, container)
  }
  return {
    createApp: createAppApi(render)
  }
}
// [2,5,3,8,9,4,5,2]
// 2. result [5]
function getSequence(arr){
  const len = arr.length
  const result = [0]
  const p = arr.slice(0)
  let start
  let end
  let middle
  for(let i = 0;i < len; i++){
    const arrI = arr[i]
    if(arrI !== 0){
      let resultLastIndex = result[result.length - 1]
      // 取到索引对应的值
      // 要是item值大于result，就将索引push到result中
      if(arr[resultLastIndex] < arrI){
        // 标记当前前一个对应的索引
        p[i] = result[resultLastIndex]
        result.push(i)
        continue
      }
      // 当item小于result最后一个数
      // 二分查找 找到比当前值大的那一个
      // 用i替换掉
      start = 0
      end = result.length - 1 
      while(start < end){
        // 相当于去掉小数点
        middle = ((start + end)/2) | 0
        if(arr[result[middle]] < arrI){
          start = middle + 1
        }else{
          end = middle
        }
      }
      // start/end就是找到的位置
      if(arrI < arr[result[start]]){
        if(start > 0){
          // 要将他替换的前一个记住
          p[i] = result[start - 1]
        }
        result[start] = i
      }
    }
  }    
  let len2 = result.length
  let last = result[len2-1]
  while(len2-- >0){
    result[len2] = last
    last = p[last]
  }
  return result
}