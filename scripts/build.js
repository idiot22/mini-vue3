// 把package目录下的所有包都进行打包
const fs = require('fs')
// 开启子进程
const execa = require('execa')

const targets = fs.readdirSync('packages').filter(f => {
  if(!fs.statSync(`packages/${f}`).isDirectory()){
    return false
  }
  return true
})
// 对目标进行依次打包，并行打包
async function build(target){
  await execa('rollup', ['-c', '--environment',`TARGET:${target}`], 
  {stdio: 'inherit'})// 当子进程打包信息共享给父进程
}

function runParallel(targets, iteratorFn){
  const res = []
  for(let item of targets){
    const p = iteratorFn(item)
    res.push(p)
  }
  return Promise.all(res)
}

runParallel(targets, build)