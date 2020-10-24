/**
 * 路由
 * 区分终端类型，区分地图类别
 */
import VueRouter from 'vue-router'
const ios_google = function(resolve) { require(['./ios/ios_google.vue'], resolve) }
const ios_mapbox = function(resolve) { require(['./ios/ios_mapbox.vue'], resolve) }
const update = function(resolve) { require(['./Update.vue'], resolve) }
const timeEnd = function(resolve) { require(['./TimeEnd.vue'], resolve) }

/**
 * getDefaultRoule
 * 根据终端和地图类型跳转路由
 */
const getDefaultRoule = function()
{
    let route = window.osType + "_" + window.mapType;
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
