import { Http } from 'vue-resource'
import Vue from 'vue'
export default{
  namespaced:true,
  state:{
    wildShiny:false, //异色检查
    countries:{},
    petsData:[],
    allPokemons:[],
    allCountries:[],
    allTypes:[],
    allPokemon:true,
    allCountry:true,
    allType:true,
    isLoading:true,
    displayOnMap:false,
    currentIndex:0,
    wildScroll:null,
    checkedPokemons:[],
    checkedTypes:[],
    bottomLoading:false,
    page:1,
    addCheckedPokemon:[],
    md5:'',
    lastTime:'',
    netWorkError:false,
    searchText:'',
    callBack:null,
    savedPet:[],
    savedCountry:[],
    savedType:[],
    refreshDataTimeoutID:null,
    clickPoint:[],
    wildFilterData:[],
  },
  getters:{

    wildFilterData:(state)=>{
      return state.petsData.filter((item)=>{
        let _pokemon = state.savedPet.indexOf(item.pokemon_id)>-1||!!!state.savedPet.length?true:false,
            _country = state.savedCountry.indexOf(item.country)>-1||!!!state.savedCountry.length?true:false,
            _shiny = state.wildShiny? item.is_shiny == 1?true:false:true,
            _type = true,
            _searchText = state.searchText == ''?true:new RegExp(state.searchText,'ig').test(item.name);
            if(item.pokemon_types.length&&state.savedType.length){
              _type =item.pokemon_types.some((item)=>{
                return state.savedType.indexOf(item)>-1
              })
            }
            // _type = state.savedType.indexOf(item.pokemon_types)>-1||!!!state.savedType.length?true:false,
        return _pokemon&&_country&&_type&&_shiny&&_searchText;
      })
    },
    clickPoint:state=>state.clickPoint,
    allPokemon:state=>state.allPokemon,
    allCountry:state=>state.allCountry,
    allType:state=>state.allType,
    savedPet:state => state.savedPet,
    savedCountry:state => state.savedCountry,
    savedType:state => state.savedType,
    wildShiny:state => state.wildShiny,
    searchText:state => state.searchText,
    callBack:state => state.callBack,
    lastTime:state => state.lastTime,
    allPokemons:state => state.allPokemons,
    getCountries:state => state.countries,
    petsData:state => state.petsData,
    allCountries:state => state.allCountries,
    allTypes:state => state.allTypes,
    displayOnMap:state => state.displayOnMap,
    currentIndex:state => state.currentIndex,
    wildScroll:state => state.wildScroll,
    page:state => state.page,
    bottomLoading:state => state.bottomLoading,
    netWorkError:state => state.netWorkError,
  },
  mutations:{
    setFilterOptions(state){
      let saveCheckedPets = new Set(),
          _country = [],
          _types = [];

      state.allPokemons.forEach((item)=>{
        if(item.checked) saveCheckedPets.add(item.id);
      });

      let _checkPet = [...saveCheckedPets];

      state.allCountries.forEach((item)=>{
        if(item.checked) _country.push(item.name);
      });

      state.allTypes.forEach((item)=>{
        if(item.checked) _types.push(item.key)
      });

      let petsOption = _checkPet,
          countryOption = _country,
          typeOption = _types,
          optionStr = JSON.stringify({petsOption,countryOption,typeOption});
      window.SyncConfig('wildSaveOptions',optionStr);  //保存每次的选择

      state.savedPet = [...saveCheckedPets];

      state.savedCountry = _country;

      state.savedType = _types;
    },
    setClickPoint(state,data){
      state.clickPoint = data;
      window.SyncConfig('wildClickPoint',JSON.stringify(data))
    },
    refreshData(state){
      if(state.petsData.length>20){
        let beforePet = [];
        beforePet = state.petsData.splice(0,20); //截取前20位
        state.pets = state.petsData.filter((item) => {
          let _t = Math.ceil(new Date().getTime()/1000)
          return _t - item.last_modified < 1800    //start_time  从哪里获取哦。
        });
        state.petsData = beforePet.concat(state.petsData);
      }
      //每1秒刷新一次时间
      state.refreshDataTimeoutID = setTimeout(()=>{
        this.commit('wild/refreshData')
      },3000)
    },

    setAllPokemon(state,bool){
      state.allPokemon = bool;
    },

    setAllCountry(state,bool){
      state.allCountry = bool;
    },

    setAllType(state,bool){
      state.allType = bool;
    },

    setSavedPet(state,data){
      state.savedPet = data;
    },

    setSavedCountry(state,data){
      state.savedCountry = data;
    },

    setSavedType(state,data){
      state.savedType = data;
    },

    setWildShiny(state,bool){
      state.wildShiny = bool;
      window.SyncConfig('wildShiny',bool)
    },

    setLoading(state,bool){
      state.isLoading = bool;
    },

    setCurrentIndex(state,index){
      state.currentIndex = index;
    },

    isAllChecked(state,param){
      switch (param.option) {
        case 'pokemon':
          state.allPokemon = param.check;
          break;
        case 'country':
          state.allCountry = param.check;
          break;
        case 'type':
          state.allType = param.check;
          break;
      }
    },

    setSearchText(state,text){
      state.searchText = text;
    },

    setCallBack(state,callBack){
      state.callBack = callBack;
    },

    changePokemonsStatus(state,bool){
      state.allPokemon = bool;
      state.allPokemons.forEach((item)=>{
        item.checked = bool;
      })
    },

    changeCountriesStatus(state,bool){
      state.allCountry = bool;
      state.allCountries.forEach((item)=>{
        item.checked = bool;
      })
    },

    changeTypesStatus(state,bool){
      state.allType = bool;
      state.allTypes.forEach((item)=>{
        item.checked = bool;
      })
    },

    setBottomLoading(state,bool){
     state.bottomLoading = bool;
    },

    addPage(state){
      state.page++;
    },

    setClick(state,param){
      param.item.ifClick = true;
      Vue.set(state.petsData,param.index,param.item);
    },

    setDisplay(state,bool){
      state.displayOnMap = bool;
      window.SyncConfig('wildMap',bool)
    }

  },
  actions:{
     webSocketTest() {
      if ("WebSocket" in window)
      {
        console.log("您的浏览器支持 WebSocket!");
        // 打开一个 web socket
        var ws = new WebSocket("ws://vlocapi.thinkskysoft.com/api/v1/wild/index");
        ws.onopen = function()
        {
          ws.send("发送数据");
        };

        ws.onmessage = function (evt)
        {
          debugger;
          var received_msg = evt.data;
        };

        ws.onclose = function()
        {
          console.log("连接已关闭...");
        };
      }else
      {
        console.log("您的浏览器不支持 WebSocket!");
      }
    },

    async getData({state,rootState,rootGetters},type='new'){
      switch (type) {
        case 'new':
          break;
        case 'more':
          state.bottomLoading = true;
          break;
      }

      await Http.get('https://vlocapi.thinkskysoft.com/api/v1/wild/index').then((res)=>{
        if(res['body']['data'].length&&res['body']['status'] && state.md5 != res['body']['md5']){
            state.lastTime = new Date().getTime();
            state.md5 = res['body']['md5'];
            res['body']['data'].forEach((item)=>{
              if(!item.last_modified||item.last_modified>Date.now()/1000) item.last_modified = Date.now()/1000;
              item.name = rootState.titlesName[item.pokemon_id]?
                          rootState.titlesName[item.pokemon_id][rootGetters.titleLang]?
                          rootState.titlesName[item.pokemon_id][rootGetters.titleLang]:
                          rootState.titlesName[item.pokemon_id]['en_title']:'?'

              item['ifClick'] = state.clickPoint.indexOf(item._id)>-1?true:false;
            });

            //new要做去重
            let newResult = new Map();

            let result = {
              'new':[...res['body']['data'],...state.petsData],
              'more':[...state.petsData,...res['body']['data']],
            };

          result[type].forEach((item)=>{
             newResult.set(item._id,item)
          });

          state.petsData = [...newResult.values()];
          }
          state.bottomLoading = false;
          state.isLoading = false;
          state.netWorkError = false;
      }).catch(e=>{
          state.bottomLoading = false;
          state.isLoading = false;
          state.netWorkError = true;
      });

      state.callBack();
    },

    getPokemons({state,rootGetters}){
      Http.get('//vlocapi.thinkskysoft.com/api/v1/wild/pokemon').then((res)=>{
        if(res['body']['status']){
          res['body']['data'].forEach((item)=>{
            let name = rootGetters.titlesName[item]?
                rootGetters.titlesName[item][rootGetters.titleLang]?
                rootGetters.titlesName[item][rootGetters.titleLang]:
                rootGetters.titlesName[item]['en_title']:'?',
                ifChecked = false;
            if(state.savedPet.indexOf(item)>-1) ifChecked = true;
            state.allPokemons.push({
              id:item,
              name:name,
              checked:ifChecked,
            })
          })
          state.allPokemon = state.allPokemons.every(item=> item.checked === true);
        }
      })
    },

    getCountries({state}){
      Http.get('//vlocapi.thinkskysoft.com/api/v1/wild/country').then((res)=>{
        if(res['body']['data']){
          res['body']['data'].forEach((item)=>{
            let ifChecked = false;
            if(state.savedCountry.indexOf(item)>-1) ifChecked = true;
            state.allCountries.push({
              name:item,
              checked:ifChecked
            })
          })
          state.allCountry = state.allCountries.every((item)=> item.checked === true);
        }
      })
    },

    getTypes({state,rootGetters}){
      Http.get('//assets.thinkskysoft.com/vlocapi/data/pokemon_types.json').then((res)=>{
        if(res['body']){
          for(let key in res['body']){
            let ifChecked = false;
            if( state.savedType.indexOf(key)>-1) ifChecked = true;
            state.allTypes.push({
              name:res['body'][key][rootGetters.titleLang]?res['body'][key][rootGetters.titleLang]:res['body'][key]['en_title'],
              key:key,
              checked:ifChecked
            })
          }
          state.allType = state.allTypes.every(item=>item.checked ===true)
        }
      })
    },
  }
}
