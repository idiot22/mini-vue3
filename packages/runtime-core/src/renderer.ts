import { effect } from '../../reactivity/src/effect'
import { ShapeFlags } from '../../shared/src/shapeFlags'
import { createAppApi } from './apiCreateApp'
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
        let proxyToUse = instance.proxy
        let subTree = instance.subTree = instance.render.call(proxyToUse, proxyToUse)
        patch(null, subTree, container)
        instance.isMounted = true
        console.log(subTree, 'subTree')
      }else{
        // diff算法
        // 更新逻辑
      }
    }, {
      scheduler: queueJob
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
  const mountElement = (vnode, container) => {
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
    hostInsert(el, container)
  }
  const processElement = (n1, n2, container) => {
    if(n1 === null){
      mountElement(n2, container)
    }else{
      // 元素的更新
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

  const patch = (n1, n2, container) => {
    // 针对不同类型，做初始化操作
    const { shapeFlag, type } = n2
    switch (type){
      case Text:
        processText(n1,n2,container)
        break;
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(n1, n2, container)
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