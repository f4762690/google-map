/**
 * 返回所有宠物名称及图片，所有语言
 */
import { Http } from 'vue-resource'

export default {
    namespaced: true,

    state: {
        pokemongos:{},
        task_list:[],
        reward_list:[],
        petiv_list:{}
    },

    getters: {
        pokemongos_list:function(state){
            return state.pokemongos
        },

        reward_list:function(state){
            let __obj = {}
            state.reward_list.map(item=>{
                __obj[item.id] = item
            })
            return __obj
        },

        task_list: function(state){
            return state.task_list
        }
    },

    actions: {
        getPokemongo: function({state,rootGetters,rootState}) {  
            
            //宠物
            Http.get('//assets.thinkskysoft.com/vlocapi/data/item.json?v='+rootState.version).then((res)=>{
                let _lang = /it|ru|pt|es|cn/i.test(rootGetters.lang) ? 'en' : rootGetters.lang
                if(!!res.data){
                    for(let i in res.data){
                        state.pokemongos[i] = res.data[i]
                        state.pokemongos[i].title = res.data[i][_lang+'_title']
                    }
                }
            }).catch(err => console.log(err))

            //petiv
            Http.get('./static/data/pets_name.json?v='+rootState.version).then((res)=>{
                let _lang = /it|ru|pt|es|cn/i.test(rootGetters.lang) ? 'en' : rootGetters.lang
                if(!!res.data){
                    for(let i in res.data){
                        state.petiv_list[i] = res.data[i]
                        state.petiv_list[i].title = res.data[i][_lang+'_title']
                    }
                }
            }).catch(err => console.log(err))

            //任务
            Http.get('//assets.thinkskysoft.com/vlocapi/data/quest.json?v='+rootState.version).then(res => {
                let _lang = /it|ru|pt|es|cn/i.test(rootGetters.lang) ? 'en' : rootGetters.lang
                if(!!res.data){
                    for(let i in res.data){
                        state.task_list[i] = res.data[i]
                        state.task_list[i].name = res.data[i][_lang+'_title']
                    }
                }
            }).catch(err => console.log(err))


        }
    },

}
