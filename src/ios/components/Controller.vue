<template>
  <div id="app" @drop="gpxfileloader" @dragover="dragoverHandler" @dragenter="dragenterHandler" >
    <!--位置列表、搜索-->
    <div id="pac-input" class="controls" v-show="isMapInit" @mouseleave="history_hide">
        <div class="icon-filter_drama" @click="cloudShow" :style="{color:(newGpx?'red':'')}"></div>
        <div class="icon-list" @click="history_show"></div>
        <input id="location-input" ref="LocationAutoComplete" v-model="input_point" type="text" :placeholder="trans.enterLoc">
        <div class="icon-floppy-disk" @click="history_add"></div>
        <button v-show="false === prevLatlng" id="go-button" class="controls" @click="search_point">{{this.trans.go}}</button>

        <btn v-show="false !== prevLatlng" id="return-button"
        :msg="trans.returnLeft+'<br/>'+ prevLatlngStr + '<br/>'+trans.returnRight"
        :action="return_point">Return</btn>

        <history @editHistory="editHistory" ref="history" @importFile="ImportGpxFile"></history>
        <cloud ref="cloud"></cloud>
    </div>

    <!--保存点-->
    <historyAdd ref="historyAdd"></historyAdd>
    <div ref="reflowRef" v-show="false">reflowRef</div><!--控制ipad分屏重排 -->
    <!--左上角按钮 -->
    <div class="left-top">
      <btn :action="changeSetting" class="language-btn" :type="'icon'" :pos="'left'"></btn>
      <btn :action="stopSimulationWin" :pos="'left'" :type="'icon'" :class="isStop?'stop-icon':'default-stop-icon'"></btn>
      <btn :action="goHelp" class="help-btn" :type="'icon'" :pos="'left'"></btn>
      <btn :action="mapZoomIn" class="controls import-gpx-file" style="margin:0;border-bottom:1px solid #eee" :type="'icon'" :pos="'left'">+</btn>
      <btn :action="mapZoomOut" class="controls import-gpx-file" :type="'icon'" :pos="'left'">-</btn>
      <btn :action="findMyPos" class="controls my-pos" :type="'icon'" :pos="'left'"></btn>
    </div>

    <!--右下按钮-->
    <div id="my-pos">
        <btn v-show="runIntervalId!= null" :action="()=>{ifZoom = !ifZoom}" class="import-gpx-file min-btn" :type="'icon'" :pos="'left'"></btn>
        <!--<span @click="()=>{$refs.avengerRef.show()}"  :class="avengerNews?'avenger-btn-active':'avenger-btn'"></span>-->
        <span @click="()=>{$refs.raderRef.show();$refs.pointRef.close()}" class="icon-dj new-btn" :class="{'update-data':hasNew}"></span>
        <!--<span @click="nestSearch" class="icon-nests new-btn"></span>-->
        <btn :action="openHost" class="hosting-btn" :type="'icon'" :pos="'left'"></btn>
        <btn :action="commitChatico" :class="isChaticoShow?'chatico-btn-active':'chatico-btn'" :type="'icon'" :pos="'left'"></btn>
        <btn :action="commitGym" :class="isMarkergymnewShow?'gym-btn-active':'gym-btn'" :type="'icon'" :pos="'left'"></btn>
        <btn v-if="hasMoreWin" :action="moreWin" class="controls import-gpx-file" :type="'icon'" :pos="'left'" ><span style="font-size:1.2em" class="icon-files-empty"></span></btn>
        <btn v-if="$parent.hasIVChecker" :action="IVhandler" class="controls import-gpx-file" :type="'icon'" :pos="'left'" >IV</btn>
        <btn :action="ImportGpxFile" class="controls import-gpx-file" :type="'icon'" :pos="'left'" >GPX</btn>
    </div>

    <MPB ref="mpb"
    :pos="mp_pos"
    @copy="clipboard"
    ></MPB>

    <!--停止定位时信息-->
    <div id="stop-tip" v-show="stop_tip_show" class="controls">
      <div class="stop-tip-content">
        <div>{{trans.stopSimulationInfo}}</div>
        <mt-button @click.native="reloadMap" plain size="small">{{trans.reload}}</mt-button>
      </div>
    </div>

    <!--control menu-->
    <div id="con-group" v-show="isMapInit">
        <btn v-if="ifIos()" :action="()=>{showSpeed = !showSpeed}" class="controls" :class="showSpeed?'activeSpeed':'defaultSpeed'" :type="'icon'" :pos="'left'"></btn>
        <map_btn v-if="ifIos()" :icon="p_to_p" :type="0" :simulationType="simulationType" :pos="'left'"></map_btn>
        <map_btn v-if="ifIos()" :icon="line" :type="1" :simulationType="simulationType" :pos="'left'"></map_btn>
        <map_btn v-if="ifIos()" :icon="m_point" :type="2" :simulationType="simulationType" :pos="'left'"></map_btn>
    </div>

    <!--摇杆-->
    <rocker id="rocker"
    ref="rocker"
    v-show="simulationType == 0"
    :move="autoMove">
    </rocker>

    <!--mapbox-->
    <mymap
    :DefaultPosition="my_location"
    :PointIcon="point_icon"
    :iconA="m_a"
    :iconB="m_b"
    :iconEnd="end_point"
    :type="simulationType"
    @moveHere="startSimulation"
    @init="mapInitHandler"
    @copy="clipboard"
    @minimize="minimizeHandler"
    @mpchange="mpchangeHandler"
    ref="map"
    ></mymap>

    <!--行走信息-->
    <run_message
    :progress="progress"
    :distance="run_total_distance"
    :lineDistance="line_distance"
    @zoomWin="()=>{ifZoom = true}"
    v-if="runIntervalId != null&&!ifZoom"
    @save="saveToGpxFile"
    @upload="uploadGpxHandler"
    @addFavorite="addFavoriteHandler"
    @unFavorite="unFavoriteHandler"
    @editRoule="editRouleHandler"
    ></run_message>

    <!--速度控制-->
    <speedBar id="speedBar" ref="speedBar" v-show="showSpeed" ></speedBar>

    <!--文本导入-->
    <text-import ref="textRef" @importData="importData"></text-import>
    <!--雷达资源-->
    <radar-resrouce ref="raderRef"></radar-resrouce>

    <!--复仇者-->
    <avenger ref="avengerRef"></avenger>
    <!--免费时长-->
    <div class="trial-time" v-if="TrialTime != 999999999">
        <p>Free trial-time</p>
        <p>{{Remaining}}</p>
    </div>
    <help-guide :if-show="ifShowHelp" :action="()=>{ ifShowHelp = false}"></help-guide>
    <!--订阅框-->
    <subscribe ref="subscribe"></subscribe>
    <setting ref="settingRef"></setting>
    <point-select ref="pointRef" @maximize="()=>{$refs.raderRef.show()}"></point-select>
    <span class="version">{{version}}</span>
  </div>
