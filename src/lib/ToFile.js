let isSafari = navigator.userAgent.indexOf("AppleWebKit") > -1 && navigator.userAgent.indexOf("Chrome") < 1;
//导出文件
export function exportFile(result,filename) {
    if(isSafari)
    {
        try{
            external.SaveGPX(result,filename)
        }catch(err){
        }
    }else{
        let aTag = document.createElement('a')
        let blob = new Blob([result])
        aTag.download = filename
        aTag.href = URL.createObjectURL(blob)
        aTag.click()
        URL.revokeObjectURL(blob)
    }
}

//导入文件
export function importFile(call,ErrorCall) {

    //mac
    if(isSafari)
    {
        try{
            let _result = external.importFile()
            _result = JSON.parse(_result)
            call(_result)
        }catch(error){}
    }else{
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
}


//保存配置
export function SyncConfig(key,val)
{
    try{
        if(isSafari)
        {
            external.SetConfig(key,String(val))
        }else{
            if(window.SetConfig)
            {
                window.SetConfig(key,String(val))
            }
        }
    }catch(e){}
}

let MacInitCalls = []
//获取配置
export function ConfigGet(key,call,errorCall)
{
    if(typeof(call) != typeof(function(){}))
    {
        console.error('GetConfig 2 params error,must be function')
        return ;
    }
    //如果是mac版
    if(isSafari)
    {
        try {
            call(window.external.GetConfig(key))
        }catch(error){
            if(!window.hasOwnProperty('external'))
            {
                if(undefined != errorCall)
                {
                    errorCall()
                }
            }
            MacInitCalls.push({
                key:key,
                call:call
            })
        }
    }

    //如果是win版
    if(!isSafari)
    {
        try{
            window.GetConfig(key,call)
        }catch(err){
            if(errorCall != undefined)
            {
                errorCall()
            }
        }
    }
}
window.safariGetConfig = ()=>{
    MacInitCalls.map((handler)=>{
        try{
            handler.call(window.external.GetConfig(handler.key))
        }catch(error){
            console.log(error)
        }
    })
}