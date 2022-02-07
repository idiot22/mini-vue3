export const isObject = (val: any) => {
  return typeof val === 'object' && val !== null
}
export const extend = Object.assign
export const isArray = Array.isArray
export const isFunction = (value) => typeof value == 'function'
export const isNumber = (value) => typeof value == 'number'
export const isString = (value) => typeof value === 'string'
export const isIntegerKey = (key) => typeof key + '' === key
export const hasOwn = (target, key) => target.hasOwnProperty(key)

export const hasChanged = (oldValue, newValue) => {
  return oldValue !== newValue
}