import {Http} from 'vue-resource'
export default {
  namespaced:true,
  state:{
    avengerNews:true, //是否在地图上显示
    hasBlackName:false, //机器人是否发现
    blackList:[],
  },

  getters:{
    avengerNews: state=>state.avengerNews,
    hasBlackName: state=>state.hasBlackName,
    blackList:state=>state.blackList,
  },

  mutations:{
    avengerNews(state, bool){
      state.avengerNews = bool;
    },
    setHasBlackName(state,bool){
      state.hasBlackName = bool;
    },
    setBlackList(state,data){
      state.blackList = data;
    }
  },

  actions:{
    setBlackNameList({state,rootGetters,commit}){
      Http.get('https://vlocapitest.thinkskysoft.com/api/v1/blacklist/index',{params:{
          token:rootGetters.userToken
        }}).then((res)=>{
          state.blackList = res.data.data;
          commit('setHasBlackName',!!state.blackList.length)
      }).catch(e=>{
          console.log(e);
      })
    }

  }
}
