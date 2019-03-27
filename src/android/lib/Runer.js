import { getDisance } from '../lib/ConverPoint'

/**
 * 模拟行走
 * 给定一组gps坐标点，根据速度，返回的下一个点位置
 */
let points
let runers
let totalDis = 0
let curDis = 0

//初始化
const init = function(arr){
    if(!(arr instanceof Array))
    {
        console.error('points must be array')
    }
    points = arr.concat()
    runers = points.concat()

    //算出总距离
    arr.map((item,index)=>{
        if(index < arr.length-1){
            totalDis += getDisance(arr[index].lat,arr[index].lng,arr[index+1].lat,arr[index+1].lng)
        }
    })
}

//递进
const getNextPoint = function(speed){
    let _point = {}
    if(runers.length <= 0)
    {
        return false
    }
    if(runers.length == 1)
    {
        _point.lat = runers[0].lat
        _point.lng = runers[0].lng
        runers.splice(0,1)

        //完成
        curDis = totalDis
        return _point
    }
    let _dis = getDisance(runers[0].lat,runers[0].lng,runers[1].lat,runers[1].lng)
    if(_dis < speed){
        _point.lat = runers[1].lat
        _point.lng = runers[1].lng

        //进度加上距离
        curDis += _dis
        runers.splice(0,1)
    }else{
        //计算到下一步的点，返回集合
        let _step = _dis/speed
        let _step_lat = (runers[1].lat - runers[0].lat)/_step
        let _step_lng = (runers[1].lng - runers[0].lng)/_step

        //进度加上速度值
        curDis += speed
        _point.lat = runers[0].lat + _step_lat
        _point.lng = runers[0].lng + _step_lng
        runers[0] = _point
    }
    return _point
}

/**
 * 重置路径
 * @param reverse 是否旋转
 */
const resetPoint = function(reverse){
    if(reverse == true)
    {
        points.reverse()
    }
    curDis = 0
    runers = points.concat()
}

/**
 * 获取原始点
 */
const getPoints = function(){
    return points
}

/**
 * 获取进度
 */
const getProgress = function(){
    let __progress =  curDis / totalDis
    return __progress > 1 ? 1 : __progress
}

/**
 * 获取总用时
 */
const getTime = function(speed){
    return (totalDis-curDis)/speed
}

export default {
    init,
    getNextPoint,
    resetPoint,
    getPoints,
    getProgress,
    getTime
}
