import  GPS  from '../../lib/Gps'
import {Http} from 'vue-resource'
import { sendNoti } from '../../ios/lib/api'

import Vue from 'vue'
export default{
  namespaced:true,
  state:{
    allPets:false,
    petNamesList:[],
    pets:[],
    lastTime:0,
    hasNew:true,
    openLV:false,
    is_shiny:false,
    notify:true,  //是否开启30秒的通知
    lastUpdateTime:0,   //距离上次更新的时间
    isloading:true,
    refreshDataTimeoutID:null,
    displayOnMap:false, //是否在地图上显示
    ifFilter:false,
    sniperDataList:[],
    clickPoint:[],  //缓存历史点击过的点
    ifFirstTime:true,
    netWorkError:false,
    savedPets:[],
    callBack:null,
    chosePets:[],
  },

  getters:{
    chosePets:state=>state.chosePets,
    callBack:state=>state.callBack,
    allPets:state =>state.allPets,
    savedPets:state=>state.savedPets,
    netWorkError:state=>state.netWorkError,
    ifFirstTime:state=>state.ifFirstTime,
    clickPoint:state=>state.clickPoint,
    sniperDataList:state=> state.sniperDataList,
    openLV : state=> state.openLV,
    is_shiny : state=> state.is_shiny,
    ifFilter : state=> state.ifFilter,
    petNamesList : state=> state.petNamesList,
    hasNew : state=> state.hasNew,
    getPets : state=> state.pets,

    filterPets:(state)=>{
      if(state.pets.length <= 0){
        return [];
      }else{
        return  state.pets.filter((item)=>{
          let _color = state.is_shiny?state.is_shiny==1?true:false:true;  //判断是否开启异色判定,开启就需要判定子选项是否异色，否则关掉
          let _lv = state.openLV?item.lv >= 35 ? true : false:true;
          let _petsName = !state.chosePets.length||state.chosePets.indexOf(item.pet_id+"")>-1;
          return _color&&_lv&&_petsName;
        })
      }
    }
  },

  mutations:{
    setChosePets(state,data){
      state.chosePets = data;
    },
    setCallBack(state,callBack){
      state.callBack = callBack;
    },
    setAllPets(state,bool){
      state.allPets = bool;
    },
    setSavedPets(state,data){
      state.savedPets = data;
    },
    setClickPoint(state,data){
      state.clickPoint = data;
      window.SyncConfig('sniperClickPoint',JSON.stringify(state.clickPoint))
    },
    setSniperDataList(state,data){
      state.sniperDataList = data;
    },
    setLV(state,bool){
      state.openLV = bool;
      window.SyncConfig('sniperLV',bool)
    },
    setShiny(state,bool){
      state.is_shiny = bool;
      window.SyncConfig('sniperShiny',bool)
    },

    setFilter(state,bool){
      state.ifFilter = bool;
    },
    setPetNamesList(state,data){
      state.petNamesList = data;
    },

    setDisplay(state, bool){
      state.displayOnMap = bool;
      window.SyncConfig('sniperMap',bool)
    },

    /**
     * 1秒刷新一次数据，剔除掉更新大于30分钟的数据
     */
    refreshData(state){
      if(state.pets.length>20){
        let beforePet = [];
        beforePet = state.pets.splice(0,20); //截取前20位
        state.pets = state.pets.filter((item) => {
          let _t = Math.ceil(new Date().getTime()/1000)
          return _t - item.start_time < 1800
        })
        state.pets = beforePet.concat(state.pets);
      }
      //每1秒刷新一次时间
      state.refreshDataTimeoutID = setTimeout(()=>{
         this.commit('sniper/refreshData')
      },3000)
    },

    setLoading(state,bool){
      state.isloading = bool;
    },

    setLastTime(state,data){
      state.lastTime = data;
    },
    setLastUpdateTime(state,data){
      state.lastUpdateTime = data;
    },

    setNotify(state,bool){
      state.notify = bool;
      window.SyncConfig('ifNotify',bool)
    },

    setHasNew(state,bool){
      state.hasNew = bool;
    },

    getCountries(state,data){
      data.forEach((item)=>{
        state.countries.push({'countryName':item,'checked':true});
      })
    },
  },

  actions:{
    async getData({state,rootGetters,commit}){
      await Http.get('http://vlocapi.thinkskysoft.com/api/v1/petiv/map',{ params:{
            token:rootGetters.userToken,
            start_time:state.lastTime
          },_timeout:30000,//设置超时时间
        }
      ).then((response) => {
        if(response.data.data.length>0&&response.data.start_time!=0&&response.data.start_time!= state.lastTime){
          if(state.notify){                                //打开了通知才可以设置,推送消息
            if(!state.ifFirstTime){
              sendNoti('The 100iv feeds have been updated. You can check whether included your favorite Pekemons.');
            }
          }
          state.lastUpdateTime = new Date();
          state.lastTime = response.data.start_time
          let result = new Map(),
              json = {};
          response.data.data.map((item)=>{   //去重和解密处理
            item['ifClick'] = state.clickPoint.indexOf(item._id)>-1?true:false;
            if(!json[item['msg_id']]){
              //如果是加密的就解密
              if(/\.\d{9}$/.test(item.lat) && /\.\d{9}$/.test(item.lng)){
                let pointData = GPS.decryptPoint(item.lat,item.lng,'object');
                item.lat = pointData.lat;
                item.lng = pointData.lng;
              }
              json[item['msg_id']] = 1;
            }
          });

          [...response.data.data,...state.pets].forEach((item)=>{
            result.set(item._id,item);
          });

          state.pets = [...result.values()];

          commit('refreshData');
          state.hasNew = true;
          setTimeout(()=>{
            state.hasNew = false;
          },15000);
          if(state.ifFirstTime){  //第一次需要关掉
            state.ifFirstTime = false;
          }
        }
        state.netWorkError = false;
        state.isloading = false;
      }).catch( e =>{
        state.netWorkError = true;
        state.isloading = false;
      });
      if(rootGetters.openRadar) state.hasNew = false;
      state.callBack();
    },
    async getPetsName({state,rootGetters}){
      Http.get('//assets.thinkskysoft.com/vlocapi/data/pogo.json?v='+rootGetters.version).then((response)=>{
        if(response['body']){
          let result = [];
          for(let k in response['body']){
            let ifChecked = false;
            if(state.savedPets.indexOf(k)>-1) ifChecked = true;
            result.push({
              name:response['body'][k][rootGetters.titleLang]||response['body'][k][rootGetters.titleLang]['en_title']||'?',
              checked:ifChecked,
              pet_id:k
            });
          }
          state.allPets = result.every(item=> item.checked === true);
          state.petNamesList = result;
        }
      }).catch(e => {console.log(e)});
    },
  }
}
