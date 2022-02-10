import { createAppApi } from './appCreateApp'
// 创建渲染器
export function createRenderer(renderOptions){ // 告诉core怎么渲染
  let render = () => {}
  return {
    createApp: createAppApi(render)
  }
}