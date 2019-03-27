/**
 * mac api
 *
 */

/*
* mac在bom中注入api是异步发生的，这个数组用来存储mac api 注入前所有不成功调用
*/
let MacInitCalls = []

//导出文件
export function exportFile(result,filename) {
    if(!(result instanceof String) || !(filename instanceof String))
    {
        console.error('mac api:exportFile the params must be string')
    }
    try{
        external.SaveGPX(result,filename)
    }catch(error){
        console.error(error)
    }
}

//导入文件
export function importFile(type,call,ErrorCall) {
    try{
        console.log("type是:"+type);
        external.importFile(type,call)
    }catch(error){
        console.error(error)
    }
}

//保存配置
export function SyncConfig(key,val)
{
    try{
        external.SetConfig(key,String(val))
    }catch(error){
        console.error(error)
}
}

//ios推送消息告诉玩家已经到达终点
export function arrived(){
  try{
    external.arrived()

  }catch(error){
    console.error(error)
  }
}

//解决ios低版本兼容性问题.
export function copyText(text){
  try{
    external.copyText(text)
  }catch(error){
    console.error(error)
  }
}


//获取配置
export function ConfigGet(key,call,errorCall)
{
    if(typeof(call) != typeof(function(){}))
    {
        console.error('GetConfig 2 params error,must be function')
        return ;
    }
    try {
        window.external.GetConfig(key,call)
    }catch(error){
        if(!window.hasOwnProperty('external'))
        {
            if(errorCall instanceof Function)
            {
                errorCall()
            }
        }
    }
}

//打开一个地址
export function openurl(url){
    if(!(url instanceof String) && !/^http.*$/.test(url)){
        console.error('[mac api:openurl] the params must be url string')
    }
    try{
        external.NewWindow(url)
    }catch(e){
        console.error(e)
    }
}

export function iosSetTimeout(callback,time){
  try{
    return external.iosSetTimeout(callback,time)
  }catch(error){
    console.log(error);
  }
}

export function iosClearInterval(interval){
  try{
    external.iosClearInterval(interval)
  }catch(error){
    console.log(error);
  }
}
