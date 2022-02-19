import { isArray, isObject, isString } from "@vue/shared"
import { ShapeFlags } from "../../shared/src/shapeFlags"
export const isVnode = (vnode) => {
  return vnode.__v_isVnode
}
// 创建虚拟节点
export const createVnode = (type, props, children = null) => {
  // 可以根据type来区分是组件还是普通的元素
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? 
                    ShapeFlags.STATEFUL_COMPONENT : 0
  const vnode = {
    __v_isVnode: true,
    type,
    children,
    componet: null, // 存储组件对应的实例
    props,
    el: null, // 将虚拟节点和真实节点对应起来
    key: props && props.key, // diff算法会用到key
    shapeFlag // 判断出当前自己的类型和儿子的类型
  }
  normalizeChildren(vnode, children)
  return vnode
}

function normalizeChildren(vnode, children){
  let type = 0
  if(children === null){

  }else if(isArray(children)){
    type = ShapeFlags.ARRAY_CHILDREN
  }else{
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.shapeFlag |= type
}