</template>

<script>
import point_icon from '../image/point.png'
import m_point from '../image/m_point.png'
import end_point from '../image/end_point.png'
import line from '../image/line.png'
import p_to_p from '../image/p_to_p.png'
import m_a from '../image/market_a.png'
import m_b from '../image/market_b.png'
import run_message from './run_message.vue'
import rocker from './rocker.vue'
import speedBar from './speed.vue'
import history from './history.vue'
import historyAdd from './history_add.vue'
import tip from './tip.vue'
import MPB from './more_point_bar.vue'
import cloud from './cloud.vue'
import subscribe from './subscribe.vue'
import { mapGetters } from 'vuex'
import xmlbuilder from 'xmlbuilder'
import runer from '../lib/Runer'
import helpGuide from './helpGuide'
import touch from './touch'
import setting from '../page/settingPage';
import textImport from './textImport'
import radarResrouce  from './radarResource'
import avenger from './avenger/avenger'
import pointSelect from './pointSelect'

export default {
  name: 'App',
  components:{run_message, rocker, speedBar, tip, history, historyAdd, MPB, cloud, subscribe, helpGuide,setting,textImport,radarResrouce,avenger,pointSelect },
  data(){
    return {
        ifShowHelp:false,
        showSpeed:false,
        //地图是否加载完成
        isMapInit:false,
        ifZoom:false,
        mp_pos:'',
        //点
        point_icon:point_icon,

        //结束点
        end_point:end_point,

        //点A
        m_a:m_a,

        //点B
        m_b:m_b,

        //是否显示ivchecker
        isPMG:window.isPMG,

        //上一个点
        prevLatlng:false,

        //直线距离
        line_distance:0,

        //摇杆显示状态
        rocker_show:false,

        //go按钮显示状态
        go_button:false,

        //虚拟定位类型，0 为直接跳转 1为模拟行走 2为多点模拟行走
        simulationType:0,

        //多点模式icon
        m_point:m_point,

        //行走模式的icon
        line:line,

        //路程总时长
        run_total_time:0,

        //路程总距离
        run_total_distance:0,

        //点模式的icon
        p_to_p:p_to_p,

        //行走模式interval id
        runIntervalId:null,

        //输入的GPS
        input_point:"",

        //停止定位后提示消息显示状态
        stop_tip_show:false,

        //行走模式进度
        progress:0,

        //gpx文件名
        gpx_file_name:false,

        //gpx进度
        gpx_progress:0,

    }
  },
  computed:{
    prevLatlngStr:function(){
        if(this.prevLatlng)
        {
            return '('+this.prevLatlng.lat.toFixed(6) + ',' + this.prevLatlng.lng.toFixed(6)+')'
        }else{
            return ''
        }
    },
    ...mapGetters('avenger',['avengerNews']),
    ...mapGetters('sniper',['hasNew']),
    ...mapGetters(['idle_pc','maxSpeed','license','subinfo','hasMoreWin','speed','isFavorite','cycleModel',
      'runPause','trans','isStop', 'wakeSpeed', 'rockerSpeed', 'morePointSpeed', 'TrialTime', 'Remaining',
      'version', 'my_location', 'repeatModel', 'userToken','currentLanguage','isChaticoShow',
      'isMarkergymnewShow','newGpx','onlineGpx','gpxTitle','pointOptions'])
  },

  mounted:function(){
    let vm = this;
    this.$addQuickKey(['ctrl','n1'],()=>{
        this.simulationType = 0
    })
    this.$addQuickKey(['ctrl','n2'],()=>{
        this.simulationType = 1
    })
    this.$addQuickKey(['ctrl','n3'],()=>{
        this.simulationType = 2
    })
    this.$addQuickKey(['ctrl','o'],this.history_show)
    this.$addQuickKey(['ctrl','a'],this.cloudShow)
    this.$addQuickKey(['ctrl','q'],this.stopSimulation)
    this.$addQuickKey(['ctrl','i'],this.IVhandler)
    this.$addQuickKey(['ctrl','g'],this.ImportGpxFile)
    this.$addQuickKey(['ctrl','k+'],this.mapZoomIn)
    this.$addQuickKey(['ctrl','k-'],this.mapZoomOut)
    this.$addQuickKey(['ctrl','h'],this.findMyPos)
    this.$addQuickKey(['ctrl','n4'],()=>{
        let _speed = this.speed < this.maxSpeed ? this.speed + 1 : this.maxSpeed
        this.$store.commit('setSpeed',_speed)
    })
    this.$addQuickKey(['ctrl','n5'],()=>{
        let _speed = this.speed > 0 ? this.speed - 1 : 0
        this.$store.commit('setSpeed',_speed)
    })
    window.SubscribeShow = this.$refs.subscribe.show
    window.importGPX = (data)=>{
      this.gpxCallBack(data);
    };
    window.intoBackground = ()=>{
      var param = {}
      param.simulationType = this.simulationType
      param.speed = this.speed

      switch(this.simulationType){
        case 0://摇杆
          if(true == this.$refs.rocker.ishold)
          {//判断是否在定时移动中
            param.stepX = this.$refs.rocker.getStepX()
            param.stepY = this.$refs.rocker.getStepY()
            this.$refs.rocker.holdOff()
            this.$continueRun(param)
          }
          break;

        case 1://行走
        case 2://多点
          if(this.runIntervalId && !this.runPause){//判断是否在定时移动中
            param.cycleModel = this.cycleModel
            param.repeatModel = this.repeatModel
            param.points = runer.getPoints()
            param.runers = runer.getRuners()
            param.curDis = runer.getCurDis()
            this.$store.commit('setRunPause',true)      //后台执行停止run
            this.$continueRun(param)
          }
          break;
      }
    }

    window.iosStopRun = ()=>{
      this.$refs.rocker.holdOff();
      this.close_run_message();
    }

    window.reflowSize = ()=>{
        this.$refs.reflowRef.clientHeight += Math.random();
    }

    // document.addEventListener('copy',(e)=>{ //$cpyText失效.
    //   this.$getCopyText((res)=>{
    //     let copyText = res.replace(/\s/g,'');
    //     if(!/\d*\.\d{9},\d*\.\d{9}/g.test(copyText)){
    //       let _reg = /-*\d*\.\d*,-*\d*\.\d*/g;
    //       let result;
    //       if(!!copyText){
    //           result = copyText.replace(_reg,(item)=>{
    //           return  this.$gps.secretPoint(item.split(",")[0],item.split(",")[1],'string')
    //         });
    //         vm.$nextTick(()=>{
    //           vm.$copyText(result);
    //         })
    //       }
    //     }
    //   })
    // });
    window.intoForeground = (latlng)=>{
      this.map.setCurMarketPosition(latlng);

      //设置wake状态
      if(latlng.isWake)
      {
        if(latlng.isEnd)
        {
          this.close_run_message();
          clearTimeout(this.runIntervalId);
          this.NativeSimulateLocationTo(latlng);
        }else{//设置到当前移动状态
          this.$store.commit('setRunPause',false)                  //前台运行,打开run
          this.$store.commit('setCycleModel', latlng.cycleModel);
          runer.updateCurrent(latlng.runers, latlng.curDis)
        }
      }else{   //摇杆
          this.$refs.rocker.holdOpen()
      }
    }

    this.$store.dispatch('pokemongos/getPokemongo')

    this.$store.dispatch('pokestop/refresh')
    window.__copy__ = this.clipboard
    window.__go_to_point__ = (latlng)=>{
      this.map.setPoint(latlng)
      this.map.moveHere()
    };
  },

  watch:{
    TrialTime:function(val)
    {
        if(val <= 0)
        {
            this.$router.push({name:'timeEnd'})
        }
    },

    //检测输入框变化，有输入值时，隐藏return
    input_point:function(val,old)
    {
      val = val.replace(/\s/g,'')
      old = old.replace(/\s/g,'')
      if(val != "")
      {
        this.prevLatlng = false
      }

      if(
        val.length > 3 &&
        !/^[-|\d|\.|,]*$/.test(val) &&
        val != old
      ){
        this.map.locationSearch(val)
      }
    },

    runIntervalId:function(val,old){
        /**
         * 同步当前位置
         */
        if(null==val && null!=old)
        {
            let _latlng = this.map.getCurMarket()
            this.$store.commit('setMyLocation',_latlng)
        }
    },

    //虚拟定位模式发生改变
    simulationType:function(val,old)
    {
        /**
         * 同步当前位置
         */
        let _latlng = this.map.getCurMarket()
        this.$refs.rocker.holdOff()
        this.$store.commit('setMyLocation',_latlng)
        if(this.runIntervalId){
          this.close_run_message()
          clearTimeout(this.runIntervalId)

        }
        //清除gpx文件名
        this.gpx_file_name = false
        this.prevLatlng    = false
        this.runIntervalId = null
        this.progress      = 0
        this.map.clear()

        switch(val){
            case 0:
                this.$store.commit('setSpeed',this.rockerSpeed)
                this.$store.commit('setRangeData',this.rockerSpeed/this.maxSpeed*100)
            break;

            case 1:
                this.$store.commit('setSpeed',this.wakeSpeed)
                this.$store.commit('setRangeData',this.wakeSpeed/this.maxSpeed*100)
            break;

            case 2:
                this.$store.commit('setSpeed',this.morePointSpeed)
                this.$store.commit('setRangeData',this.morePointSpeed/this.maxSpeed*100)
            break;
        }

        if(val == 0)
        {
            this.rocker_show = true;
        }else{
            this.rocker_show = false
        }
    }
  },

  methods:{
    /**
     * 编辑运行中坐标
     */
    editRouleHandler:function(){
      let _rouleStr = '';
      this.roule.crude.map((obj)=>{
        _rouleStr += `${obj.lat},${obj.lng}\r\n`
      })
      this.$prompt({
        'title': this.trans.editGPX,
        'textinput':false,
        'btns': [this.trans.confirmContent,this.trans.no],
        'defaultVaule': _rouleStr
      },(res)=>{
        let __points = res.split('\n')
        let __path = []
        __points.map(p=>{
          let _gps = this.$gps.strTogps(p)
          if(_gps){
            if(/\.\d{9}$/.test(_gps.lat) && /\.\d{9}$/.test(_gps.lng)){
              _gps = this.$gps.decryptPoint(_gps.lat,_gps.lng)
            }
            __path.push(_gps)
          }
        })
        if(__path.length > 0){
          this.close_run_message()

          //判断当前是否可以
          this.onlineGpx? this.runPoints(__path,true): this.runPoints(__path)
        }
      },()=>{
        this.$prompt.close;
      })
    },
    importData(data){
      let json = this.getTextObj(data);
      if(JSON.stringify(json) != "{}"){
        this.$refs.history.saveText(json);
        this.$alert({
          'title':this.trans.importSuccess,
          'content':this.trans.imoportSuccessInfo,
          'btns':[this.trans.confirmContent]
        },()=>{
          this.$alert.close;
        })
      }else{
        this.$alert({
          'title':this.trans.error,
          'content':this.trans.errorFormat,
          'btns':[this.trans.confirmContent]
        },()=>{
          this.$alert.close;
        })
      }
      this.$refs.textRef.hide();
    },
    nestSearch(){
      this.$refs.nest.show();
    },
    openHost(){
      this.$openHosting();
    },
    commitChatico(){
      this.$refs.pointRef.close();
      this.$store.commit('isChaticoShow')
    },
    commitGym(){
      this.$refs.pointRef.close();
      this.$store.commit('isMarkergymnewShow')
    },
    goHelp(){
      let result = {
             'en-US':"https://www.thinkskysoft.com/itools-mobile-tutorial/",
             'zh-CN':"https://www.thinkskysoft.com/itools-mobile-tutorial-sc/",
             'zh-TW':"https://www.thinkskysoft.com/itools-mobile-tutorial-tc/",
             'ru-RU':"https://ru.thinkskysoft.com/itools-mobile-tutorial/",
             'ko-KR':"https://ko.thinkskysoft.com/itools-mobile-tutorial/",
             'ja-JP':"https://ja.thinkskysoft.com/itools-mobile-tutorial/",
             'de-DE':"https://de.thinkskysoft.com/itools-mobile-tutorial/",
           };
      window.location.href = result[this.currentLanguage]||"https://www.thinkskysoft.com/itools-mobile-tutorial/";
    },
    changeSetting(){
      this.$refs.pointRef.close();
      this.$refs.settingRef.show();
    },
    reloadMap(){
      location.reload()
    },
    /**
     * gpx进度
     * @param {string} filename 文件名
     */
    saveGpxProgress:function()
    {
      if(!this.gpx_file_name)
      {
        return
      }
      let _obj = {
        'progress': this.gpx_progress
      }
      /*
      保存进度的逻辑
      */
      _obj.filename = this.gpx_file_name
      let _jsonStr = JSON.stringify(_obj)
      this.$SyncConfig('gpxProgress',_jsonStr)
    },

    /**
     * 检查gpx进度
     * @param {string} filename 文件名
     */
    checkGpxProgress:function(){
      //gpx进度
      this.$ConfigGet('gpxProgress',(res)=>{
        if(res != '')
        {
          let _json = JSON.parse(res)
          if(_json.hasOwnProperty('progress') && _json.filename == this.gpx_file_name)
          {
            this.$alert({
              'title':this.trans.gpxProgressTitle,
              'content':this.trans.gpxProgressMessage,
              'btns':[this.trans.yes,this.trans.no]
            },()=>{
              this.gpx_progress = parseInt(_json.progress)
              runer.setProgress(_json.progress)
            })
          }
        }
      })
    },
     gpxCallBack(data){
      this.simulationType = 2;
      this.$nextTick(()=>{
        if(this.runIntervalId != null)
        {
          this.$alert({
            'title':this.trans.error,
            'content':this.trans.gpxErrRuning,
            'btns':[this.trans.gotit]
          })
          return ;
        };
        let result = JSON.parse(data)
        this.gpx_file_name = result.name
        this.readGPX(result.content)
      })

    },
    ifIos(){
      return window.osType == 'android'?false:true
    },
    moreWin:function(){
      if(this.subinfo.license == '' && this.idle_pc <= 0)
      {
        this.$refs.subscribe.show()
        return
      }

      if(window.osType == 'pc'){
            try{
              window.LaunchPlugin("locationMultiDev",this.subinfo.license,this.idle_pc)
            }catch(error){}
        }

        if(window.osType == 'mac'){
            try{
              window.external.launchVLPro(this.subinfo.license,this.idle_pc)
            }catch(error){}
        }
    },
    //显示gpx搜索
    cloudShow:function(){
        this.$refs.cloud.show();
    },
    //最小化
    minimizeHandler:function(){
        this.$refs.mpb.show()
    },
    mpchangeHandler:function(pos){
        this.mp_pos = this.$gps.gpsToStr(pos)
    },
    mapZoomIn:function(){
        this.map.zoomIn()
    },
    mapZoomOut:function(){
        this.map.zoomOut()
    },
    IVhandler:function(){
        try{
            if(window.osType == 'pc'){
                window.LaunchPlugin("pmg_ivchecker")
            }else{
                window.external.launchIVChecker()
            }
        }catch(error){}
    },
    findMyPos:function()
    {
        this.map.gotoCurMarker()
    },
    mapInitHandler:function()
    {
        this.isMapInit = true
        this.map = this.$refs.map
        this.map.setAutocompleteInput(this.$refs.LocationAutoComplete)
    },

    goonGpxProgress:function()
    {
        this.$store.commit('setRunPause',false)
        this.progress = this.gpx_progress
    },

    dragenterHandler:function(event)
    {
        event.stopPropagation()
        event.preventDefault()
    },

    dragoverHandler:function(event)
    {
        event.stopPropagation()
        event.preventDefault()
    },

    /*查找点*/
    search_point:function()
    {
        let gps = this.$gps.strTogps(this.input_point)
        if(!gps)
        {
            this.$alert({
                'title':this.trans.error,
                'content':this.trans.searchErrorMessage,
                'btns':[this.trans.gotit]
            })
            return
        }

        //如果是加密过的gps，则解密
        if(/\.\d{9}$/.test(gps.lat) && /\.\d{9}$/.test(gps.lng)){
          gps = this.$gps.decryptPoint(gps.lat,gps.lng,'object')
        }

        //如果是gpx模式或者多点模式，直接飞
        if(this.simulationType == 2)
        {
            //如果正在跑，则停下来
            if(this.runIntervalId != null)
            {
                clearTimeout(this.runIntervalId)
                this.runIntervalId = null;
            }
            this.simulationType = 0
            this.$nextTick(()=>{
                this.map.setPoint(gps)
            })
        }else{
            this.prevLatlng = this.map.getCurMarket()
            this.map.setPoint(gps)
            this.map.setCenter(gps)
        }
        this.input_point = ""
    },

    /*按钮点击加载gpx */
    ImportGpxFile:function()
    {
       this.$refs.pointRef.close()
        //如果当前正在定位正在运行
        if(this.runIntervalId != null)
        {
            this.$alert({
                'title':this.trans.error,
                'content':this.trans.gpxErrRuning,
                'btns':[this.trans.gotit]
            })
            return ;
        }
        this.simulationType = 2
        this.$nextTick(()=>{
          this.$importFile('gpx',(result)=>{
            this.gpx_file_name = result.name
            this.readGPX(result.content)
          },(error)=>{
            this.$alert({
              'title':this.trans.error,
              'content':this.trans.gpxErrFormat,
              'btns':[this.trans.gotit]
            })
          })
        })
    },
    getTextObj(str = ''){
        //第一种格式的。
        let _str = str.replace(/\n/g,'_').replace(/\s/g,'');
        let time = new Date().getTime();
        let jsonObj = {};
        if(_str.indexOf('#')>=0){
        let reg = /&{0,1}[\u4e00-\u9fa5a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_(#[\u4e00-\u9fa5a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_[-]*\d+.\d+,[-]*\d+.-{0,1}\d+_{0,1})+/g;
        let strArr = _str.match(reg);
        let pointReg = /#[\u4e00-\u9fa5_a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_[-]*\d+.\d+,[-]*\d+.\d+_{0,1}/g;
        let titleReg = /&{0,1}[\u4e00-\u9fa5_a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_/;
        let fFlagReg = /^&|_$/g;
        let tFlagReg = /^#/g;
        if(strArr instanceof Array){
          strArr.forEach((item)=>{
            let titleArr = item.match(titleReg);
            let titleName;
            if(titleArr[0].indexOf('&')<0){
              titleName = 'Memorandum';
            }else{
              titleName = titleArr[0].replace(fFlagReg,'');
            }
            let pointArr = item.match(pointReg);
            let arrData = [];
            if(pointArr instanceof Array){
              pointArr.forEach((item)=>{
                let itemArr = item.split('_');
                let latPoint = itemArr[1].split(',')[0];
                let lngPoint = itemArr[1].split(',')[1];
                let _gps = {};
                if(/\.\d{9}$/.test(latPoint) && /\.\d{9}$/.test(lngPoint)){
                  _gps = this.$gps.decryptPoint(latPoint,lngPoint)
                }else{
                  _gps = {
                    lat:latPoint,
                    lng:lngPoint
                  }
                }
                arrData.push({
                  title:itemArr[0].replace(tFlagReg,''),
                  target:titleName,
                  lat:_gps.lat,
                  lng:_gps.lng,
                  time:time
                })
              })
            }

            if(arrData.length>0) jsonObj[titleName] = arrData;
          })
        }
      }else{
        let dataReg = /&{0,1}[\u4e00-\u9fa5a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_(-*\d+.{0,1}\d*,*-*\d+.{0,1}\d*,*[\u4e00-\u9fa5a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_{0,1})+/g;
        let data = _str.match(dataReg);
        let arrData = [];
        if(data instanceof Array){
        data.forEach((item)=>{
          let fFlagReg = /^&|_$/g;
          let tFlagReg = /^#/g;
        let titleReg = /&{0,1}[\u4e00-\u9fa5a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_/;
        let titleStr = item.match(titleReg);
        let titleName = '';
        if(titleStr.length>0){
          item = item.replace(new RegExp("/^"+titleStr),'');
        }
        let contentReg = /(-*\d+.{0,1}\d*,*-*\d+.{0,1}\d*,*[\u4e00-\u9fa5a-zA-Z0-9`~!@$%^*()\-+=<>?:"{}|,.\/;'\\[\]·~！@￥%……*（）——\-+={}|《》？：“”【】、；‘’，。、]+_{0,1})/g;
        let contentStr = item.match(contentReg);
        let time = new Date().getTime();
        let contentArr = [];
        if(titleStr instanceof  Array){
        if(titleStr[0].indexOf('&')<0){
          titleName = 'Memorandum';
        }else{
          titleName = titleStr[0].replace(fFlagReg,'');
        }
          if(contentStr instanceof Array){
            contentStr.forEach((item)=>{
              let itemArr = item.split(',');
              if(itemArr.length == 3&&itemArr[0]&&itemArr[1]&&itemArr[2]!='_'){
                let latPoint = itemArr[0];
                let lngPoint = itemArr[1];
                let _gps = {};
                if(/\.\d{9}$/.test(latPoint) && /\.\d{9}$/.test(lngPoint)){
                  _gps = this.$gps.decryptPoint(latPoint,lngPoint)
                }else{
                  _gps = {
                    lat:latPoint,
                    lng:lngPoint,
                  }
                }
                contentArr.push({
                  title:itemArr[2].replace('_',''),
                  target:titleName,
                  lat:_gps.lat,
                  lng:_gps.lng,
                  time:time
                })
              }
            })
          }
          if(contentArr.length>0) jsonObj[titleName] = contentArr;
        }
      });
        }
      }
      //第二种格式的
      return jsonObj;
    },

    /*读取GPX文件*/
    gpxfileloader:function(event)
    {
        event.stopPropagation()
        event.preventDefault()
        //如果当前正在定位正在运行
        if(this.runIntervalId != null)
        {
            this.$alert({
                'title':this.trans.error,
                'content':this.trans.gpxErrRuning,
                'btns':[this.trans.gotit]
            })
            return ;
        }
        this.simulationType = 2
        let dt = event.dataTransfer
        let files = dt.files
        let __file = files[0]
        //如果是一些二进制文件
        if(/download|image/ig.test(__file.type))
        {
            this.$alert({
                'title':this.trans.error,
                'content':this.trans.gpxErrFormat,
                'btns':[this.trans.gotit]
            })
            return ;
        }
        //保存文件名
        this.gpx_file_name = __file.name
        let reader = new FileReader()
        reader.onload = ()=> {
            this.readGPX(reader.result)
        }
        reader.readAsText(__file)

    },

    readGPX(result){
      if(result.search('<wpt')>=0){
        this.readOldGPX(result);
      }else{
        this.readNewGPX(result);
      }
    },

    /*读取gpx内容 */
    readOldGPX:function(result)
    {
        this.$refs.rocker.holdOff()
        let _xml      = result
        _xml          = _xml.replace(/<!--[^>]+-->/ig,'')
        _xml          = _xml.replace(/^\n/g,"")
        let parser    = new DOMParser()
        let doc       = parser.parseFromString(_xml, "text/xml")
        let wpts      = doc.querySelectorAll('[lat]')
        let _metadata = doc.getElementsByTagName('iToolsData')


        //一个节点也没有||检测坐标系是不是正常的值
        let _reg = /^-*\d+.{1}\d+$/
        if(wpts.length <= 0 || !_reg.test(wpts[0].getAttribute('lon')) || !_reg.test(wpts[0].getAttribute('lat')))
        {
            this.$alert({
                'title':this.trans.error,
                'content':this.trans.gpxErrFormat,
                'btns':[this.trans.gotit]
            })
            return ;
        }

        /*如果是自有文件，解析出速度和循环次数*/
        if(_metadata.length > 0)
        {
            let _speed = parseInt(_metadata[0].getAttribute('speed'))
            let _loop  = parseInt(_metadata[0].getAttribute('loop'))

            if(_speed)
            {
                _speed = _speed > this.maxSpeed ? this.maxSpeed : _speed < 0 ? 0 : _speed
                this.$store.commit('setSpeed',_speed)
            }
            if(_loop)
            {
                _loop = _loop > 0 ? _loop : 0
                this.$store.commit('setCycleModel',_loop)
            }
        }

        //输入的gpx大于一个点，则启用行走模式
        if(wpts.length > 1)
        {
            let _points = []
            for (let i =0; i < wpts.length; i++) {
                let gps = this.$gps.check({
                    lat:wpts[i].getAttribute('lat'),
                    lng:wpts[i].getAttribute('lon')
                })
                if(!gps)
                {
                    continue;
                }
                _points.push(gps)
            }
            this.runPoints(_points)
            this.checkGpxProgress()
        }else{
            /**
             * 只有一个点就瞬移
             */
            //设置当前点位置
            let _gps = this.$gps.check({
                lat:wpts[0].getAttribute('lat'),
                lng:wpts[0].getAttribute('lon')
            })

            if(!_gps)
            {
                this.$alert({
                    'title':this.trans.error,
                    'content':this.trans.gpsError,
                    'btns':[this.trans.gotit]
                })
            }else{
                //清理地图
                this.map.clear()
                this.map.setCurMarketPosition(_gps)

                //设地图中心
                this.map.gotoCurMarker()

                //虚拟定位
                this.NativeSimulateLocationTo(_gps)
            }
        }

    },

    //readGPX  //读取新的格式GPX文件
    // {
    //   Speed:'XXKM/H',
    //   Cycle: 'on(Cycle: off)',
    //   times:'15(times:-1)',
    //   points:[
    //   '35.12456,139.654321,'
    //   '35.12456,139.654321,'
    //   '35.12456,139.654321,'
    //   '35.12456,139.654321,'
    //   '35.12456,139.654321,'
    // ]}
    readNewGPX(result){
      this.$refs.rocker.holdOff()
      let resultData = JSON.parse(result.replace(/\'/g, "\""));
      let points = resultData['points'];
      let _speed = resultData['speed'];                     //转换单位需要
      let _loop  = resultData['cycleCount'] == -1?999:resultData['cycleCount'];

      //一个节点也没有||检测坐标系是不是正常的值
      let _reg = /^-*\d+.{1}\d+$/ //检查坐标点就需要循环检查
      if(points.length <= 0)
      {
        this.$alert({
          'title':this.trans.error,
          'content':this.trans.gpxErrFormat,
          'btns':[this.trans.gotit]
        })
        return ;
      }
        /*如果是自有文件，解析出速度和循环次数*/
        if(_speed)
        {
          _speed = _speed > this.maxSpeed ? this.maxSpeed : _speed < 0 ? 0 : _speed
          this.$store.commit('setSpeed',_speed)
        }
        if(_loop)
        {
          _loop = _loop > 0 ? _loop : 0
          this.$store.commit('setCycleModel',_loop)
        }

      //输入的gpx大于一个点，则启用行走模式
      if(points.length > 1)
      {
        let _points = []
        for (let i =0; i < points.length; i++) {
          let gps = this.$gps.check({
            lat:points[i].split(',')[0],
            lng:points[i].split(',')[1]
          })
          if(!gps)
          {
            continue;
          }
          _points.push(gps)
        }
        this.runPoints(_points)
        this.checkGpxProgress()
      }else{
        /**
         * 只有一个点就瞬移
         */
          //设置当前点位置
        let _gps = this.$gps.check({
            lat:points[i].split(',')[0],
            lng:points[i].split(',')[1]
          })

        if(!_gps)
        {
          this.$alert({
            'title':this.trans.error,
            'content':this.trans.gpsError,
            'btns':[this.trans.gotit]
          })
        }else{
          //清理地图
          this.map.clear()
          this.map.setCurMarketPosition(_gps)

          //设地图中心
          this.map.gotoCurMarker()

          //虚拟定位
          this.NativeSimulateLocationTo(_gps)
        }
      }
    },


    /**
     * 上传路径
     */
    uploadGpxHandler:function(){
        let _data = this.roule.crude.map((item)=>{
            return [item.lng,item.lat]
        })
        this.$http.post('http://vlocapi.thinkskysoft.com/api/v1/upload/add',{
            "token":this.userToken,
            "distiance":(this.roule.distance/1000).toFixed(2),
            "data":_data,
            "type":2
        }).then((response)=>{
            if(response.data.status == true)
            {
                this.$tip({
                    content:this.trans.upgpxsuccess,
                });
            }else{
                this.$tip({
                    content:this.trans.upgpxfail,
                })
            }
        }).catch((error)=>{
            this.$tip({
                content:this.trans.upgpxfail,
            })
        })
    },
    /**
     * 添加收藏
     */
    addFavoriteHandler:function(){
        let _data = this.roule.crude.map((item)=>{
            return [item.lng,item.lat]
        });
        let param = {
          "token":this.userToken,
          "data":_data,
          "type":2,
        };

        param = this.gpxTitle?Object.assign({},param,{'title':this.gpxTitle}):param;

        console.log("是否传了title参数：======="+this.gpxTitle);

        this.$http.post('http://vlocapi.thinkskysoft.com/api/v1/favourate/add',param).then((response)=>{
            if(response.data.status == true)
            {
                this.$tip({
                    content:this.trans.addFavoriteSuccess,
                });
                this.$store.commit('isFavorite',response.data.md5)
                this.$store.commit('CloudFavorite')
            }else{
                this.$tip({
                    content:response.data.errors,
                })
            }
        }).catch((error)=>{
            this.$tip({
                content:this.trans.addFavoriteFail,
            })
        })

    },

    /**
     * 移除收藏
     */
    unFavoriteHandler:function(){
        if(this.isFavorite instanceof Boolean)
        {
            return
        }
        this.$http.get('http://vlocapi.thinkskysoft.com/api/v1/favourate/cancel',{params:{
            "token":this.userToken,
            "md5":this.isFavorite,
            "type":2,
        }}).then((response)=>{
            if(response.data.status == true)
            {
                this.$tip({
                    content:this.trans.unFavoritesSuccess,
                })
                this.$store.commit('CloudFavorite')
                this.$store.commit('isFavorite',false)
            }else{
                this.$tip({
                    content:response.data.errors,
                })
            }

        }).catch((error)=>{
            this.$tip({
                content:this.trans.unFavoritesFail,
            })
        })
    },

    runPoints:function(_points,onlineGpx)
    {
        if(_points.length > 1)
        {
            this.map.drawLine(_points)
            this.map.setCenter(_points[0])
            this.$store.commit('setRunPause',true)
            this.roule = this.map.getRoule()
            onlineGpx?this.$store.commit('setOnlineGpx',true):this.$store.commit('setOnlineGpx',false)
            this.wakeSimulateion()
        }else{
            /**
             * 只有一个点就瞬移
             */

            //设置当前点位置
            let _gps = this.$gps.check({
                lat:_points[0].lat,
                lng:_points[0].lng
            })

            if(!_gps)
            {
                this.$alert({
                    'title':this.trans.error,
                    'content':this.trans.gpsError,
                    'btns':[this.trans.gotit]
                })
            }else{
                //清理地图
                this.map.clear()
                this.map.setCurMarketPosition(_gps)

                //设地图中心
                this.map.gotoCurMarker()

                //虚拟定位
                this.NativeSimulateLocationTo(_gps)
            }
        }
    },

    /*保存gpx文件*/
    saveToGpxFile:function() {
        let xml = this.converPointlistToGPXFile()
        let date = new Date()
        let month = date.getMonth()+1 > 9 ? date.getMonth()+1 : '0'+(date.getMonth()+1)
        let filename = 'mapstogpx'+date.getFullYear()+month+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds()+'.gpx'
        this.gpx_file_name = filename;
        this.$exportFile(xml,filename) //filename
    },

    /*
    将多点路径转换成xml   //废弃的格式，但是导入的时候依然支持这种格式.
    */
    // converPointlistToGPXFile()
    // {
    //     let __list = this.roule.crude
    //     if(__list.length  > 0)
    //     {
    //         let xml = xmlbuilder.create('gpx')
    //         let __n = 1;
    //         xml.ele('iToolsData',{
    //             'speed':this.speed,
    //             'link':'https://www.thinkskysoft.com',
    //             'loop':this.cycleModel
    //         }).ele('rights', 'Copyright (c) 2018, thinkskysoft').up()
    //         __list.map((point)=>{
    //             xml.ele('wpt',{'lat':point.lat,'lon':point.lng}).ele('name',{},'WP'+__n)
    //             __n++
    //         })
    //         xml.end({pretty:true})
    //         return '<?xml version="1.0" encoding="UTF-8" ?>\r\n'+xml
    //     }else{
    //         return ''
    //     }
    // },
      /* 将坐标点转换成文本内容, 新的文件格式
     {
      Speed:'XXKM/H',
      Cycle: 'on(Cycle: off)',
      times:'15(times:-1)',
      points:[
      '35.12456,139.654321,'
      '35.12456,139.654321,'
      '35.12456,139.654321,'
      '35.12456,139.654321,'
      '35.12456,139.654321,'
      ]}
      **/
    converPointlistToGPXFile(){
      let __list = this.roule.crude
      let __json = {
        speed: this.speed,
        cycleModel:1,    //循环模式
        cycleCount:this.cycleModel==999?this.cycleModel:-1,         //循环次数 999的时候使用-1代表次数无限
        cycleTime:0,                        //移动端没有该参数,忽略
        points: __list.map((point)=>{
          return `${point.lat},${point.lng}`
        })
      }
      let __json_str = JSON.stringify(__json,null,4);
      return __json_str
    },

    //return_point
    return_point:function()
    {
        this.map.setCurMarketPosition(this.prevLatlng)
        this.NativeSimulateLocationTo(this.prevLatlng)
        this.map.setCenter(this.prevLatlng)
        this.prevLatlng = false
        this.input_point = ""
    },

    //编辑这个历史坐标
    editHistory:function(obj){
        this.$refs.historyAdd.edit(obj)
    },


    //复制到剪贴板
    clipboard:function(text)
    {
        this.clipboardText = text;
        this.$copyText(this.clipboardText); //去掉加密先

        // this.$copyText(this.$gps.secretPoint(text.split(",")[0],text.split(",")[1],'string'));
    },

    //关闭历史
    history_hide:function()
    {
        this.$refs.history.hide()
    },

    //显示历史
    history_show:function()
    {
        this.$refs.history.isshow ? this.$refs.history.hide() : this.$refs.history.show()
        this.input_point = ''
    },

    //添加历史
    history_add:function()
    {
        this.$refs.historyAdd.show()
    },

    /*摇杆移动*/
    autoMove:function(x,y)
    {
        let _latlng = this.map.getCurMarket()
        _latlng.lat = (_latlng.lat + y).toFixed(9);
        _latlng.lng = (_latlng.lng + x).toFixed(9);
        this.map.setCurMarketPosition(_latlng);
        this.NativeSimulateLocationTo(_latlng);
    },

    /*关闭行走进度*/
    close_run_message:function(bool)
    {
        this.$store.commit('setGpxTitle','')
        this.$store.commit('isFavorite',false)
        this.$store.commit('customRun',true)
        //重置重复次数
        this.$store.commit('setCycleModel',0)
        if(this.runIntervalId){
          clearTimeout(this.runIntervalId)
        }
        this.gpx_progress = this.progress
        this.progress = 0
        //关闭行走，清除掉文件名
        this.saveGpxProgress()

        this.gpx_file_name = false
        this.runIntervalId=null

        //主动调时，不回复到地图中心
        if(bool instanceof MouseEvent){
            this.map.clear(false)
        }else{
            this.map.clear(bool)
        }
    },
    stopSimulationWin(){
      this.$refs.pointRef.close();
      this.$alert({
        'title':this.trans.prompt,
        'content':this.trans.stopSimulation,
        'btns':[this.trans.no,this.trans.yes]
      },()=>{
        this.$alert.close;
      },()=>{
        this.stopSimulation();
      })
    },
    /*停止虚拟定位*/
    stopSimulation:function()
    {
        this.stop_tip_show = true;
        this.$store.commit('stopSim');
        //停止虚拟定位
        this.$gps.NativeStopSimulation()
        if(this.runIntervalId){
          clearTimeout(this.runIntervalId)
        }
        this.runIntervalId = null
    },

    wakeSimulateion:function(obj){
        //直线距离
        this.line_distance      = this.roule.line_distance
        //路径点
        this.point_list         = this.roule.crude
        //总距离
        this.run_total_distance = this.roule.distance
        //行走进度
        this.progress           = 0

        //将路径复制
        runer.init(this.roule.crude)
        //记录行走起始点
        let __first = this.roule.crude[0]
        let is_first_point = true


      const __run = ()=>{
        let vm = this;
          if(vm.runPause){  //暂停时候
            let _t = vm.apiFrequency();
            vm.runIntervalId = setTimeout(__run,_t)
            return
          }
        //速度的单位厘米，需要转换成米
        let point;
          if(!is_first_point){
              point = runer.getNextPoint(vm.speed/100)
            }else{
              point = runer.getPoints()[0]
          }
          is_first_point = false
        //固定时间调用客户端api
            if(vm.$gps.check(point))
            {
                //路径大于1继续行走
                vm.progress = runer.getProgress()
                vm.map.setCurMarketPosition(point)
                vm.NativeSimulateLocationTo(point)
                let _t = vm.apiFrequency();
                vm.runIntervalId = setTimeout(__run,_t)
            }else{
                // //行走完成后，判断重复次数
                if(vm.cycleModel > 0)
                {
                    //重置进度
                    vm.progress = 0

                    //如果是原路折回模式
                    if(vm.repeatModel){
                        runer.resetPoint(true)
                    }else{
                        if(__first.lat != runer.getPoints()[0].lat && __first.lng != runer.getPoints()[0].lng)
                        {
                            runer.resetPoint(true)
                        }else{
                            runer.resetPoint()
                        }
                    }

                    //如果不是无限循环,则递减循环次数
                    if(vm.cycleModel < 999)
                    {
                      vm.$store.commit('setCycleModel',vm.cycleModel-1);
                    }
                    is_first_point = true
                    let _t = vm.apiFrequency();
                    vm.runIntervalId = setTimeout(__run,_t)
                }else{
                    vm.close_run_message();
                    clearTimeout(vm.runIntervalId)
                    vm.$arrived();
                }
            }
        }
        __run()
    },

    //跳转到一个点
    go_to_point:function(latlng,ifSecret)
    {
        latlng = this.$gps.check(latlng)
        if(!latlng)
        {
            this.$alert({
                'title':this.trans.error,
                'content':this.trans.gpsError,
                'btns':[this.trans.gotit]
            })
        }else{
            this.map.setPoint(latlng,ifSecret)
        }
    },

    showPointSelect(){
      this.$refs.pointRef.show();
    },

    /*开始虚拟定位*/
    startSimulation:function()
    {

        //如果是点的模式并且当前没有正在虚拟定位
        if(this.simulationType == 0 && this.runIntervalId == null)
        {
            let latlng = this.map.getImpactMarker()
            this.prevLatlng = this.map.getCurMarket()
            this.map.setCurMarketPosition(latlng)
            this.NativeSimulateLocationTo(latlng)
            this.map.clear()
        }

        //如果是行走模式并且当前没有正在虚拟定位
        if(this.simulationType != 0 && this.runIntervalId == null)
        {
            this.roule = this.map.getRoule()
            this.$store.commit('setOnlineGpx',false)
            this.wakeSimulateion();
        }
    },

    NativeSimulateLocationTo:function(latlng)
    {
        this.$gps.NativeSimulateLocationTo(latlng);
    },

    apiFrequency:function(){
      // return window.ifBackRun?(827 + Math.ceil(Math.random()*(1123 - 827)))/2:827 + Math.ceil(Math.random()*(1123 - 827))
      // return window.ifBackRun?500/2:500
      let _t = 950;// + Math.ceil(Math.random()*(200))
      return _t
    },

  }
}
</script>

<style scoped lang="less">
  .hosting-btn{
    display: block;
    color:#fff;
    background-image:url("../image/hosting_unselected.png");
    background-repeat:  no-repeat;
    background-position:  center center;
    background-size:contain;
    width:28px;
    height: 28px;
    outline:none;
    border-radius:3px;
    &:active{
      background-image:url("../image/hosting_selected.png");
    }
  }
  .left-top{
    text-align: left;
    position: absolute;
    z-index: 9;
    right:5px;
    left:10px;
    top:40px;
    width:40px;
  }
  .help-btn{
    display: block;
    color:#fff;
    background-image:url("../image/what1.png");
    background-repeat:  no-repeat;
    background-position:  center center;
    background-size:contain;
    width:28px;
    height: 28px;
    outline:none;
    border-radius:3px;
    &:active{
      background-image:url("../image/what2.png");
    }
  }
  .min-btn{
    display: block;
    color:#fff;
    background-image:url("../image/min.png");
    background-repeat:  no-repeat;
    background-position:  center center;
    background-size:contain;
    width:28px;
    height: 28px;
    outline:none;
    border-radius:3px;
    &:active{
      background-image:url("../image/min-active.png");
    }
  }
  .language-btn{
    display: block;
    outline:none;
    background-color: #fff;
    background-image:url("../image/Set-up0.png");
    background-repeat:  no-repeat;
    background-position:  center center;
    background-size:contain;
    border-radius:3px;
    width: 28px;
    height: 28px;
    &:active{
      background-image:url("../image/Set-up1.png");
    }
  }
  .activeSpeed{
    display: block;
    color:#fff;
    background-image:url("../image/speed-status.png");
    background-color: #4D90FE!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
    margin-left:5px;
  }
  .defaultSpeed{
    margin-left:5px;
    display: block;
    color:#fff;
    background-image:url("../image/speed-status.png");
    background-color: #ccc!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
  }

  .stop-icon{
    display: block;
    color:#fff;
    background-image:url("../image/stop.png");
    background-color: #4D90FE!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    width:28px;
    height:28px;
  }

  .default-stop-icon{
    display: block;
    color:#fff;
    background-image:url("../image/stop.png");
    background-color: #ccc!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width:28px;
    height:28px;
  }
  .chatico-btn{
    display: block;
    color:#fff;
    background-image:url("../image/chatico-default.png");
    background-size:contain;
    background-color: #4D90FE!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
  }
  .chatico-btn-active{
    background-size:contain;
    display: block;
    color:#fff;
    background-image:url("../image/chatico-active.png");
    background-color: #4D90FE!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
  }
  .gym-btn{
    background-size:contain;
    display: block;
    color:#fff;
    background-image:url("../image/gym-default.png");
    background-color: #4D90FE!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
  }
  .gym-btn-active{
    background-size:contain;
    display: block;
    color:#fff;
    background-image:url("../image/gym-active.png");
    background-color: #4D90FE!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
  }
  .new-btn{
    width:28px;
    height:28px;
    background-color:#ccc;
    display:inline-block;
    color:#fff;
    margin-bottom:10px;
    border-radius:2px;
    &:active{
      background-color: #4D90FE!important;
    }
  }

  .avenger-btn{
    background-size:contain;
    display: block;
    background-image:url("../image/avenger-default.png");
    background-color: #fff!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
  }

  .avenger-btn-active{
    background-size:contain;
    display: block;
    background-image:url("../image/avenger-active.png");
    background-color: #fff!important;
    background-repeat:  no-repeat;
    background-position:  center center;
    margin-bottom: 10px;
    width: 28px;
    height: 28px;
  }


  .icon-nests{
    font-size:30px!important;
    text-align:center;
  }
  .icon-dj{
    font-size:28px!important;
    text-align:center;
    .active{
      background-color: #4D90FE!important;
    }
    &.update-data{
      background-color:red
    }
  }
</style>
