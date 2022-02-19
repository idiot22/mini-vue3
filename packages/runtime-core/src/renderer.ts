import { effect } from '../../reactivity/src/effect'
import { ShapeFlags } from '../../shared/src/shapeFlags'
import { createAppApi } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
// 创建渲染器
export function createRenderer(renderOptions){ // 告诉core怎么渲染
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
        // 更新逻辑
      }
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
  
  const patch = (n1, n2, container) => {
    // 针对不同类型，做初始化操作
    const { shapeFlag } = n2
    if(shapeFlag & ShapeFlags.ELEMENT){
      console.log('元素')
    }else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
      console.log('组件')
      processComponent(n1,n2, container)
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