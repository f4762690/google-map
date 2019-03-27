export default {
  namespaced:true,
  state:{
    displayOnMap:false, //是否在地图上显示
    nameChose:[],       //用于缓存
    countryChose:[],
    ifFilter:false,
    savedPets:[],
    savedCountries:[],
    nestDataList:[],
    isLoading:true,
  },
  getters:{
    displayOnMap:state=>state.displayOnMap,
    isLoading:state=>state.isLoading,
    nestDataList:state=>state.nestDataList,
    savedPets:state=>state.savedPets,
    savedCountries:state=>state.savedCountries,
    ifFilter:state=>state.ifFilter,
    nameChose:state=>state.nameChose,
    countryChose:state=>state.countryChose
  },
  mutations:{
    setLoading(state,bool){
      state.isLoading = bool;
    },
    setNestDataList(state,data){
      state.nestDataList = data;
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

    setDisplay(state, bool){
      state.displayOnMap = bool;
      window.SyncConfig('nestMap',bool)
    },

    setNameChose(state,data){
      state.nameChose = data;
      window.SyncConfig('nestNameChose',data)
    },

    setCountryChose(state,data){
      state.countryChose = data;
      window.SyncConfig('nestCountryChose',data)
    }
  },
  actions:{

  }
}
