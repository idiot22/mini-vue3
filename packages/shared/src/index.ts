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
const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}
const hyphenateRE = /\B([A-Z])/g
export const hyphenate = cacheStringFunction((str: string) =>
  str.replace(hyphenateRE, '-$1').toLowerCase()
)
