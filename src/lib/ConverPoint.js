/**
 * 给出n个gps定位，模拟出行走的点列表
 */

function toRad(d) {  return d * Math.PI / 180; }

export function getDisance(lat1, lng1, lat2, lng2) {
    var dis = 0;
    var radLat1 = toRad(lat1);
    var radLat2 = toRad(lat2);
    var deltaLat = radLat1 - radLat2;
    var deltaLng = toRad(lng1) - toRad(lng2);
    var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    return dis * 6378137;
}

/*将点与点转换成gps list*/
export function converPositionToList(positions)
{
    positions = positions.map((item)=>{
        return {
            lat:parseFloat(item.lat),
            lng:parseFloat(item.lng)
        }
    })
    //存储节点
    let i=1,max=positions.length;
    let __point_list = [];

    //重置用时和距离
    let run_total_distance = 0;
    let run_total_time     = 0;
    let line_distance      = getDisance(positions[0].lat,positions[0].lng,positions[positions.length - 1].lat,positions[positions.length - 1].lng);

    /*
    当前线段速度1.4米每秒
    如果需要细粒度的行走效果，可以调小此值(慎重)
    */
    let __wakeSpeed = 1.4;

    /*遍历所有线段*/
    for(;i<max;i++)
    {
        //开始位置
        let __start_latlng   = positions[i-1];
        //结束位置
        let __end_latlng     = positions[i];
        
        //计算距离
        let __total_distance = getDisance(__start_latlng.lat,__start_latlng.lng,__end_latlng.lat,__end_latlng.lng);
        //计算用时
        let __total_time     = __total_distance/__wakeSpeed;
        //步长总用时
        let __step_time      = Math.round(__total_time);
        //lat步长
        let __step_lat       = (__end_latlng.lat - __start_latlng.lat)/__step_time;
        //lng步长
        let __step_lng       = (__end_latlng.lng - __start_latlng.lng)/__step_time;
        let __cur_lat        = __start_latlng.lat;
        let __cur_lng        = __start_latlng.lng;
        let j=1;

        run_total_time     += __total_time;
        run_total_distance += __total_distance;

        for(;j<=__step_time;j++)
        {
            if(j<__step_time)
            {
                __point_list.push({
                    lat:__cur_lat,
                    lng:__cur_lng
                });
            }

            if(j==__step_time)
            {
                __point_list.push({
                    lat:__end_latlng.lat,
                    lng:__end_latlng.lng
                });
                continue;
            }
            __cur_lat += __step_lat;
            __cur_lng += __step_lng;
        }
    }

    
    return {
        //直线距离
        line_distance:line_distance,
        //用时
        time:run_total_time,
        //全长
        distance:run_total_distance,
        //按1.4米间隔生成的路径
        points:unique(__point_list),
        //原始路径
        crude:positions
    }
}


function unique(arr) {
    let newArr
    newArr = arr.filter((item,index,o)=>{
		if(index>0 && o[index-1].hasOwnProperty('lat') && item.lat == o[index-1].lat && item.lng == o[index-1].lng){
			return false;
		}else{
			return true;
		}

	})
    return newArr
}
