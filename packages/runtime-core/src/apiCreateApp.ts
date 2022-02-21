import { createVnode } from "./vnode"

// 柯里化
export const createAppApi = (render) => {
 return function createApp(rootComponent, rootProps){ // 告诉他哪个组件哪个属性来创建的应用
    const app = {
      _props: rootProps,
      _component: rootComponent,
      _container: null,
      mount(container){ // 挂载在哪个元素上
        /**
         * 1.根据组件创建虚拟节点
         * 2.将虚拟节点和容器获取到后调用render方法进行渲染
        */

        // 创建虚拟节点
        const vnode = createVnode(rootComponent, rootProps)
        console.log(vnode, 'vnode')
        render(vnode, container)
        app._container = container
      }
    }
    return app
  }
}