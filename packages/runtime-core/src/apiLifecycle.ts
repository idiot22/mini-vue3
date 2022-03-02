import { currentInstance, setCurrentInstance } from "./component"
const enum LifeCycleHooks {
  BEFORE_MOUNT = 'bm',
  MOUNT = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATE = 'u'
}
// 注意onmounted是子组件挂载后父组件再进行挂载，所以target在执行父组件时默认值有可能是子组件

const injectHook = (type, hook, target) => {
  if(!target){
    return console.warn('injection APIs can only be used during execution of setup()')
  }else{
    const hooks = target[type] || (target[type] = [])
    const wrap = () => {
      setCurrentInstance(target)
      hook.call(target) // 让函数调用的时候永远是他自己组件
      setCurrentInstance(null)
    }
    hooks.push(wrap)
  }
}
export const createHook = (lifecycle) => (hook, target = currentInstance)=>{
  // 给当前实例增加对应的生命周期
  injectHook(lifecycle, hook, target)
}
export const invokeArrayFn = (fns) => {
  for(let i=0; i<fns.length;i++){
    fns[i]()
  }
}
export const onBeforeMount = createHook(LifeCycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifeCycleHooks.MOUNT)
export const onBeforeUpdate = createHook(LifeCycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifeCycleHooks.UPDATE)