import { Http } from 'vue-resource'
export default{
  namespaced:true,
  state:{
    ifFilter:false,
    bonusOptions:[],  //奖品选项，需要去重
    bonus:new Map(),
    tasksObj:{},
    fieldData:[],
    countries:[],
    checkedBonus:[],
    checkedCountries:[],
    checkAllBonus:true,
    checkAllCountry:true,
    page:1,
    topEnd:false,
    bottomEnd:false,
    topLoading:false,
    bottomLoading:false,
    lastUpdateTime:0,
    isLoading:true,
    callBack:null,
    md5:'',//用来判定是否是重复的数据
    displayOnMap:false,
    netWorkError:false,
    searchword:'',
    savedPets:[],
    savedCountries:[],
  },
  getters:{
    fieldFilterData:(state)=>{
      return state.fieldData.filter((item)=>{
        let _country = !!!state.savedCountries.length||state.savedCountries.indexOf(item.country)>-1?true:false,

            _pets = !!!state.savedPets.length||state.savedPets.indexOf(+item.pet_id)>-1?true:false,

            _searchText = state.searchword == ''?true:new RegExp(state.searchword,'ig').test(item.bonusName);

        return _country&&_pets&&_searchText
      })
    },
    checkAllBonus:state=>state.checkAllBonus,
    checkAllCountry:state=>state.checkAllCountry,
    savedPets:state=>state.savedPets,
    savedCountries:state=>state.savedCountries,
    ifFilter:state=>state.ifFilter,
    searchword:state=>state.searchword,
    bonus:state=>state.bonus,
    lastUpdateTime:state=>state.lastUpdateTime,
    bonusOptions:state=>state.bonusOptions,
    tasksObj:state=> state.tasksObj,
    page: state=> state.page,
    fieldData: state => state.fieldData,
    countries:state => state.countries,
    getCheckedCountries: state=> state.checkedCountries,
    getCheckedBonus:state=> state.checkedBonus,
    callBack:state=> state.callBack,
    netWorkError:state=> state.netWorkError,
  },
  mutations:{
    setFilterOptions(state){
      let countryList = [],
          petsId = new Set();

        state.countries.map((item)=>{
          if(item.checked) countryList.push(item.countryName)
        });

        state.bonusOptions.map((item)=>{
          if(item.checked) petsId.add(item.pet_id);
        });

      let countryOption = countryList,
          petOption = [...petsId],
          optionStr = JSON.stringify({countryOption,petOption});
      window.SyncConfig('fieldSaveOptions',optionStr);  //保存每次的选择

        state.savedCountries = countryList;

        state.savedPets = [...petsId];
    },

    setAllBonus(state,bool){
      state.checkAllBonus = bool;
    },
    setAllCountry(state,bool){
      state.checkAllCountry = bool;
    },
    setSavedPets(state,data){
      state.savedPets = data;
    },
    setSavedCountries(state,data){
      state.savedCountries = data;
    },
    setFilter(state,bool){
      state.ifFilter = bool;
    },
    setSearchword(state,data){
      state.searchword = data;
    },

    isAllChecked(state,param){
      switch (param.option) {
        case 'bonus':
          state.checkAllBonus = param.check;
          break;
        case 'country':
          state.checkAllCountry = param.check;
          break;
      }
    },

    setDisplay(state, bool){
      state.displayOnMap = bool;
      window.SyncConfig('fieldMap',bool)
    },
    setCallBack(state,call){
      state.callBack = call;
    },

    addPage(state){
      state.page++;
    },

    setTaskName(state){
      Http.get('//assets.thinkskysoft.com/vlocapi/data/quest.json').then((res)=>{
        for(let key in res['body']){
          let taskName = '';
          taskName = res['body'][key][this.getters.titleLang]? res['body'][key][this.getters.titleLang]:res['body'][key]['en_title'];
          state.tasksObj[key] = {
            name:taskName
          }
        }
      })
    },

    setCheckAllBonus(state,bool){
      state.checkAllBonus = bool;
      state.bonusOptions.map((item)=>{
        item.checked = bool;
      })
    },

    setAllCountries(state,bool){
      state.checkAllCountry = bool;
      state.countries.map((item)=>{
        item.checked = bool;
      })
    },

    setLoading(state,bool){
      state.isLoading = bool;
    },

    setTopLoading(state,bool){
      state.topLoading = bool
    },
    setBottomLoading(state,bool){
      state.bottomLoading = bool;
    },
  },
  actions:{
    getOptions({state,rootState,rootGetters}){
      Http.get('//vlocapi.thinkskysoft.com/api/v1/pokestop/bonus').then((res)=>{
        let bOptions = new Map();
        res.data.data.map(item=>{
          if(rootState.titlesName[item.id]){
            let name = rootState.titlesName[item.id][rootGetters.titleLang]||rootState.titlesName[item.id]["en_title"];
            let ifChecked = false;
            if(state.savedPets.indexOf(item.id)>-1) ifChecked = true;
            bOptions.set(item.id,{
              "pet_id":item.id,
              "name":name,
              "checked":ifChecked
            })
          }
        })
        state.bonusOptions = [...bOptions.values()];

        state.checkAllBonus = state.bonusOptions.every(item=>item.checked === true)

      }).catch(e=>{
        console.log(e);
      })

      Http.get('//vlocapi.thinkskysoft.com/api/v1/pokestop/country',{params:{
          genre:'pokestop'
        }}).then(res => {
        let countries = new Map();
        if(!!res.data){
          res.data.data.map(item=>{
            let ifChecked = false;
            if(state.savedCountries.indexOf(item)>-1) ifChecked = true;
            countries.set(item,{
              "countryName":item,
              "checked":ifChecked
            })
          });
          state.countries = [...countries.values()]
          state.checkAllCountry = state.countries.every(item=>item.checked === true)
        }
      }).catch(err=>{
        console.log(err)
      })
    },

    async setFieldData({state,rootState,rootGetters},type = 'new'){
      switch (type) {
        case 'new':
          break;
        case 'more':
          state.bottomLoading = true;
          break;
      }

      await Http.get('http://vlocapi.thinkskysoft.com/api/v1/pokestop/field',{params:{
          'page': type == 'new'?1:state.page,
          'limit':100,
        },_timeout:30000,//设置超时时间
      }).then((res)=>{
        if(res['body']['status']&&res['body']['md5'] != state.md5){
          state.lastUpdateTime = new Date();

          res['body']['data'].forEach((item)=>{
            let bIdNum = parseInt(item.pet_id),
                tId = parseInt(item.num2);

            item['bonusName'] = rootState.titlesName[bIdNum]?
                                rootState.titlesName[bIdNum][rootGetters.titleLang]?
                                rootState.titlesName[bIdNum][rootGetters.titleLang]:rootState.titlesName[bIdNum]["en_title"]
                                :'?';

            item['taskName'] = state.tasksObj[tId]?state.tasksObj[tId]['name']?state.tasksObj[tId]['name']:'?':'?';
          });
          let newResult = new Map();

          let result = {
            'new':[...res['body']['data'],...state.fieldData],
            'more':[...state.fieldData,...res['body']['data']],
          };

          result[type].forEach((item)=>{
            newResult.set(item._id,item);
          });

          state.fieldData = [...newResult.values()];
        }else{
          if(type == 'more') state.bottomEnd = true;
          setTimeout(()=>{
            state.bottomEnd = false;
          },2000)
        }
        state.isLoading = false;
        state.bottomLoading = false;
        state.md5 = res['body']['md5'];
        state.netWorkError = false;
      }).catch(e => {
        console.log(e);
        state.isLoading = false;
        state.netWorkError = true;
      });
      state.callBack();
    },
  }
}
