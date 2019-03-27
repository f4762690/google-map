import { Http } from 'vue-resource'
import rootScope from '../store'
export default {
  namespaced:true,
  state:{
    ifFilter:false,
    displayOnMap:false, //是否在地图上显示
    gymData:[],
    isLoading:true,
    lastUpadate:0,
    countries:[],
    cities:[],
    //---阵营  3-黄色 instinct   1--蓝色Valor  2--红色Mystic   0---灰色阵营
    allCity:true,
    allCountry:true,
    allCamp:true,
    allRemain:true,
    page:1,
    callBack:null,
    md5:'',
    gymName:'',
    netWorkError:false,
    lastUpdated:0,
    camps:[],
    remains:[],
    bottomLoading:false,
    savedCountry:[],
    savedTeam:[],
    savedVacancy:[],
  },
  getters:{
    gymFilterData:(state)=>{
      return state.gymData.filter((item)=>{
        let _country = state.savedCountry.indexOf(item.country)>-1||!!!state.savedCountry.length?true:false,
            _team = state.savedTeam.indexOf(item.team)>-1||!!!state.savedTeam.length?true:false,
            _vacancy = state.savedVacancy.indexOf(item.capacity)>-1||!!!state.savedVacancy.length?true:false,
            _name = !!!state.gymName||new RegExp(state.gymName,'ig').test(item.name)?true:false;
        return _country&&_team&&_vacancy&&_name;
      })
    },
    savedCountry:state => state.savedCountry,
    savedTeam:state => state.savedTeam,
    savedVacancy:state => state.savedVacancy,
    ifFilter:state => state.ifFilter,
    lastUpdated:state => state.lastUpdated,
    netWorkError:state => state.netWorkError,
    gymName:state => state.gymName,
    bottomLoading:state => state.bottomLoading,
    displayOnMap:state => state.displayOnMap,
    gymData:state => state.gymData,
    isLoading:state => state.isLoading,
    remains:state => state.remains,
    camps:state => state.camps,
    countries:state => state.countries,
    allCountry:state => state.allCountry,
    allCamp:state => state.allCamp,
    allRemain:state => state.allRemain,
    cities:state => state.cities,
    allCity:state => state.allCity,
    page:state => state.page,
    callBack:state => state.callBack,
  },
  actions:{
    async getData({state,rootState},type = 'new'){ //获取数据
      switch (type) {
        case 'new':
        break;
        case 'more':
          state.bottomLoading = true;
          break;
      }
      await Http.get('https://vlocapi.thinkskysoft.com/api/v1/gym/index',{params:{limit:100}
      }).then((res)=>{
        if(res['body']['status']&&state.md5!= res['body']['md5']){
          state.md5 = res['body']['md5'];
          state.lastUpdated = Date.now();
          //更新数据还是，加载更多的数据
          res['body']['data'].forEach((item)=>{
            item.details.length = 6;
            for(let i =0;i<item.details.length;i++){
              if(!item.details[i]){
                item.details[i] = {
                  imgIcon: './static/images/stops/unfind.png',
                  pokemon_cp:0,
                  max_cp:0,
                }
              }else{
                item.details[i] = {
                  imgIcon:item.details[i].hasOwnProperty('pokemon_id')?rootState.nestImgPrefix + parseInt(item.details[i]['pokemon_id']) + '.png':'./static/images/stops/unfind.png',
                  pokemon_cp: item.details[i].pokemon_cp,
                  max_cp: item.details[i].max_cp,
                }
              }
            }
          });
          let newResult = new Map();
          let resultData = {
            'new':[...res['body']['data'],...state.gymData],
            'more':[...state.gymData,...res['body']['data']],
          };
          resultData[type].forEach((item)=>{
            newResult.set(item._id,item);
          })
          state.gymData = [...newResult.values()];
        }
        state.netWorkError = false;
        state.isLoading = false;
      }).catch((e)=>{
        state.isLoading = false;
        state.netWorkError = true;
      })
      state.callBack();
    },

    async getCities({state}){
      Http.get('https://vlocapi.thinkskysoft.com/api/v1/gym/city').then((res)=>{
        if(res['body']['status']){
          res['body']['data'].map((item)=>{
            state.cities.push({
              name:item,
              checked:true,
            })
          })
        }
      }).catch((e)=>{
      })
    },


    getCountries({state}){
       Http.get('https://vlocapi.thinkskysoft.com/api/v1/gym/country').then((res)=>{
        if(res['body']['status']){
          res['body']['data'].forEach((item)=>{
                let ifChecked = false;
                if(state.savedCountry.indexOf(item)>-1) ifChecked = true;
                state.countries.push({
                  name:item,
                  checked:ifChecked,
                })
          });

          state.allCountry = state.countries.every(item=>item.checked === true);
        }
      }).catch((e)=>{
      })
    }
  },
  mutations:{
    setFilterOptions(state){
      let country = [],
        team = [],
        capacity = [];
        state.countries.map((item)=>{
          if(item.checked) country.push(item.name);
        });

      state.camps.map((item)=>{         //阵营
        if(item.checked) team.push(item.value)
      });

      state.remains.map((item)=>{      //剩余空位
        if(item.checked) capacity.push(item.value)
      });
      state.savedCountry = country,
      state.savedTeam = team,
      state.savedVacancy =capacity;

      let countryOption = [...new Set(country)],
          teamOption = [...new Set(team)],
          capacityOption = [...new Set(capacity)],
          optionStr = JSON.stringify({countryOption,teamOption,capacityOption});
      window.SyncConfig('gymSaveOptions',optionStr)  //保存每次的选择
    },


    setAllCountry(state,bool){
      state.allCountry = bool;
    },

    setAllRemain(state,bool){
      state.allRemain = bool;
    },

    setAllCamp(state,bool){
      state.allCamp = bool;
    },

    setRemains(state,data){
      state.remains = data;
    },

    setSavedCountry(state,data){
      state.savedCountry = data;
    },
    setSavedTeam(state,data){
      state.savedTeam = data;
    },
    setSavedVacancy(state,data){
      state.savedVacancy = data;
    },
    setCamps(state,data){
      state.camps = data;
    },
    setFilter(state,bool){
      state.ifFilter = bool;
    },
    isAllChecked(state,param){
      switch (param.option) {
        case 'country':
          state.allCountry = param.check;
          break;
        case 'remain':
          state.allRemain = param.check;
          break;
        case 'camp':
          state.allCamp = param.check;
          break;
      }
    },

    setCallBack(state,callBack){
      state.callBack = callBack;
    },
    setGymName(state,name){
      state.gymName = name;
    },
    setBottomLoading(state,bool){
      state.bottomLoading = bool;
    },
    addPage(state){
      state.page++;
    },
    changeCityStatus(state,bool){
      state.allCity = bool;
      state.cities.forEach((item)=>{
        item.checked = bool;
      })
    },

    changeCountryStatus(state,bool){
      state.allCountry = bool;
      state.countries.forEach((item)=>{
        item.checked = bool;
      })
    },
    changeCampStatus(state,bool){
      state.allCamp = bool;
      state.camps.forEach((item)=>{
        item.checked = bool;
      })
    },
    changeRemainStatus(state,bool){
      state.allRemain = bool;
      state.remains.forEach((item)=>{
        item.checked = bool;
      })
    },

    setDisplay(state, bool){
      state.displayOnMap = bool
      window.SyncConfig('gymMap',bool)
    },

    setLoading(state,bool){
      state.isLoading = bool;
    }
  }
}
