import { isObject } from "@vue/shared"
import { mutableHandlers, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandler } from "./baseHandlers"


export function reactive(target){
  return createReactiveObject(target, false, mutableHandlers)
}
export function shallowReactive(target){
  return createReactiveObject(target, false, shallowReactiveHandlers)
}
export function shallowReadonly(target){
  return createReactiveObject(target, true, shallowReadonlyHandler)
}
export function readonly(target){
  return createReactiveObject(target, true, readonlyHandlers)
}

// 柯里化
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
export function createReactiveObject(target: any, isReadonly: boolean, baseHandlers: Object){
  // 如果目标不是对象，没法拦截，reactive这个api只能拦截对象类型
  if(!isObject(target)){
    return target
  }
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  let existProxy = proxyMap.get(target)
  if(existProxy){
    return existProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}