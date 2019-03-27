let cooltable = [
{"dis":0,"cool":0},
{"dis":1,"cool":1},
{"dis":2,"cool":1},
{"dis":3,"cool":2},
{"dis":4,"cool":2},
{"dis":10,"cool":8},
{"dis":12,"cool":9},
{"dis":15,"cool":11},
{"dis":20,"cool":13},
{"dis":25,"cool":15},
{"dis":30,"cool":18},
{"dis":40,"cool":22},
{"dis":45,"cool":23},
{"dis":60,"cool":25},
{"dis":80,"cool":27},
{"dis":100,"cool":30},
{"dis":125,"cool":33},
{"dis":140,"cool":34},
{"dis":150,"cool":36},
{"dis":180,"cool":39},
{"dis":200,"cool":42},
{"dis":250,"cool":46},
{"dis":300,"cool":50},
{"dis":350,"cool":53},
{"dis":400,"cool":56},
{"dis":500,"cool":64},
{"dis":600,"cool":72},
{"dis":750,"cool":82},
{"dis":800,"cool":86},
{"dis":900,"cool":93},
{"dis":950,"cool":97},
{"dis":1000,"cool":100},
{"dis":1150,"cool":111},
{"dis":1200,"cool":115},
{"dis":1250,"cool":118},
{"dis":1266,"cool":120},
]

const getCoolTime = function(distance){
    let __time = ""
    let __distance = distance/1000
    cooltable.map((item,index)=>{
        if( item.dis <= __distance ){
            __time = !!cooltable[index+1] ? cooltable[index+1].cool : 120
        }
    })
    return __time
    // __time = __time * 60
    // let _h = Math.abs(Math.floor(__time/3600))
    // let __m = Math.abs(Math.floor(__time%3600/60))
    // let __s = Math.abs(__time%3600%60)
    // return `${_h > 0 ? _h + ':' : '00:'}${__m <= 0 ? '00' : __m < 10 ? '0'+__m : __m}:${__s <= 0 ? '00' : __s < 10 ? '0'+__s : __s}`
}

export default getCoolTime
