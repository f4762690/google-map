/**
 * 路由
 * 区分终端类型，区分地图类别
 */
import VueRouter from 'vue-router'
const pc_google = function(resolve) { require(['./pc/pc_google.vue'], resolve) }
const pc_mapbox = function(resolve) { require(['./pc/pc_mapbox.vue'], resolve) }
const mac_google = function(resolve) { require(['./mac/mac_google.vue'], resolve) }
const mac_mapbox = function(resolve) { require(['./mac/mac_mapbox.vue'], resolve) }
const ios_google = function(resolve) { require(['./ios/ios_google.vue'], resolve) }
const ios_mapbox = function(resolve) { require(['./ios/ios_mapbox.vue'], resolve) }
const android_google = function(resolve) { require(['./android/android_google.vue'], resolve) }
const android_mapbox = function(resolve) { require(['./android/android_mapbox.vue'], resolve) }
const update = function(resolve) { require(['./Update.vue'], resolve) }
const timeEnd = function(resolve) { require(['./TimeEnd.vue'], resolve) }

/**
 * getDefaultRoule
 * 根据终端和地图类型跳转路由
 */
const getDefaultRoule = function()
{
    let route = window.osType + "_" + window.mapType;
    // let route = '/ios_google';
    if(window.osType == 'pc')
    {
        /*pc win版本检测版本号*/
        try{
            setMsgCallback('GetClientVersion',(data)=>{
                data = eval('('+data+')')
                if(data.version < 4368)
                {
                    route = 'update'
                }
            })
            window.GetClientVersion()
        }catch(e){
        }
    }
    if(window.TrialTime <= 0)
    {
        route = 'timeEnd'
    }
    route = 'ios_google';  //安卓和ios公用这个.
    return route
}

let router = new VueRouter({
    routes: [
        {
            name: 'pc_google',
            path: '/pc_google',
            component: pc_google
        },
        {
            name: 'pc_mapbox',
            path: '/pc_mapbox',
            component: pc_mapbox
        },
        {
            name: 'mac_google',
            path: '/mac_google',
            component: mac_google
        },
        {
            name: 'mac_mapbox',
            path: '/mac_mapbox',
            component: mac_mapbox
        },
        {
            name: 'android_google',
            path: '/android_google',
            component: android_google
        },
        {
            name: 'android_mapbox',
            path: '/android_mapbox',
            component: android_mapbox
        },
        {
            name: 'ios_google',
            path: '/ios_google',
            component: ios_google
        },
        {
            name: 'ios_mapbox',
            path: '/ios_mapbox',
            component: ios_mapbox
        },

        //限免时间到
        {
            name: 'timeEnd',
            path: '/timeEnd',
            component: timeEnd
        },

        //更新提示
        {
            name: 'update',
            path: '/update',
            component: update
        },
    ]
})

//免费时长
router.beforeEach((to, from, next) => {
    let _routeName = getDefaultRoule()
    if(to.name != _routeName && to.name != 'timeEnd' && to.name != 'update'){
        next(_routeName)
    }else{
        next()
    }
})
export default router
