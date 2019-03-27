import Vue from 'vue'
import Vuex from 'vuex'
import {Http} from 'vue-resource'
import sniper from './module/sniper'
import raid from './module/raid'
import field from './module/field'
import googlemap from './module/googlemap'
import nests from './module/nests'
import pokemongos from './module/pokemongos'
import wild from './module/wild'
import gym from './module/gym'
import langs from './module/langs'
import avenger from './module/avenger'

import pokestop from './module/pokestop'
Vue.use(Vuex)

const state = {
    version:'Ver 2.9.1.0', //2.9

    openRadar:false,

    currentType:'sniper',

    pointOptions:{},

    choseCity:'',  //保存选中的主要城市信息 md5值

    langs:langs,

    gpxTitle:'',

    titlesName:[],

    onlineGpx:false, // 是否是在线 gpx

    newGpx:true, //最近两天是否有上传新的GPX

    gpxMd5:'',

    rewardImgPrefix:' //assets.thinkskysoft.com/vlocapi/reward_img/',

    pokemonImgPrefix:'//assets.thinkskysoft.com/vlocapi/pokemon_list_img/', //https 和http中自由判定

    nestImgPrefix:'//assets.thinkskysoft.com/vlocapi/pokemon_list_img/',

    raidNames:{},

    flagPrefix:'http://assets.thinkskysoft.com/vlocapi/flags/',

    flags:{},

    ifDrift:false,

    driftValue:10,

    currentLanguage:'en-US',

    //循环行走折回模式 true为原路折回 false为飞到起点重新开始
    repeatModel:true,

    //是否停止定位
    isStop:false,

    rangeData:0,

    //速度这里是执行的秒数，越小速度越快
    speed:1,

    osType:window.osType,

    //路线循环次数
    cycleModel:0,

    //暂停
    runPause:false,

    //是否显示更新日志
    updatedLogShow:true,

    //行走的速度
    wakeSpeed:1,

    //摇杆速度
    rockerSpeed:1,
    //多点速度
    morePointSpeed:1,

    //试用时间，999999999为无限,现在ios端开放无限时
    TrialTime: /mac|pc|android/.test(window.osType) ? parseInt(window.TrialTime) : 999999999,

    //语言文字
    trans:{},

    //导航
    navigationPoints:[],

    //保存的位置
    history:{},

    //我的位置
    my_location:false,

    //rockerTip
    rockerTip:false,

    //进度
    gpxProgress:[],

    //gpx搜索结果
    CloudSearchResult:{
        data:[],
        page:0,
        cur:0
    },

    //gpx上传结果
    gpxUploadList:{
      data:[],
      page:0,
      cur:0
    },

    //gpx收藏结果
    CloudFavoriteResult:{
        data:[],
        page:0,
        cur:0
    },

    //附近gpx
    CloudNearbyResult:false,

    //window.userToken,
    userToken:window.subinfo.token,

    isPointChange:false,

    //ture是处于用户编辑状态，false为gpx搜索
    isCustomRun:true,

    //true为收藏夹的gpx路线
    isFavorite:false,

    hasMoreWin:false,

    //是否可以上传gpx文件
    uploadGpxUser:false,

    //订阅信息
    subinfo:window.subinfo,

    //pc唯一id
    pc_uid:window.pc_uid,

    //客户端版本
    shellVersion:0,

    //host
    pc_host:window.pc_host,

    //订阅地址
    sub_product_url:window.sub_product_url,

    license:window.license,

    //最大奔跑速度，1000cm/500ms
    maxSpeed:1000,

    //剩余激活位置
    idle_pc:window.idle_pc,

    //显示隐藏补给站
    isChaticoShow:false,

    //显示隐藏道场
    isMarkergymnewShow:false,
}

