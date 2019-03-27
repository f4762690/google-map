import { Http } from 'vue-resource'
import GPS from '../../lib/Gps'

export default {
    namespaced: true,

    state: {
        pokestops:{},
        distance:1000,
    },

    actions: {
        refresh: function({state,rootState}){
            //需求显示的图标
            let genre = []
            if(rootState.sniper.displayOnMap){
                genre.push('iv100')
            }
            if(rootState.nests.displayOnMap){
                genre.push('nest')
            }
            if(rootState.raid.displayOnMap){
                genre.push('gym')
            }
            if(rootState.field.displayOnMap){
                genre.push('pokestop')
            }
            if(rootState.wild.displayOnMap){
              genre.push('wild')
            }

            //如果道场开关打开了。就可以去获取数据了。
            if(rootState.gym.displayOnMap){
              genre.push('gyminfo')
            }

            if(genre.length > 0){
                Http.get('//vlocapi.thinkskysoft.com/api/v1/pokestop/near',{
                    params:{
                        lat:rootState.googlemap.mapCenter.lat,
                        lng:rootState.googlemap.mapCenter.lng,
                        distance:state.distance,
                        genre:genre.join(',')
                    }
                }).then(res => {
                    if(!!res['body']['data']){
                      state.pokestops = {}
                        res['body']['data'].map(item => {
                            state.pokestops[item._id] = item
                        })
                    }

                }).catch(err => console.log(err))
            }else{
              state.pokestops = {}
            }
        }
    }
}
