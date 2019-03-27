/**
 * 按键对应code 
A   65  J   74  S   83  1   49
B   66  K   75  T   84  2   50
C   67  L   76  U   85  3   51
D   68  M   77  V   86  4   52
E   69  N   78  W   87  5   53
F   70  O   79  X   88  6   54
G   71  P   80  Y   89  7   55
H   72  Q   81  Z   90  8   56
I   73  R   82  0   48  9   57

0   96  8   104 F1  112 F7  118
1   97  9   105 F2  113 F8  119
2   98  *   106 F3  114 F9  120
3   99  +   107 F4  115 F10 121
4   100 Enter   108 F5  116 F11 122
5   101 -   109 F6  117 F12 123
6   102 .   110              
7   103 /   111 

BackSpace   8   Esc 27  Right Arrow 39  -_  189
Tab 9   Spacebar    32  Dw Arrow    40  .>  190
Clear   12  Page Up 33  Insert  45  /?  191
Enter   13  Page Down   34  Delete  46  `~  192
Shift   16  End 35  Num Lock    144 [{  219
Control 17  Home    36  ;:  186 /|  220
Alt 18  Left Arrow  37  =+  187 ]}  221
Cape Lock   20  Up Arrow    38  ,<  188 '"  222
 * 
*/

let events = []
let Keys = {
    ctrl:{
        status:false,
        code:17
    },
    alt:{
        status:false,
        code:18
    },
    s:{
        status:false,
        code:83
    },
    h:{
        status:false,
        code:72
    },
    n1:{
        status:false,
        code:49
    },
    n2:{
        status:false,
        code:50
    },
    n3:{
        status:false,
        code:51
    },
    esc:{
        status:false,
        code:27
    },
    o:{
        status:false,
        code:79
    },
    i:{
        status:false,
        code:73
    },
    g:{
        status:false,
        code:71
    },
    "k+":{
        status:false,
        code:107
    },
    "k-":{
        status:false,
        code:109
    },
    "n4":{
        status:false,
        code:52
    },
    "n5":{
        status:false,
        code:53
    },
    "n7":{
        status:false,
        code:55
    },
    "n8":{
        status:false,
        code:56
    },
    "n9":{
        status:false,
        code:57
    },
    "f":{
        status:false,
        code:70
    },
    "space":{
        status:false,
        code:32
    },
    "a":{
        status:false,
        code:65
    },
    "q":{
        status:false,
        code:81
    }
}
//侦听键盘事件，可以指定多个按键
export function addQuickKey(keys,call){
    events.push({
        key:keys,
        call:call
    })
}
//移除事件
export function removeQuickKey(_keys,call){
    events.map((val,index)=>{
        let _check = true
        let _key = val.key
        let _call = val.call
        if(_call != call)
        {
            _check = false
        }

        if(_keys.length != _key.length)
        {
            _check = false
        }else{
            _key.map((k,i)=>{
                if(k != _keys[i])
                {
                    _check = false
                }
            })
        }
        if(_check)
        {
            events.splice(index,1)
        }
    })
}

/**
 * 失去焦点后，将所有按键状态重置
 */
window.addEventListener('blur',(event)=>{
    for( let key in Keys){
        Keys[key].status = false
    }
})

window.document.addEventListener('keydown',(event)=>{
    for( let key in Keys){
        if(Keys[key].code == event.keyCode)
        {
            Keys[key].status = true
        }
    }

    events.map((eventHandler)=>{
        let _key = eventHandler.key
        let _call = eventHandler.call
        let _isCheck = true
        _key.map((_k)=>{
            if(!Keys[_k].status)
            {
                _isCheck = false
            }
        })
        if(_isCheck)
        {
            _call()
        }
    })
})

window.document.addEventListener('keyup',(event)=>{
    for( let key in Keys){
        if(Keys[key].code == event.keyCode)
        {
            Keys[key].status = false
        }
    }
})
