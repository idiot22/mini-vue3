import { isFunction } from "@vue/shared"
import { effect, track, trigger } from "./effect"
import { TrackOptions, TriggerOrTypes } from "./operators"
class ComputedRefImpl{
  public _dirty = true
  public _value
  public effect
  constructor(getter,public setter){
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        if(!this._dirty){
          this._dirty = true
          trigger(this, TriggerOrTypes.SET, 'value')
        }
      }
    })
  }
  get value(){
    if(this._dirty){
      this._value = this.effect()
      this._dirty = false
    }
    track(this, TrackOptions.Get, 'value')
    return this._value
  }
  set value(newvalue){
    this.setter(newvalue)
  }
}
// vue2 和vue3 原理不一样
export function computed(getterOrOptions){
  let getter
  let setter
  if(isFunction(getterOrOptions)){
    getter = getterOrOptions
    setter = () => {
      console.warn('computed value must be readonly')
    }
  }else{
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}