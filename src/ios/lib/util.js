/**
 * @param {node} f -textarea节点
 * @param {string} value -需要插入的值
 * @param {func} callback -回调函数
 */
function insertAtCursor(f, value, callback) {   //在textarea的光标处加入内容
  /* eslint-disable */
  let field = f
  let newValue = ''
  // IE support
  if (document.selection) {
    field.focus()
    const sel = document.selection.createRange()
    sel.text = newValue = value
    sel.select()
  } else if (field.selectionStart || field.selectionStart === 0) {
    const startPos = field.selectionStart
    const endPos = field.selectionEnd
    const restoreTop = field.scrollTop
    newValue = field.value.substring(0, startPos) +
      value +
      field.value.substring(endPos, field.value.length)
    if (restoreTop > 0) {
      field.scrollTop = restoreTop
    }
    field.focus()
    setTimeout(() => {
      field.selectionStart = startPos + value.length
      field.selectionEnd = startPos + value.length
    }, 0)
  } else {
    newValue = field.value + value
    field.focus()
  }
  callback(newValue)
}

export function debounce(func,wait){
  let timer = null;
  return function(){
    let context = this,
        args=arguments;
    if(timer!== null) clearTimeout(timer);
    timer = setTimeout(function(){
      func.apply(context,args)
    },wait)
  }
}

export function throttle(method,delay,duration){
  let timer = null;
  let begin=new Date().getTime();
  return function(){
    let context=this, args=arguments;
    let current=new Date().getTime();
    clearTimeout(timer);
    if(current-begin>=duration){
      method.apply(context,args);
      begin=current;
    }else{
      timer=setTimeout(function(){
        method.apply(context,args);
      },delay);
    }
  }
}

export default {
  throttle
}

