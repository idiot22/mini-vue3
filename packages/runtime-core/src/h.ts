import { isArray, isObject } from "@vue/shared"
import { createVnode, isVnode } from "./vnode"

export function h(type, propsOrChildren, children){
  const l = arguments.length
  if(l === 2){
    if(isObject(propsOrChildren) && !isArray(propsOrChildren)){
      if(isVnode(propsOrChildren)){
        return createVnode(type, null, [propsOrChildren])
      }
      return createVnode(type, propsOrChildren)
    }else{
      return createVnode(type, null, propsOrChildren)
    }
  }else{
    if(l > 3){
      children = Array.prototype.slice.call(arguments, 2)
    }else if(l === 3 && isVnode(children)){
      children = [children]
    }
    return createVnode(type, propsOrChildren, children)
  }
}
/**
 * h('div',{a: 1})
 * h('div',h('span'))
 * h('div', null, 'b','b','c')
 * h('div',{}, [h('span')])
*/
