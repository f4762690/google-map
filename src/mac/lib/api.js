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
        window.external.SaveGPX(result,filename)
    }catch(error){
        console.error(error)
    }
}

//导入文件
export function importFile(call,ErrorCall) {
    try{
        let _result = window.external.importFile()
        _result = JSON.parse(_result)
        call(_result)
    }catch(error){
        console.error(error)
    }
}

//保存配置
export function SyncConfig(key,val)
{
    try{
        window.external.SetConfig(key,String(val))
    }catch(error){
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
        call(window.external.GetConfig(key))
    }catch(error){
        if(!window.hasOwnProperty('external'))
        {
            if(errorCall instanceof Function)
            {
                errorCall()
            }
        }
        //不成功的放入数组
        MacInitCalls.push({
            key:key,
            call:call
        })
    }
}

//打开一个地址
export function openurl(url){
    console.log("打开url"+url);
    if(!(url instanceof String) && !/^http.*$/.test(url)){
        console.error('[mac api:openurl] the params must be url string')
    }
    try{
        window.open(url);
        console.log("打开url");
        // window.external.NewWindow(url)
    }catch(e){
        console.error(e)
    }
}

//获取版本
export function getVersion(){
    try {
        return window.external.GetClientVersion()
    }catch(error){}
    return 0
}

//是否有ivchecker
export function hasIVChecker(){
    if(getVersion() < '1.7.9.0'){
        return false
    }else{
        return true
    }
}

export function regInitFun(fun){
    if(fun instanceof Function){
        MacInitCalls.push(fun)
    }
}
//mac api注入成功后会调用这个函数
window.safariGetConfig = ()=>{
    MacInitCalls.map((handler)=>{
        try{
            handler.call(window.external.GetConfig(handler.key))
        }catch(error){
            console.log(error)
        }
    })
}