const getters = {
    openRadar:state => state.openRadar,
    currentType:state => state.currentType,
    pointOptions:state => state.pointOptions,
    choseCity:state => state.choseCity,
    titlesName:state => state.titlesName,
    gpxTitle:state => state.gpxTitle,
    onlineGpx:state => state.onlineGpx,
    gpxMd5:state=> state.gpxMd5,
    gpxUploadList:state=> state.gpxUploadList,
    newGpx:state=> state.newGpx,
    rewardImgPrefix:state=> state.rewardImgPrefix,
    nestImgPrefix:state=> state.nestImgPrefix,
    pokemonImgPrefix:state =>state.pokemonImgPrefix,
    raidNames:state => state.raidNames,
    flagPrefix:state=> state.flagPrefix,
    flags:state => state.flags,
    ifDrift: state => state.ifDrift,
    driftValue: state => state.driftValue,
    cycleModel: state => state.cycleModel,
    rangeData: state => state.rangeData,
    currentLanguage: state => state.currentLanguage,
    speed: state => state.speed,
    runPause: state => state.runPause,
    isStop: state => state.isStop,
    history: state => state.history,
    gpxProgress: state => state.gpxProgress,
    historyTarget: (state)=>{
        let _target = []
        for(var i in state.history)
        {
            _target.push(i)
        }
        return _target
    },
    updatedLogShow: state => state.updatedLogShow,
    wakeSpeed: state => state.wakeSpeed,
    rockerSpeed: state => state.rockerSpeed,
    morePointSpeed: state => state.morePointSpeed,
    TrialTime: state => state.TrialTime,
    Remaining: (state) => {
        let _t = state.TrialTime
        let _h = Math.floor(_t/3600)
        let _i = Math.floor((_t-(_h*60*60))/60)
        let _s = Math.floor((_t-(_h*60*60)-(_i*60)))
        return (_h >= 10 ? _h : '0'+_h) + ":" + (_i >= 10 ? _i : '0'+_i) + ":" + (_s >= 10 ? _s : '0'+_s)
    },
    version: state => state.version,
    my_location: state => state.my_location,
    rockerTip: state => state.rockerTip,
    repeatModel: state=> state.repeatModel,
    CloudSearchResult: state=>state.CloudSearchResult,
    CloudFavoriteResult: state=>state.CloudFavoriteResult,
    CloudNearbyResult: state=>state.CloudNearbyResult,
    isPointChange: state=>state.isPointChange,
    isCustomRun: state => state.isCustomRun,
    userToken: state => state.userToken,
    isFavorite:state => state.isFavorite,
    hasMoreWin:state => state.hasMoreWin,
    uploadGpxUser:state => state.uploadGpxUser,
    subinfo:state => state.subinfo,
    pc_uid:state => state.pc_uid,
    shellVersion:state => state.shellVersion,
    pc_host:state => state.pc_host,
    sub_product_url:state=> state.sub_product_url,
    license:state => state.license,
    maxSpeed:state => state.maxSpeed,
    idle_pc:state => state.idle_pc,
    isChaticoShow: state => state.isChaticoShow,
    isMarkergymnewShow: state => state.isMarkergymnewShow,
    langs:state => state.langs,
    lang:(state)=>{
        return state.langs.lanCode[state.currentLanguage]
    },
    titleLang:(state)=>{
      return state.langs.codeToTitle[state.currentLanguage]
    },
    trans: (state) => {
      return state.langs.hasOwnProperty(state.currentLanguage)?state.langs[state.currentLanguage]:state.langs['en-US']
    },
}

const actions = {

}

/*检测免费时长*/
const elapse = ()=>{
    if(state.TrialTime > 0)
    {
        state.TrialTime--
        setTimeout(elapse,1000)
    }
}
if(state.TrialTime != 999999999 )
{
    elapse()
}


