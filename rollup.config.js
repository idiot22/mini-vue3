import path from 'path'
import json from '@rollup/plugin-json'
import resolvePlugin from '@rollup/plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'
// 找到packages
const packagesDir = path.resolve(__dirname, 'packages')
// 找到要打包的某个包
const packageDir = path.resolve(packagesDir, process.env.TARGET)
// 永远针对的是某个模块
const resolve = (p) => path.resolve(packageDir, p)
const pkg = require(resolve('package.json'))
const name = path.basename(packageDir)
// 对打包类型先做一个类型判断
const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife'
  }
}

const options = pkg.buildOptions

function createConfig(format, output){
  output.name = options.name
  output.sourcemap = true
  return {
    input: resolve(`src/index.ts`),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin()
    ]
  }
}
export default options.formats.map(format => createConfig(format, outputConfig[format]))