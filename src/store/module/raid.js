import { Http } from 'vue-resource'
export default{
  namespaced:true,
  state:{
    ifFilter:false,
    callBack:null,
    raidOptions:[],
    raidAll:true,
    raidLevel:[],
    allLevel:false,
    countryList:[],
    allCountry:true,
    raidData:[],
    page:1,
    searchText:'',
    showMap:false, //是否在地图上显示
    upLoading:false,
    bottomLoading:false,
    lastUpdateTime:0,
    isLoading:true,
    bottomEnd:false,
    addCheckedRaids:[],
    md5:'',
    displayOnMap:false,
    autoTimeoutID:null,
    netWorkError:false,
    savedRaid:[],
    savedLevel:[],
    savedCountry:[],
    raidFilterData:[],
  },
  getters: {

    raidFilterData:(state)=>{
      return state.raidData.filter((item)=>{
        let _hasRaid = state.savedRaid.indexOf(+item.pet_id)>-1||!!!state.savedRaid.length?true:false,

            _hasCountry = state.savedCountry.indexOf(item.country)>-1||!!!state.savedCountry.length?true:false,

            _hasLevel = false,

            _searchText = state.searchText == ''?true:new RegExp(state.searchText,'ig').test(item.raidName);

        if(!!!state.savedLevel.length){
            _hasLevel = true
        }else{
            if(state.savedLevel.indexOf('ex')>-1){
              _hasLevel = item.is_vip == 1||item.is_vip == 2||state.savedLevel.indexOf(item.num1)>-1?true:false
            }else{
              _hasLevel = state.savedLevel.indexOf(item.num1)>-1?true:false
            }
        }

        return _hasRaid&&_hasLevel&&_hasCountry&&_searchText
      })
    },
    savedRaid:state=>state.savedRaid,
    savedLevel:state=>state.savedLevel,
    savedCountry:state=>state.savedCountry,
    ifFilter:state=>state.ifFilter,
    bottomLoading:state=>state.bottomLoading,
    bottomEnd:state=>state.bottomEnd,
    displayOnMap:state=>state.displayOnMap,
    raidLevel:state=>state.raidLevel,
    isLoading:state=>state.isLoading,
    callBack:state=>state.callBack,
    allCountry:state=>state.allCountry,
    raidAll:state=>state.raidAll,
    searchText:state=>state.searchText,
    raidOptions:state=>state.raidOptions,
    allLevel:state=>state.allLevel,
    lastUpdateTime: state => state.lastUpdateTime,
    showMap: state => state.showMap,
    page: state => state.page,
    raidData: state => state.raidData,
    countryList: state => state.countryList,
    netWorkError: state => state.netWorkError,
    },

    mutations: {
      setFilterOptions(state){  //设置过滤项
        let petsId = new Set(),
            levels = [],
            countryList = [];

        state.raidOptions.map((item)=>{
          if(item.checked) petsId.add(item.id);
        });

        state.raidLevel.map((item)=>{
          if(item.checked) levels.push(item.value);
        });

        state.countryList.map((item)=>{
          if(item.checked) countryList.push(item.countryName)
        });

        let checkedRaids = [...petsId],
            checkedLevels = levels,
            checkedCountries = countryList,
            optionStr = JSON.stringify({checkedRaids,checkedLevels,checkedCountries});
        window.SyncConfig('raidSaveOptions',optionStr);  //保存每次的选择

        state.savedRaid = [...petsId];

        state.savedLevel = levels;

        state.savedCountry = countryList;
      },

      setSavedRaid(state,data){
        state.savedRaid = data;
      },
      setSavedLevel(state,data){
        state.savedLevel = data;
      },
      setSavedCountry(state,data){
        state.savedCountry = data;
      },

      setFilter(state,bool){
        state.ifFilter = bool;
      },
      isAllChecked(state,param){
        switch (param.option) {
          case 'raidName':
            state.raidAll = param.check;
            break;
          case 'level':
            state.allLevel = param.check;
            break;
          case 'country':
            state.allCountry = param.check;
            break;
        }
      },

      setCallBack(state,callBack){
        state.callBack = callBack;
      },

      raidAllChange(state,bool){
        state.raidAll = bool;
        state.raidOptions.map((item)=>{
          item.checked = bool;
        })
      },

      setRaidAll(state,bool){
        state.raidAll = bool;
      },

      setAllLevel(state,bool){
        state.allLevel = bool;
      },

      setAllCountry(state,bool){
        state.allCountry = bool;
      },

      levelChange(state,bool){
        state.allLevel = bool;
        state.raidLevel.map((item) => {
          item['checked'] = bool;
        })
      },

      allCountryChange(state,bool){
        state.allCountry = bool;
        state.countryList.map((item) => {
          item['checked'] = bool;
        })
      },

      setSearchText(state,text){
        state.searchText = text;
      },

      setDisplay(state, bool){
        state.displayOnMap = bool
        window.SyncConfig('raidMap',bool)
      },

      setShowMap(state, bool) {
        state.showMap = bool;
      },

      setBottomLoading(state, bool) {
        state.bottomLoading = bool;
      },

      setLoading(state,bool){
        state.isLoading = bool;
      },

      addPage(state) {
        state.page++;
      },
  },
  actions:{
    async setRaidData({state,rootState,rootGetters},type = 'new') {
      switch (type) {
        case 'new':
          break;
        case 'more':
          state.bottomLoading = true;
          break;
      }
      await Http.get('https://vlocapi.thinkskysoft.com/api/v1/pokestop/raid',{
        params: {                                                         //过滤选项
          "page" : type == 'new'?1:state.page,
          'limit': 50,
        }
      }).then((res) => {
        if (res['body']['status']&&res['body']['md5'] != state.md5){
          state.lastUpdateTime = new Date();
          res['body']['data'].forEach(function (item){
            let id = parseInt(item.pet_id);
            item['raidName'] = `Raid(${item.num1})`;
            if(item.pet_id != 0 && rootState.titlesName[id]){
              item['raidName']  = rootState.titlesName[id][rootGetters.titleLang]
            }
          });

          let newResult = new Map();

          let result = {
            'new':[...res['body']['data'],...state.raidData],
            'more':[...state.raidData,...res['body']['data']],
          };

          result[type].forEach((item)=>{
            newResult.set(item._id,item);
          })

          state.raidData = [...newResult.values()];
        }else{
          if(type == 'more'){
            state.bottomEnd = true,
              setTimeout(()=>{
                state.bottomEnd = false
              },3000)
          }
        }
        state.isLoading = false;
        state.bottomLoading = false;
        state.md5 = res['body']['md5'];
        state.netWorkError = false;
      }).catch(e=>{
        state.isLoading = false;
        state.netWorkError = true;
      })
      state.callBack();  //加载滚动
    },

    async getOptions({state,rootState}) {  //获取选项
      let result  = await Http.get('https://vlocapi.thinkskysoft.com/api/v1/pokestop/pokemon?v='+rootState.version),
          raidIds =  result.data.data;

      raidIds.map((item)=>{
        let id = parseInt(item),
            nameValue = rootState.titlesName[id]?rootState.titlesName[id][this.getters.titleLang]:'Raid',
            ifChecked = state.savedRaid.indexOf(id)>-1?true:false;
            state.raidOptions.push({
              "id":id,
              "value":nameValue,
              "checked":ifChecked
            })
      });

      state.raidAll = state.raidOptions.every(item => item.checked === true)


      Http.get('//vlocapi.thinkskysoft.com/api/v1/pokestop/country').then(res => {
        if(!!res.data){
          res.data.data.map(item=>{
            let ifChecked = state.savedCountry.indexOf(item)>-1?true:false;
            state.countryList.push({
              checked: ifChecked,
              countryName:item
            });
          })

          state.allCountry = state.countryList.every(item => item.checked === true)
        }
      }).catch(err=>{
        console.log(err)
      })

      state.raidLevel = [{
        "key":"LV1",
        "value":1,
        "checked":state.savedLevel.indexOf(1)>-1?true:false
      },{
        "key":"LV2",
        "value":2,
        "checked":state.savedLevel.indexOf(2)>-1?true:false
      },{
        "key":"LV3",
        "value":3,
        "checked":state.savedLevel.indexOf(3)>-1?true:false
      },{
        "key":"LV4",
        "value":4,
        "checked":state.savedLevel.indexOf(4)>-1?true:false
      },{
        "key":"LV5",
        "value":5,
        "checked":state.savedLevel.indexOf(5)>-1?true:false
      },{
        "key":"Ex Raid",
        "value":"ex",
        "checked":state.savedLevel.indexOf("ex")>-1?true:false
      }];

      state.allLevel = state.raidLevel.every(item => item.checked === true)
    },
  }
}
