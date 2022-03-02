export {createRenderer} from './renderer'

export { h } from './h'
export {
  getCurrentInstance,
  setCurrentInstance,
} from './component'
export {
  onBeforeMount, 
  onMounted,
  onUpdated,
  onBeforeUpdate} from './apiLifecycle'
export * from '@vue/reactivity'