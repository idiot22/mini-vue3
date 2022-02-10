export const nodeOps = {
  // 不同平台元素的创建方式不同
  createElement: tagName => document.createElement(tagName),
  remove: child => {
    let parent = child.parentNode
    parent.remove(child)
  },
  insert: (child, parent, anchor = null) => {
    // anchor相当于appendChild
    parent.insertBefore(child, anchor)
  },
  querySelector: selector => document.querySelector(selector),
  // 相当于innerText
  setElementText: (el, text) => el.textContent = text,
  // 文本操作
  createText: (text) => document.createTextNode(text),
  setText: (node, text) => node.nodeValue = text,
  createComment: (node, text) => document.createComment(text),
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling 
} 