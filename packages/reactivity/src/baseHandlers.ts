import { isObject } from "@vue/shared"
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

}