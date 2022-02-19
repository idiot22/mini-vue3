import { extend } from "@vue/shared";
import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

// 渲染时用到的所有方法
export const renderOptions = extend({patchProp}, nodeOps)

// runtime-dom是为了解决平台差异

export const createApp  = (rootComponent, rootProps = null) => {
  const app = createRenderer(renderOptions).createApp(rootComponent, rootProps)
  let { mount } = app
  app.mount = function(container){
    container = document.querySelector(container)
    container.innerHTML = ''
    mount(container)
  }
  return app
}
export * from '@vue/runtime-core'