import { getDisance } from './ConverPoint'

export const getAngle = function(px,py,mx,my){
    //获得中心和鼠标坐标连线，与y轴正半轴之间的夹角
    var x = Math.abs(px-mx);
    var y = Math.abs(py-my);
    var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
    var cos = y/z;
    var radina = Math.acos(cos);
    var angle = Math.floor(180/(Math.PI/radina));

    if(mx>px&&my>py){
        angle = 180 - angle;
    }

    if(mx==px&&my>py){
        angle = 180;
    }

    if(mx>px&&my==py){
        angle = 90;
    }

    if(mx<px&&my>py){
        angle = 180+angle;
    }

    if(mx<px&&my==py){
        angle = 270;
    }

    if(mx<px&&my<py){
        angle = 360 - angle;
    }
    return angle;
}

export const sortPoints = function(_points,curpoint)
{
    // console.log('........')
    // console.log(_points)
    let points = _points.concat()
    let _def = [curpoint.lng,curpoint.lat]
    let _new = []
    while(points.length > 0)
    {
        points.sort((a,b)=>{
            let __fd_a = getDisance(_def[1],_def[0],a[1],a[0])
            let __fd_b = getDisance(_def[1],_def[0],b[1],b[0])
            return __fd_a > __fd_b ? 1 : -1
        })
        _def=points[0]
        _new.push(points[0])
        points.splice(0,1)
    }
    return _new
}

export const sortPoints2 = function(points,curpoint){
    console.log('points:')
    console.log(points)
    let __d = 100
    let __d_a = []
    let __n = []
    while(points.length > 0)
    {
        let __fd = getDisance(curpoint.lat,curpoint.lng,points[0][1],points[0][0])
        console.log('fd:%s',__fd)
        __fd = Math.round(__fd/__d)
        if(__d_a[__fd] instanceof Array)
        {
            __d_a[__fd].push(points[0])
        }else{
            __d_a[__fd] = [points[0]]
        }
        points.splice(0,1)
    }

    console.log('dis sort:')
    console.log(__d_a)

    __d_a.map((item,index)=>{
        let _p_a = 0
        if(item instanceof Array)
        {
            item.sort((a,b)=>{
                let __a_angle = getAngle(a[0],a[1],curpoint.lng,curpoint.lat)
                let __b_angle = getAngle(b[0],b[1],curpoint.lng,curpoint.lat)
                return __a_angle > __b_angle ? -1 : 1
            })
            __n.push(...item)
        }
    })

    return __n
}