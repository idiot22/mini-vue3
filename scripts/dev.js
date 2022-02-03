// 把package目录下的所有包都进行打包
const fs = require('fs')
// 开启子进程
const execa = require('execa')

const target = 'reactivity'
build(target)
// 对目标进行依次打包，并行打包
async function build(target){
  await execa('rollup', ['-cw', '--environment',`TARGET:${target}`], 
  {stdio: 'inherit'})// 当子进程打包信息共享给父进程
}