const mutations = {
    setOpenRadar(state,bool){
      state.openRadar = bool;
    },
    setCurrentType(state,type){
      state.currentType = type;
    },
    setPointSelectOption(state,data){
      state.pointOptions = data;
    },

    setChoseCity(state,md5){
      state.choseCity = md5;
      try{
        window.SyncConfig('choseCity',md5)
      }catch(error){
        console.log(error);
      }
    },

    setGpxTitle:function(state,bool){
      state.gpxTitle = bool;
    },
    setOnlineGpx:function(state,bool){
      state.onlineGpx = bool;
    },
    setNewGpx:function(state,bool){
      state.newGpx = bool;
    },
    setDrift:function(state,data){
      state.ifDrift = data
      try{
        window.SyncConfig('ifDrift',data)
      }catch(error){
        console.log(error);
      }
    },
    setDriftValue:function (state,data){
      state.driftValue = data
      try{
        window.SyncConfig('driftValue',data)
      }catch(error){
        console.log(error);
      }
    },
    setCurrentLanguage:function(state,data){
      state.currentLanguage = data.key
      try{
        window.SyncConfig("language",data.key)
        window.setLanguage("language",data.key)
      }catch(error){

      }
    },
    setRangeData:function(state,data){
      state.rangeData = data
    },
    setSpeed:function(state,speed)
    {
      state.speed = speed > state.maxSpeed ? state.maxSpeed : speed
    },
    setRunPause:function(state,bool)
    {
        state.runPause = bool
    },
    setCycleModel:function(state,n)
    {
        state.cycleModel = n
    },
    stopSim:function(state)
    {
        state.isStop = true
    },

    isFavorite:function(state,bool)
    {
        state.isFavorite = bool
    },

    //删掉一条位置
    delHistory:function(state,obj)
    {
        let _target = obj.target
        if(!_target)
        {
            return
        }
        if(obj.index === false)
        {
            delete(state.history[_target])
        }else{
            if(state.history.hasOwnProperty(_target))
            {
                state.history[_target].splice(obj.index,1)
            }
        }
        this.commit('syncHistory')
    },

    //添加一个位置
    addHistory:function(state,obj)
    {
        let _target = obj.target
        if(!_target)
        {
            return
        }
        if(state.history.hasOwnProperty(_target))
        {
            state.history[_target].push(obj)
        }else{
            state.history[_target] = [obj]
        }
        this.commit('syncHistory')
    },

    //编辑位置
    editHistory:function(state,obj)
    {
        let _target = obj.target
        let _old_target = obj.oldTarget
        if(state.history.hasOwnProperty(_target))
        {
            state.history[_old_target].splice(obj.index,1)
            state.history[_target].splice(obj.index,0,{
                title : obj.title,
                lat : obj.lat,
                lng : obj.lng,
            })
        }else{
            state.history[_old_target].splice(obj.index,1)
            state.history[_target] = [obj]
        }
        this.commit('syncHistory')
    },

    //合并位置
    mergeHistory:function(state,obj)
    {
        try{
          for(let i in obj)
          {
            let _target = i
            if(_target == "")
            {
              _target = 'Default'
            }
            if(state.history.hasOwnProperty(_target))
            {
              state.history[_target] = state.history[_target].concat(obj[i])
            }else{
              state.history[_target] = obj[i]
            }
          }
          this.commit('syncHistory')
        }catch(error){
          this.$alert({
            'title':this.trans.error,
            'content':this.trans.gpxErrFormat,
            'btns':[this.trans.gotit]
          })
        }

    },
    syncHistory:function(state)
    {
        let _jsonstr = JSON.stringify(state.history)
        this.commit('setValue',{key:'locationHistory',val:_jsonstr})
    },
    setUpdate:function(state)
    {
        this.commit('setValue',{key:'updatedLogShow',val:state.version})
    },

    setWakeSpeed:function(state){
        // console.log('commit wakeSpeed:%s',state.speed)
        state.wakeSpeed = state.speed
        this.commit('setValue',{key:'wakeSpeed',val:state.speed})
    },
    setRockerSpeed:function(state){
        // console.log('commit rockerSpeed:%s',state.speed)
        state.rockerSpeed = state.speed
        this.commit('setValue',{key:'rockerSpeed',val:state.speed})
    },
    setMorePointSpeed:function(state){
        // console.log('commit morePointSpeed:%s',state.speed)
        state.morePointSpeed = state.speed
        this.commit('setValue',{key:'morePointSpeed',val:state.speed})
    },
    //设置本地存储
    setValue:function(state,parm)
    {
        try{
            window.SyncConfig(parm.key,parm.val)
        }catch(error){}
    },

    //同步我的位置
    setMyLocation:function(state,obj)
    {
        state.isPointChange = true
        state.my_location = obj
        let _j_str = JSON.stringify(obj)
        this.commit('setValue',{
            key: 'my_location',
            val: _j_str
        })
    },
    setRepeatModel:function(state,bool)
    {
        state.repeatModel = bool
    },

    //搜索
    CloudSearch:function(state,param){
        Http.get('http://vlocapi.thinkskysoft.com/api/v1/location/city',{params:{
            lng:param.lng,
            lat:param.lat,
            city:param.city,
            limit:param.limit,
            p:param.p,
            author:param.author
        }}).then((response)=>{
            if(response.status != '200' && param.errorCall instanceof Function)
            {
                param.errorCall(response)
            }
            if(response.status == '200' && param.successCall instanceof Function){
                param.successCall(response)
                state.CloudSearchResult.data = response['data']['data']||''
                state.CloudSearchResult.page = response['data']['tp']||''
                state.CloudSearchResult.cur = param.p||''
                state.CloudSearchResult.center = {
                    lat:param.lat,
                    lng:param.lng
                }
            }
        }).catch((error)=>{
            if(param.errorCall instanceof Function)
            {
                param.errorCall(error)
            }
        })
    },

    //gpx上传列表
    getGpxUploadList:async function(state,param){
        await Http.get('https://vlocapi.thinkskysoft.com/api/v1/location/city?tag=new').then((response)=>{
        if(response.data.md5 != state.gpxMd5){ //是否更新
            state.newGpx = true;                    // 更新了

            state.gpxMd5 = response.data.md5;
            if(response.status != '200' && param &&  param.errorCall instanceof Function)
            {
              param.errorCall(response)
            }

            if(response.status == '200'){
              if(param && param.hasOwnProperty('successCall'))
              {
                param.successCall(response)
              }

              state.gpxUploadList.data = response.data.data||'';
            }
          }
        if(param.hasOwnProperty('ifClick')){
          if(param['ifClick']) state.newGpx = false  //定时器中没有这个属性。
        }
        param.successCall(response)
      }).catch((error)=>{
        if(param && param.errorCall instanceof Function)
        {
          param.errorCall(error)
        }
      })
    },


    //收藏
    CloudFavorite:function(state,param){
        Http.get('http://vlocapi.thinkskysoft.com/api/v1/favourate/index',{params:{
            'token':state.userToken,
            'type':2
          }}).then((response)=>{
            if(response.status != '200' && param &&  param.errorCall instanceof Function)
            {
                param.errorCall(response)
            }

            if(response.status == '200'){
                if(param && param.hasOwnProperty('successCall'))
                {
                    param.successCall(response)
                }
                state.CloudFavoriteResult.data = response.data.data||'';
            }

        }).catch((error)=>{
            if(param && param.errorCall instanceof Function)
            {
                param.errorCall(error)
            }
        })
    },

    //附近
    CloudNearby:function(state,param){

        Http.get('http://vlocapi.thinkskysoft.com/api/v1/location/near',{params:{
            lng:param.lng,
            lat:param.lat,
            distance:param.distance,
            pos:param.pos
        }}).then((response)=>{
            if(response.status != '200' && param.errorCall instanceof Function)
            {
                param.errorCall(response)
            }
            if(response.status == '200' && param.successCall instanceof Function){
                state.CloudNearbyResult = response.data.data
                param.successCall(state.CloudNearbyResult)
            }
        }).catch((error)=>{
            if(param.errorCall instanceof Function)
            {
                param.errorCall(error)
            }
        })
    },

    customRun:function(state,bool){
        state.isCustomRun = bool
    },

    hasMoreWin:function(state,bool){
        state.hasMoreWin = bool
    },

    shellVersion:function(state,version){
        state.shellVersion = version
    },

    isChaticoShow: (state,bool)=>{
      if(bool != undefined){
        state.isChaticoShow = bool
      }else{
        state.isChaticoShow = !state.isChaticoShow
      }
      window.SyncConfig('isChaticoShow',state.isChaticoShow ? 1 : 0)
    },
    isMarkergymnewShow:(state,bool)=>{
      if(bool != undefined){
        state.isMarkergymnewShow = bool
      }else{
        state.isMarkergymnewShow = !state.isMarkergymnewShow
      }
      window.SyncConfig('isMarkergymnewShow',state.isMarkergymnewShow ? 1 : 0)
    },
}


