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
    if((typeof result != 'string') || (typeof filename != 'string'))
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
        external.importFile(type,call)
    }catch(error){
        console.error(error)
    }
}

//保存配置
export function SyncConfig(key,val)
{
    try{
      switch(window.osType){
        case 'pc':
          window.localStorage.setItem('key',val)
        break;
        case 'ios':
          external.SetConfig(key,String(val))
        default:
          external.SetConfig(key,String(val))
        break;
      }
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
      switch(window.osType){
        case 'pc':
          let result = window.localStorage.getItem(key)||'';
          call(result);
          break;
        case 'ios':
          window.external.GetConfig(key,call);
          break;
        default:
          window.external.GetConfig(key,call)
          break;
      }

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
        console.log("url"+url);
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

//ios底层继续处理移动
export function continueRun(param){
  try{
    external.continueRun(param)
  }catch(error){
    console.log(error);
  }
}

//设置系统默认语言
export function setLanguage(key,value){
  try{
    external.setLanguage(key,value)
  }catch(error){
    console.log(error);
  }
}

//开启托管
export function openHosting(){
  try{
    external.openHosting()
  }catch(error){
    console.log(error);
  }
}

//消息推送
export function sendNoti(msg){
  try{
    external.sendNoti(msg)
  }catch(e){
    console.log(e);
  }
}

//获取粘贴板内容
export async function getCopyText(call){
  try{
     external.getCopyText(call)
  }catch(error){
    console.log(error);
  }
}

