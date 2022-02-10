export const patchStyle = (el, prev, next) =>{
  const style = el.style
  if(next == null){
    el.removeAttribute('style')
  }else{
    if(prev){
      // prev里有，新的没有，就要删除
      for(let key in prev){
        if(next[key] == null){
          style[key] = ''
        }
      }
    }
    for(let key in next){
      style[key] = next[key]
    }
  }
}