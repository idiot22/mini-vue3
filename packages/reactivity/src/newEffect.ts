import { extend, isArray, isIntegerKey } from "@vue/shared"
import { TriggerOrTypes } from "./operators"
// 用于收集依赖
let shouldTrack = true
export class ReactiveEffect {
  active = true
  deps = []
  public onStop?: () => void
  constructor(public fn, public scheduler?){
    console.log('创建 ReactiveEffect 对象')
  }
  run(){
    // active为false就执行fn，但是不收集依赖
    if(!this.active){
      return this.fn()
    }
    // 执行fn收集依赖
    shouldTrack = true
    activeEffect = this
    console.log('执行用户传入的fn')
    const result = this.fn()
    // 重置
    shouldTrack = false
    activeEffect = undefined

    return result
  }

  stop() {
    // active为了避免重复调用stop
    if(this.active){
      cleanupEffect(this)
      if(this.onStop){
        this.onStop()
      }
      this.active = false
    }
  }
}
function cleanupEffect(effect){
  effect.deps.forEach((dep) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}
// export function effect(fn, options){
//   const effect = createReactiveEffect(fn, options)
//   if(!options?.lazy){
//     effect()
//   }
//   return effect
// }
export function effect(fn, options = {}){
  let _effect = new ReactiveEffect(fn)
  extend(_effect, options)
  if(!options?.lazy){
    // 把当前activeEffect更新，调用fn，收集effect依赖
    _effect.run()
  }
  // 返回run方法
  // 让用户可以自行选择调用时机，lazy的时候就要用户自己调用
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner){
  runner.effect.stop()
}

// export function track(target, type, key){
  
// }
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
    console.log(effects, 'effect触发')
  }
}