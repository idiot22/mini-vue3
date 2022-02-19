import { isArray, isIntegerKey } from "@vue/shared"
import { TriggerOrTypes } from "./operators"

export function effect(fn, options?){
  const effect = createReactiveEffect(fn, options)
  if(!options?.lazy){
    effect()
  }
  return effect
}

let uid = 0
let activeEffect
let effectStack = []
function createReactiveEffect(fn, options){
  const effect = function reactiveEffect(){
    if(!effectStack.includes(effect)){
      try{
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      }finally{
        effectStack.pop()
        activeEffect = effectStack[effectStack.length-1]
      }
    }
  }
  effect.id = uid++
  effect._isEffect = true
  effect.raw = fn
  effect.options = options
  return effect
}

const targetMap = new WeakMap()
export function track(target, type, key){
  if(activeEffect === undefined){
    return
  }
  let depsMap = targetMap.get(target)
  if(!depsMap){
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if(!dep){
    depsMap.set(key, (dep = new Set))
  }
  if(!dep.has(activeEffect)){
    dep.add(activeEffect)
  }
}

export function trigger(target, type, key?, newValue?, oldValue?){
  const depsMap = targetMap.get(target)
  if(!depsMap){
    return
  }
  // 将所有的effect存在集合中，然后一起执行
  const effects = new Set()
  const add = (effectToAdd) => {
    effectToAdd.forEach(effect => {
      effects.add(effect)
    });
  }
  // 看修改的是不是数组长度，因为改长度影响很多
  if(key === 'length' && isArray(target)){
    depsMap.forEach((dep, index)=>{
      if(key === 'length' || key > newValue){
        add(dep)
      }
    })
  }else{
    if(key != undefined){
      // 修改对象
      add(depsMap.get(key))
    }
    // 如果修改数组中的磨一个索引怎么办？
    switch(type){
      case TriggerOrTypes.ADD: 
        if(isArray(target) && isIntegerKey(key)){
          add(depsMap.get('length'))
        }
    }
    effects.forEach((effect: any) => {
      if(effect.options.scheduler){
        effect.options.scheduler()
      }else{
        effect()
      }
    })
    console.log(effects, 'effect触发')
  }
}