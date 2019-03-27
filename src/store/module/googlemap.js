/**
 * 记录地图各种数值
 */

export default {
    namespaced: true,

    state: {
        mapCenter:{
            lat:0,
            lng:0
        },

        curPosition:{
            lat:0,
            lng:0
        },

        impactPosition:{
            lat:0,
            lng:0
        },

        mapZoom:16
    },

    actions: {
        //更新地图中心点
        upStoreMapcenter: function({state,dispatch,commit,rootGetters }, latlng){
            state.mapCenter = latlng
        },

        //更新当前点
        upCurPosition: function({state,dispatch,commit,rootGetters }, latlng){
            state.curPosition = latlng
        },

        //更新目标点
        upImpactPosition: function({state,dispatch,commit,rootGetters }, latlng){
            state.impactPosition = latlng
        },

        //更新地图缩放
        upZoom: function({state},zoom){
            state.mapZoom = zoom
        }
    },

}