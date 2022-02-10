import { hyphenate } from "@vue/shared"

export function addEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options: EventListenerOptions
){
  el.addEventListener(event, handler, options)
}
export function removeEventListener(
  el: Element,
  event: string,
  handler: EventListener,
  options: EventListenerOptions
){
  el.removeEventListener(event, handler, options)
}
// 1. 给元素缓存一个绑定事件的列表
// 2. 如果缓存中没有缓存过，而且nextvalue有值，就需要创建一个invoker来存
// 3. 以前绑定过，现在没有了，就要删除
// 4. 以前有，现在有，就赋值给value
export const patchEvent = (el, key, prevValue, nextValue, instance = null) => { 
  // vue event invoker
  const invokers = el._vei || (el._vei = {})
  const existingInvoker = invokers[key]
  if(nextValue && existingInvoker){
    existingInvoker.value = nextValue
  }else{
    const [name, options] = parseName(key)
    if(nextValue){
      const invoker = (invokers[key] = createInvoker(nextValue, instance))
      addEventListener(el, key, invoker, options)
    }else{
      removeEventListener(el, key, existingInvoker, options)
      invokers[key] = undefined
    }
  }
}
let _getNow: () => number = Date.now

const optionsModifierRe = /(?:Once|Passive|Capture)$/
 function parseName(name){
   let options
   if(optionsModifierRe.test(name)){
     options = {}
     let m
     while ((m = name.match(optionsModifierRe))) {
        name = name.slice(0, name.length - m[0].length)
        options[m[0].toLowerCase()] = true
     }
   }
   return [
    hyphenate(name.slice(2)),
     options
   ]
 }
 
function createInvoker(initialValue, instance){
  const invoker = (e: Event) => {
    invoker.value(e)
  }
  invoker.value = initialValue
  return invoker
}