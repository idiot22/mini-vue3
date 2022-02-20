let queue = []
export function queueJob(job){
  if(!queue.includes(job)){
    queue.push(job)
    queueFlush()
  }
}
let isFlushPending = false
function queueFlush(){
  if(!isFlushPending){
    isFlushPending = true
    Promise.resolve().then(flushJobs)
  }
}
function flushJobs(){
  isFlushPending = false
  // 清空时，我们需要根据调用顺序依次刷新，保证先刷新父再刷新子
  queue.sort((a,b) => a.id - b.id)
  for(let i=0;i< queue.length;i++){
    const job = queue[i]
    job()
  }
  queue.length = 0
}