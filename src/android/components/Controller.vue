<template>
  <div id="app" @drop="gpxfileloader" @dragover="dragoverHandler" @dragenter="dragenterHandler" >
    <!--位置列表、搜索-->
    <div id="pac-input" class="controls" v-show="isMapInit" @mouseleave="history_hide">
        <div class="icon-filter_drama" @click="cloudShow"></div>
        <div class="icon-list" @click="history_show"></div>
        <input id="location-input" ref="LocationAutoComplete" @keyup.enter="search_point" v-model="input_point" type="text" :placeholder="trans.enterLoc">
        <div class="icon-floppy-disk" @click="history_add"></div>
        <button v-show="false === prevLatlng" id="go-button" class="controls" @click="search_point">{{this.trans.go}}</button>

        <btn v-show="false !== prevLatlng" id="return-button"
        :msg="trans.returnLeft+'<br/>'+ prevLatlngStr + '<br/>'+trans.returnRight"
        :action="return_point">{{this.trans.return}}</btn>

        <history @editHistory="editHistory" ref="history" @importFile="ImportGpxFile"></history>
        <cloud ref="cloud"></cloud>
    </div>

    <!--保存点-->
    <historyAdd ref="historyAdd"></historyAdd>

    <!--右下按钮-->
    <div id="my-pos">
        <btn v-show="runIntervalId!= null" :action="()=>{ifZoom = !ifZoom}" class="controls import-gpx-file icon-minus" :type="'icon'" :pos="'left'"></btn>
        <btn :action="!isStop ? stopSimulation : ()=>{}" :pos="'left'" :type="'icon'" :class="isStop?'stop-icon':'default-stop-icon'"></btn>
        <btn v-if="hasMoreWin" :action="moreWin" class="controls import-gpx-file" :type="'icon'" :pos="'left'" ><span style="font-size:1.2em" class="icon-files-empty"></span></btn>
        <btn v-if="$parent.hasIVChecker" :action="IVhandler" class="controls import-gpx-file" :type="'icon'" :pos="'left'" >IV</btn>
        <btn :action="ImportGpxFile" class="controls import-gpx-file" :type="'icon'" :pos="'left'" >GPX</btn>
        <btn :action="mapZoomIn" class="controls import-gpx-file" style="margin:0;border-bottom:1px solid #eee" :type="'icon'" :pos="'left'">+</btn>
        <btn :action="mapZoomOut" class="controls import-gpx-file" :type="'icon'" :pos="'left'">-</btn>
        <btn :action="findMyPos" class="controls my-pos" :type="'icon'" :pos="'left'"></btn>
    </div>

    <MPB ref="mpb"
    :pos="mp_pos"
    @copy="clipboard"
    ></MPB>

    <!--停止定位时信息-->
    <div id="stop-tip" v-show="stop_tip_show" class="controls" >{{trans.restartForNormal}}</div>

    <!--control menu-->
    <div id="con-group" v-show="isMapInit">
        <btn :action="()=>{showSpeed = !showSpeed}" class="controls" :class="showSpeed?'activeSpeed':'defaultSpeed'" :type="'icon'" :pos="'left'"></btn>
        <map_btn :icon="p_to_p" :type="0" :simulationType="simulationType" :pos="'left'"></map_btn>
        <map_btn :icon="line" :type="1" :simulationType="simulationType" :pos="'left'"></map_btn>
        <map_btn :icon="m_point" :type="2" :simulationType="simulationType" :pos="'left'"></map_btn>
        <!--<btn :action="()=>{ifShowHelp = !ifShowHelp}" class="controls" :msg="trans.findMe" :class="ifShowHelp?'activeSpeed':'defaultSpeed'" :type="'icon'" :pos="'left'"></btn>-->
      <!--帮助-->
        <!--<btn :action="()=>{showSpeed = !showSpeed}" class="controls" :msg="trans.findMe" :class="showSpeed?'activeSpeed':'defaultSpeed'" :type="'icon'" :pos="'left'"></btn>-->
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
    v-show="runIntervalId != null&&!ifZoom"
    @zoomWin="()=>{ifZoom = true}"
    @save="saveToGpxFile"
    @upload="uploadGpxHandler"
    @addFavorite="addFavoriteHandler"
    @unFavorite="unFavoriteHandler"
    ></run_message>

    <!--速度控制-->
    <speedBar id="speedBar" ref="speedBar" v-show="showSpeed" ></speedBar>

    <!--免费时长-->
    <div class="trial-time" v-if="TrialTime != 999999999">
        <p>Free trial-time</p>
        <p>{{Remaining}}</p>
    </div>
    <help-guide :if-show="ifShowHelp" :action="()=>{ ifShowHelp = false}"></help-guide>
    <!--订阅框-->
    <subscribe ref="subscribe"></subscribe>
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