mutations.init = function(state){
    //是否有多开pc
    if(window.osType == 'pc'){
        try{
            setMsgCallback('GetClientVersion',(data)=>{
                data = eval('('+data+')')
                state.shellVersion = data.version
                if(data.version >= 4386)
                {
                    state.hasMoreWin = true
                }
            })
            window.GetClientVersion()
        }catch(e){}
    }



    //旧版位置列表
    window.ConfigGet('locationHistory',(res)=>{
        let __history_json = []
        try{
            __history_json = JSON.parse(res)
        }catch(error){}
        //判断是否为新版数据
        if(!(__history_json instanceof Array)){
            state.history = __history_json
        }else{
            //新增时间字段
            __history_json.map((item)=>{
                if(!item.hasOwnProperty('time'))
                {
                    item.time = (new Date()).getTime()
                }
            })
            state.history.Default = __history_json
        }
    });

    Http.get('//assets.thinkskysoft.com/vlocapi/data/item.json?v='+state.version).then((response)=>{
      if(response['body']){
        state.titlesName = response['body'];
      }
    }).catch(e => {console.log(e)});

    Http.get('//assets.thinkskysoft.com/vlocapi/100iv/flags.json?v='+state.version).then((response)=>{
      if(response['body']){
        state.flags=response['body'];
      }
    });

    //该用户是否有上传权限
    Http.get('http://vlocapi.thinkskysoft.com/api/v1/user/uploadcheck',{params:{
        token:state.userToken,
        type:2
    }}).then((response)=>{
        if(response.data.status == true)
        {
            state.uploadGpxUser = true
        }
    }).catch((error)=>{

    });


    //是否显示更新日志
    window.ConfigGet('updatedLogShow',(res)=>{
        state.updatedLogShow = res == state.version ? true : false
    })

    //摇杆速度
    window.ConfigGet('rockerSpeed',(res)=>{
        let _rockerSpeed =  parseInt(res)||130
        if(_rockerSpeed > 0 && _rockerSpeed <= state.maxSpeed)
        {
            state.speed       =  _rockerSpeed
            state.rangeData = _rockerSpeed/state.maxSpeed*100; //根据速度反向计算
            state.rockerSpeed = _rockerSpeed
        }
    })

    //走路速度
    window.ConfigGet('wakeSpeed',(res)=>{
        let _wakeSpeed =  parseInt(res)||130
        if(_wakeSpeed > 0 && _wakeSpeed < state.maxSpeed)
        {
            state.wakeSpeed = _wakeSpeed
        }
    })

    //多点速度
    window.ConfigGet('morePointSpeed',(res)=>{
        let _morePointSpeed = parseInt(res)||130
        if(_morePointSpeed > 0 && _morePointSpeed < state.maxSpeed)
        {
            state.morePointSpeed = _morePointSpeed
        }
    })


    //默认语言
    window.ConfigGet('language',(res)=>{
      state.currentLanguage = res||state.currentLanguage
    })

    //摇杆提示
    window.ConfigGet('rockerTip',(res)=>{
        state.rockerTip = res ? true : false
    })

    window.ConfigGet('ifDrift',(res)=>{
      res = res == 'true'?true:false;
      state.ifDrift = res;
    })

    window.ConfigGet('driftValue',(res)=>{
      state.driftValue = res||state.driftValue
    })

    //显示隐藏补给站
    window.ConfigGet('isChaticoShow',(res)=>{
      (!!res && res == 1) ? state.isChaticoShow = true : false
    })

    //显示隐藏道场
    window.ConfigGet('isMarkergymnewShow',(res)=>{
      (!!res && res == 1) ? state.isMarkergymnewShow = true : false
    })

    window.ConfigGet('ifNotify',(res)=>{ //on map 默认关闭,
      let openNotify = (res === '') ?  true : res == 'true'?true:false;
      this.commit('sniper/setNotify',openNotify);
    })

    window.ConfigGet('sniperClickPoint',(res)=>{
      this.commit('sniper/setClickPoint',res == ''?[]:JSON.parse(res));
    });

    window.ConfigGet('sniperLV',(res)=>{ //on map 默认关闭,
      this.commit('sniper/setLV',res == 'true'?true:false);
    })

    window.ConfigGet('sniperShiny',(res)=>{ //on map 默认关闭,
      this.commit('sniper/setShiny',res == 'true'?true:false);
    })

    //display on map
    window.ConfigGet('sniperMap',(res)=>{ //on map 默认关闭,
      let displayOnMap = (res === '') ?  false : res == 'true'?true:false;
      this.commit('sniper/setDisplay',displayOnMap);
    })

    window.ConfigGet('nestMap',(res)=>{ //on map 默认关闭,
      let displayOnMap = (res === '') ?  false : res == 'true'?true:false;
      this.commit('nests/setDisplay',displayOnMap);
    })

    window.ConfigGet('raidMap',(res)=>{ //on map 默认关闭,
      let displayOnMap = (res === '') ?  false : res == 'true'?true:false;
      this.commit('raid/setDisplay',displayOnMap);
    })

    window.ConfigGet('fieldMap',(res)=>{ //on map 默认关闭,
      let displayOnMap = (res === '') ?  false : res == 'true'?true:false;
      this.commit('field/setDisplay',displayOnMap);
    })

    window.ConfigGet('wildMap',(res)=>{ //on map 默认关闭,
      let displayOnMap = (res === '') ?  false : res == 'true'?true:false;
      this.commit('wild/setDisplay',displayOnMap);
    })

    window.ConfigGet('wildClickPoint',(res)=>{
      console.log(`返回的的内容是什么:${res},类型是什么:${typeof res}`);
      this.commit('wild/setClickPoint',res == ''?[]:JSON.parse(res));
    });

    window.ConfigGet('gymMap',(res)=>{ //on map 默认关闭,
      let displayOnMap =  res == 'true'?true:false;
      this.commit('gym/setDisplay',displayOnMap);
    })

    window.ConfigGet('choseCity',(res)=>{ //on map 默认关闭,
      state.choseCity = res;
    })

    window.ConfigGet('wildShiny',(res)=>{ //on map 默认关闭,
      let bool = res == 'true'?true:false;
      this.commit('wild/setWildShiny',bool);
    })

  //如果没有历史定位，获取谷歌api位置
    const locationInit = ()=>{
        let _data;
        let _oAjax = new XMLHttpRequest();
        _oAjax.open('POST', 'https://www.googleapis.com/geolocation/v1/geolocate?key='+window.google_api_key, false);//false表示同步请求
        _oAjax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        _oAjax.onreadystatechange = function() {
            if (_oAjax.readyState == 4 && _oAjax.status == 200) {
                _data = JSON.parse(_oAjax.responseText);
            }
        };
        try{
            _oAjax.send('')
        }catch(error){}
        /*如果没有历史定位信息，取谷歌api真实地理位置*/

        if (_data != undefined && _data.hasOwnProperty('location') && _data.location.hasOwnProperty('lat')) {
            state.my_location = {
                lat: _data.location.lat,
                lng: _data.location.lng
            }
        }else{
            state.my_location = {
                lat: -33.8688,
                lng: 151.2195
            }
        }
    }
    //我的位置
    window.ConfigGet('my_location',(res)=>{
        let _loc = {}
        try{
            _loc = JSON.parse(res)
        }catch(error){}
        if(/^-*\d+.\d+$/.test(_loc.lng) && /^-*\d+.\d+$/.test(_loc.lat))
        {
            _loc.lat = parseFloat(_loc.lat)
            _loc.lng = parseFloat(_loc.lng)
            state.my_location = _loc
        }else{
            locationInit()
        }
    },()=>{
        locationInit()
    })
}

export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations,
    modules:{
      sniper:sniper,
      raid:raid,
      field:field,
      googlemap:googlemap,
      pokestop:pokestop,
      nests:nests,
      pokemongos:pokemongos,
      wild:wild,
      gym:gym,
      avenger:avenger
    }
})
