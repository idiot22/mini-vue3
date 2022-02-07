import { hasChanged, isArray, isObject } from "@vue/shared"
import { reactive } from "."
import { track, trigger } from "./effect"
import { TrackOptions, TriggerOrTypes } from "./operators"

export function ref(value){
  // 将普通类型变成对象，可以是对象，但对象用reactive好
  return createRef(value)
}
export function shallowRef(value){
  return createRef(value, true)
}
const convert = (val) => isObject(val) ? reactive(val) : val
class RefImpl{
  private _value
  public __v_isRef = true
  constructor(public rawValue, public shallow){
    this._value = shallow ? rawValue : convert(rawValue)
  }
  get value(){
    track(this, TrackOptions.Get, 'value')
    return this._value
  }
  set value(newValue){
    if(hasChanged(newValue, this.rawValue)){
      this.rawValue - newValue
      this._value = this.shallow ? newValue : convert(newValue)
      trigger(this, TriggerOrTypes.SET, 'value', newValue)
    }
  }
}

function createRef(rawValue, isShallow = false){
  return new RefImpl(rawValue, isShallow)
}
// 本身没有收集依赖功能，原对象是reactive的话就会收集
class ObjectRefImpl{
  public __v_isRef = true
  constructor(public target,public key){
  }
  get value(){
    return this.target[this.key]
  }
  set value(newValue){
    this.target[this.key] = newValue
  }
}
// 将某一个key对应的值转化成ref
export function toRef(target, key){
  return new ObjectRefImpl(target, key)
}

export function toRefs(object){
  const ret = isArray(object) ? new Array(object.length) : {}
  for(let key in object){
    ret[key] = toRef(object, key)
  }
  return ret
}