export default {
  name: 'App',
  components:{ run_message, rocker, speedBar, tip, history, historyAdd, MPB, cloud, subscribe, helpGuide, },
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
    ...mapGetters(['idle_pc','maxSpeed','license','subinfo','hasMoreWin','speed','isFavorite','cycleModel','runPause','trans','isStop', 'wakeSpeed', 'rockerSpeed', 'morePointSpeed', 'TrialTime', 'Remaining', 'version', 'my_location', 'repeatModel', 'userToken'])
  },

  mounted:function(){
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

    //检测文件进度
    gpx_file_name:function(val,old)
    {
        let _obj = {
            'progress': this.gpx_progress
        }

        /*
        保存进度的逻辑
        */
        if(val == false && old)
        {
            _obj.filename = old
            let _jsonStr = JSON.stringify(_obj)
            this.$SyncConfig('gpxProgress',_jsonStr)
        }

        if(val && old == false)
        {
            //gpx进度
            this.$ConfigGet('gpxProgress',(res)=>{
                if(res != '')
                {
                    let _json = JSON.parse(res)
                    if(_json.hasOwnProperty('progress') && _json.filename == val)
                    {
                        this.gpx_progress = parseInt(_json.progress)
                        this.$alert({
                            'title':this.trans.gpxProgressTitle,
                            'content':this.trans.gpxProgressMessage,
                            'btns':[this.trans.yes,this.trans.no]
                        },()=>{
                            this.goonGpxProgress()
                        })
                    }
                }
            })
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
        this.$store.commit('setMyLocation',_latlng)
        if(this.runIntervalId){
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
            break;

            case 1:
                this.$store.commit('setSpeed',this.wakeSpeed)
            break;

            case 2:
                this.$store.commit('setSpeed',this.morePointSpeed)
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
        this.$refs.cloud.show()
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
                'content':this.trans.searchErrorMessage+this.input_point,
                'btns':[this.trans.gotit]
            })
            return
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
            this.input_point = ""
        }
    },

    /*按钮点击加载gpx */
    ImportGpxFile:function()
    {
        this.simulationType = 2
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
    },

    /*读取GPX文件*/
    gpxfileloader:function(event)
    {
        event.stopPropagation()
        event.preventDefault()
        this.simulationType = 2
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

    /*读取gpx内容 */
    readGPX:function(result)
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

    /**
     * 上传路径
     */
    uploadGpxHandler:function(){
        let _data = this.roule.crude.map((item)=>{
            return [item.lng,item.lat]
        })
        console.log("输出一下token:${this.userToken}");
        this.$http.post('http://vlocapi.thinkskysoft.com/api/v1/upload/add',{
            "token":this.userToken,
            "distiance":(this.roule.distance/1000).toFixed(2),
            "data":_data,
            "type":2
        }).then((response)=>{
            console.log(`查看数据返回情况:${response.data.status}`);
            if(response.data.status == true)
            {
                this.$tip({
                    content:this.trans.upgpxsuccess,
                })
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
        })
        this.$http.post('http://vlocapi.thinkskysoft.com/api/v1/favourate/add',{
            "token":this.userToken,
            "distiance":(this.roule.distance/1000).toFixed(2),
            "data":_data,
            "type":2,
        }).then((response)=>{
            if(response.data.status == true)
            {
                this.$tip({
                    content:this.trans.addFavoriteSuccess,
                })
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

    runPoints:function(_points)
    {
        if(_points.length > 1)
        {
            this.map.drawLine(_points)
            this.map.setCenter(_points[0])
            this.$store.commit('setRunPause',true)
            this.roule = this.map.getRoule()
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
        this.$exportFile(xml,filename)
    },

    /*
    将多点路径转换成xml
    */
    converPointlistToGPXFile()
    {
        let __list = this.roule.crude
        if(__list.length  > 0)
        {
            let xml = xmlbuilder.create('gpx')
            let __n = 1;
            xml.ele('iToolsData',{
                'speed':this.speed,
                'link':'https://www.thinkskysoft.com',
                'loop':this.cycleModel
            }).ele('rights', 'Copyright (c) 2018, thinkskysoft').up()

            __list.map((point)=>{
                xml.ele('wpt',{'lat':point.lat,'lon':point.lng}).ele('name',{},'WP'+__n)
                __n++
            })
            xml.end({pretty:true})
            return '<?xml version="1.0" encoding="UTF-8" ?>\r\n'+xml
        }else{
            return ''
        }
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
        this.$copyText(text);
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
        this.gpx_file_name = false
        this.runIntervalId=null

        //主动调时，不回复到地图中心
        if(bool instanceof MouseEvent){
            this.map.clear(false)
        }else{
            this.map.clear(bool)
        }
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
          if(vm.runPause){
            vm.runIntervalId = window.ifBackRun?setTimeout(__run,250):setTimeout(__run,500)
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
                vm.runIntervalId = window.ifBackRun?setTimeout(__run,250):setTimeout(__run,500)
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
                    vm.runIntervalId = window.ifBackRun?setTimeout(__run,250):setTimeout(__run,500)
                }else{
                    vm.close_run_message();
                    vm.$arrived();
                }
            }
        }
        __run()
    },



    //跳转到一个点
    go_to_point:function(latlng)
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
            this.map.setPoint(latlng)
        }
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
            this.wakeSimulateion();
        }
    },

    NativeSimulateLocationTo:function(latlng)
    {
        this.$gps.NativeSimulateLocationTo(latlng);
    }

  }
}
</script>

<style scoped lang="less">
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
</style>
