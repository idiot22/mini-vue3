import { hasChanged, hasOwn, isArray, isIntegerKey, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOptions, TriggerOrTypes } from "./operators"
import { reactive, readonly } from "./reactive"

const get = createGetter()
const readonlyGet = createGetter(true)
const shallowGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)

const set = createSetter()
const shallowSet = createSetter(true)

const readonlyObj = {
  set: (target: any, key: string)=>{
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    );
  }
}
export const mutableHandlers = {
  get,
  set
}
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
}

export const readonlyHandlers = Object.assign({
  get: readonlyGet,
}, readonlyObj)

export const shallowReadonlyHandler = Object.assign({
  get: shallowReadonlyGet
}, readonlyObj)

function createGetter(isReadonly: boolean = false, isShallow: boolean = false){
  return function get(target, key, receiver){
    const res = Reflect.get(target, key, receiver)
    if(!isReadonly){
      // 依赖收集
      track(target, TrackOptions.Get, key)
    }
    if(isShallow){
      return res
    }
    if(isObject(res)){
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res
  }
}
function createSetter(isShallow = false){
  return function set(target, key, value, receiver){
    const oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    let hadKey = isArray(target) && isIntegerKey(key)  ? Number(key) < target.length : hasOwn(target,key)
    if(!hadKey){
      // 新增
      trigger(target, TriggerOrTypes.ADD, key, value)
    }else if(hasChanged(oldValue, value)){
      // 修改
      trigger(target, TriggerOrTypes.SET, key, value, oldValue)
    }
    return result
  }
}