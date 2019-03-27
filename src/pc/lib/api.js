/**
 * win api
 */
//导出文件
export function exportFile(result,filename) {
    let aTag = document.createElement('a')
    let blob = new Blob([result])
    aTag.download = filename
    aTag.href = URL.createObjectURL(blob)
    aTag.click()
    URL.revokeObjectURL(blob)
}

//导入文件
export function importFile(call,ErrorCall) {
    //win
    let file_handler = document.createElement('input')
    file_handler.type = "file"
    let reader = new FileReader()
    let _filename = ""

    reader.onload = function(){
        call({
            name:_filename,
            content:reader.result
        })
        reader = null
    }

    file_handler.addEventListener('change',(event)=>{
        if(file_handler.files.length > 0)
        {
            //判断文件类型
            let _file = file_handler.files[0]
            if(/msdownload|image/ig.test(_file.type))
            {
                if(ErrorCall instanceof Function)
                {
                    ErrorCall()
                }
                return ;
            }

            reader.readAsText(_file)
            _filename = _file.name
        }
        file_handler = null
    })
    file_handler.click()
}

//保存配置
export function SyncConfig(key,val)
{
    try{
        window.SetConfig(key,String(val))
    }catch(e){
        // console.error(e)
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
    try{
        window.GetConfig(key,call)
    }catch(err){
        if(errorCall instanceof Function)
        {
            errorCall()
        }
    }
}

//是否有ivChecker
export function hasIVChecker(){
    return window.hasOwnProperty('LaunchPlugin')
}

//打开一个地址
export function openurl(url){
    if(!(url instanceof String) && !/^http.*$/.test(url)){
        console.error('[mac api:openurl] the params must be url string')
    }
    try{
        window.NewWindow(url)
    }catch(e){
        console.error(e)
    }
}
