import { getDisance } from './ConverPoint'

/**gps值校验，转换 */
    
/**
 * 检测是不是合法gps
 * @param gpsObject {lat:FLOAT,lng:FLOAT}
*/
function check(gpsObject)
{
    if(!gpsObject.hasOwnProperty('lat') || !gpsObject.hasOwnProperty('lng'))
    {
        return false
    }
    gpsObject.lat = parseFloat(gpsObject.lat)

    gpsObject.lng = parseFloat(gpsObject.lng)
    if(isNaN(gpsObject.lat) || isNaN(gpsObject.lng))
    {
        return false
    }
    if(gpsObject.lat >= -90 && gpsObject.lat <= 90 && gpsObject.lat >= -180 && gpsObject.lng <= 180)
    {
        return gpsObject
    }
    return false
}
function short(gpsObject)
{
    let gps = check(gpsObject)
    if(!gps)
    {
        return false
    }
    return {
        lat:gps.lat.toFixed(6),
        lng:gps.lng.toFixed(6)
    }
}
function strTogps(str)
{
    str = str.replace(/\s/g,'')
    let _gpsArr = str.split(',')
    if(_gpsArr.length < 2)
    {
        return false
    }
    let _gps = {
        lat:_gpsArr[0],
        lng:_gpsArr[1]
    }
    return check(_gps)
}

function gpsToStr(gps)
{
    gps = check(gps)
    if(!gps)
    {
        return false
    }
    return gps.lat.toFixed(6)+","+gps.lng.toFixed(6)
}

//定位到这个点
function NativeSimulateLocationTo(gps){
    gps = check(gps)
    if(!gps)
    {
        return false
    }
    if(window.osType == 'mac'){
        try{
            external.SimulateLocationTo(gps.lat.toString(), gps.lng.toString());
        }catch(error){
        }
    }
    try{
        window.SimulateLocationTo(gps.lat.toString(), gps.lng.toString());
    }catch(error){}

}


//停止虚拟定位
function NativeStopSimulation(){
    if(window.osType == 'mac')
    {
        try{
            external.StopSimulation()
        }catch(error){}
    }
    try{
        window.StopSimulation()
    }catch(error){}
}

/**
 * 给定速度和gps路径，返回用指定速度移动一步后的gps路径
 * 用来模拟行走
 * @param speed int 速度值，极限是200,单位是m
 * @param roule Arr [{lat:xxxx,lng:xxxx}] 一组gps位置信息
 * @return roule Arr 运算后的gps位置列表，为空代表，已经到达目的地
 */
function GetNextStep(speed,roule){
    
    if(roule.length < 2)
    {
        roule.splice(0,1)
        return
    }

    //找出第一个点，和下一步的点
    let _cur = check(roule[0])
    let _im  = check(roule[1])
    if(!_cur || !_im)
    {
        return
    }
    console.log("cur:%o  im:%o",_cur,_im)
    //算出距离，小于速度的，直接返回从下一点开始的集合
    let _dis = getDisance(_cur.lat,_cur.lng,_im.lat,_im.lng)
    if(_dis < speed){
        roule.splice(0,1)
        return
    }else{
        //计算到下一步的点，返回集合
        let _step = Math.ceil(_dis/speed)
        let _step_lat = (_im.lat - _cur.lat)/_step
        let _step_lng = (_im.lng - _cur.lng)/_step
        roule[0].lat += _step_lat
        roule[0].lng += _step_lng
    }

}


/**
 * 
 */

export default {
    check,
    short,
    strTogps,
    gpsToStr,
    NativeSimulateLocationTo,
    NativeStopSimulation,
    GetNextStep,

}