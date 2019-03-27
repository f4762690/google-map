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
    let _reg = /[-]{0,1}\d+\.\d+[,|\s]*[-]{0,1}\d+.\d+/
    let _gps_str = _reg.exec(str)
    if(!_gps_str){
      return false
    }
    _gps_str = _gps_str[0]
    let _gpsArr = _gps_str.split(/\s+,\s+|\s+,|\s+|,\s+|,/)
    if(_gpsArr.length < 2)
    {
      return false
    }
    let _gps;
    if(_gpsArr[0].toString().split(".")[1].length == 9&&_gpsArr[1].toString().split(".")[1].length == 9){
        _gps = decryptPoint(_gpsArr[0],_gpsArr[1],'object')
    }else{
         _gps = {
        lat:_gpsArr[0],
        lng:_gpsArr[1]
      }
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
function decryptPoint(lat,lng,type = 'object'){
  lat = lat+"";
  lng = lng+"";
  let latOffset = lat.substr(-3,3)/100;
  let lngOffset = lng.substr(-3,3)/100;
  lat = +lat;
  lng = +lng;
  let latDeg = lat * 180 / Math.PI;
  let lngDeg = lng * 180 / Math.PI;
  let latP = (latDeg - latOffset) * Math.PI / 180;
  let lngP = (lngDeg - lngOffset) * Math.PI / 180;
  if('object' == type){
    return {
      lat:latP.toFixed(6),
      lng:lngP.toFixed(6)
    }
  }else if('string' == type){
    return latP.toFixed(6)+","+lngP.toFixed(6)
  }else if('array' == type){
    return [
      latP.toFixed(6),
      lngP.toFixed(6)
    ]
  }
}

function secretPoint(lat,lng,type = 'object'){
  lat = +lat;
  lng = +lng;
  let latRandom = getRandom(); //获取一个三位随机数
  let lngRandom = getRandom();
  let latOffset = latRandom/100;
  let lngOffset = lngRandom/100;
  let latDeg = lat * 180 / Math.PI;
  let lngDeg = lng * 180 / Math.PI;
  let latPoint = (latDeg+latOffset) * Math.PI / 180;
  let lngPoint = (lngDeg+lngOffset) * Math.PI / 180;
  if('object' == type){
    return {
      lat:latPoint.toFixed(6)+""+latRandom,
      lng:lngPoint.toFixed(6)+""+lngRandom
    }
  }else if('string' == type){
    return latPoint.toFixed(6)+""+latRandom+","+lngPoint.toFixed(6)+""+lngRandom
  }
}

function getRandom(){
  let f1 = Math.floor(Math.random()*90)+10+"",
    f2 = Math.floor(Math.random()*9)+1+"";
  return f1+f2;
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
    decryptPoint,
    secretPoint
}
