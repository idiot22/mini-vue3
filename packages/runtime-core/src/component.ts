import { isFunction, isObject } from "@vue/shared"
import { ShapeFlags } from "../../shared/src/shapeFlags"
import { PublicIntanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode){
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    setupState: {}, // 如果setup返回的是对象，这个对象会作为setupState
    ctx: {},
    isMounted: false
  }
  instance.ctx = {
    _: instance
  }
  return instance
}

export function setupComponent(instance){
  const { props, children } = instance.vnode
  instance.props = props // initProps()
  instance.children = children // initSlot()

  // 组件是否有状态
  let isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  if(isStateful){
    // 如果是带状态的组件，调用当前实力的setup方法，用返回值填充setupState
    setupStatefulComponent(instance)
  }
}
export let currentInstance = null
export const setCurrentInstance = (instance) => {
  currentInstance = instance
}
export const getCurrentInstance = () => {
  return currentInstance
}
function setupStatefulComponent(instance){
  // 1. 代理 传递给render函数的参数
  instance.proxy = new Proxy(instance.ctx, PublicIntanceProxyHandlers as any)
  // 2. 获取组件的类型 拿到组件的setup方法
  let Component = instance.type
  let {setup} = Component
  // instance中props，attrs，slots，emit export会被提取出去，
  // 因为开发过程中需要暴露
  if(setup){
    currentInstance = instance
    let setupContext = createSetupContext(instance)
    const  setupResult = setup(instance.props, setupContext)
    currentInstance = null
    handleSetupResult(instance, setupResult)
  }else{
    finishComponentSetup(instance)
  }
}
function handleSetupResult(instance, setupResult){
  if(isFunction(setupResult)){
    instance.render = setupResult
  }else if(isObject(setupResult)){
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance){
  let Component = instance.type
  if(!instance.render){
    // 对template模版进行编译，产生render函数
    if(!Component.render && Component.template){
      
    }
    instance.render = Component.render // 需要将生成的render函数放在实例上
  }
  // 对2.0进行兼容
  // todo
  console.log(instance.render, 'instance.render')
}
function createSetupContext(instance){
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    exports: () => {}
  }
}

// instance 表示组件的状态，组件相关信息
// context 就4个参数，方便开发
// proxy方便取值