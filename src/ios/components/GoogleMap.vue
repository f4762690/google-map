<template>
    <div>
        <div id="map" ref="GoogleMap"></div>
        <div ref="infoElement" :class=" type == 2 ? 'less-info-element' : 'less-info-element less-info-element-google'" v-show="showInfo">
            <p v-if="type==2" class="less-info-control-group">
              <span class="icon-undo" @click="undo"></span>
              <span @click="minimize" class="icon-minus"></span>
            </p>

            <p>{{trans.coord}}:<b>({{current_position_str}})</b></p>
            <p>{{trans.Distances2}}:{{current_distances}}</p>
            <p>{{trans.cooldown}}:{{cool_time}} {{trans.minute}}</p>
            <!--<p><span @click="$emit('copy',current_position_str)" class='c_link' >{{trans.copyed}}</span></p>-->
            <button class="btn btn-default" @click="$emit('copy',current_position_str)">{{currentText}}</button>
            <button  v-if="!is_cur_market" class="btn btn-default" @click.stop.prevent="moveHere">{{trans.moveHere}}</button>
            <button v-if="is_cur_market" class="btn btn-default" @click.stop.prevent="report">{{trans.report}}</button>
        </div>
        <!--<roundSvg v-if="showRound" ref="roundSvg" :mapcenterXY="mapcenterXY" :size="roundSize"></roundSvg>-->
        <loadingBar v-if="loading"></loadingBar>
    </div>
</template>

<script>
import Vue from 'vue'
import store from '../../store/store'
import { mapState,mapGetters } from 'vuex'
import loadingBar from './loading.vue'
import chatico from '../image/Recharge-station(2).png'
import markergymnew from '../image/Dao-field(2).png'
import newChatico from '../image/new-recharge.gif'
import newMarker from '../image/new-dao.gif'
import { getDisance } from '../lib/ConverPoint'
import roundSvg from './round_svg.vue'
import CustomMarker from '../lib/CustomMarker'
import pokemongoMarker from './pokemongoMarker.vue'
import getCoolTime from '../lib/CoolingTime'

const pokemongoEl = Vue.extend(pokemongoMarker)
const RoundEl = Vue.extend(roundSvg)

export default {
    name: 'google-map',
    props: ['DefaultPosition', 'PointIcon', 'iconA', 'iconB', 'iconEnd', 'type', 'locationInput'],
    data(){
        return {
            //点击的点是否是当前点
            pointsData:[],
            is_cur_market:false,
            current_position:null,
            current_position_str:'',
            isInit:false,
            showInfo:false,
            roule:[],
            impact_point:null,
            loading:true,
            zoomExceed:false,
            isminimize:false,
            markerts:[],
            currentText:'',
            isMapLoad:false,
            pokestopsMarker:{},
            retryInterval:null
        }
    },
    components: { loadingBar },
    computed:{
        cool_time:function(){
          if(!this.isInit || null == this.current_position){
            return ''
          }
          let _distances = google.maps.geometry.spherical.computeDistanceBetween(this.cur_market.position,this.current_position)
          return getCoolTime(_distances)
        },

      //获取起始点到当前点的距离
        current_distances:function()
        {
            if(!this.isInit || null == this.current_position)
            {
                return ''
            }
            let _distances = google.maps.geometry.spherical.computeDistanceBetween(this.cur_market.position,this.current_position)
            if(_distances > 1000)
            {
                _distances = _distances/1000;
                _distances = _distances.toFixed(2)+'km'
            }else{
                _distances = _distances.toFixed(2)+'m'
            }
            return _distances
        },
        ...mapGetters(['trans','isChaticoShow','isMarkergymnewShow',]),
        ...mapState('cooling',['distance','cooling']),
        ...mapState('pokestop',['pokestops'])
    },
    mounted: function(){
        window.__closeAllMarker = this.closeAllMarker;
        this.currentText = this.trans.copyed;
        this.$addQuickKey(['ctrl','space'],()=>{
            if(this.showInfo){
                this.moveHere()
            }
        })

        document.body.addEventListener('click',(e)=>{
          e.stopPropagation();
          if(this.autoCompleteList){
            this.autoCompleteList.style.display = 'none'
          }
        })
      /**初始化地图*/
        const mapinit = ()=>{
            this.$jsonp('https://maps.googleapis.com/maps/api/js', { libraries: 'places,geometry', key: window.google_api_key }).then(() => {
                clearTimeout(this.retryInterval);

                /*创建地图*/
                this.map = new google.maps.Map(this.$refs.GoogleMap, {
                    center: this.DefaultPosition,
                    zoom: 16,
                    disableDefaultUI: true,
                    clickableIcons: false,
                    fullscreenControl: false,
                    streetViewControl: false,
                    scaleControl: true
                });

                //更新地图中心
                this.$store.dispatch('googlemap/upStoreMapcenter',this.DefaultPosition)
                //更新起始点
                this.$store.dispatch('googlemap/upCurPosition',this.DefaultPosition)

                //中心点发生改变事件
                this.map.addListener('idle',()=>{

                  //更新地图状态
                  this.$store.dispatch('googlemap/upZoom',this.map.getZoom())
                  let __latlng = this.map.getCenter()
                  this.$store.dispatch('googlemap/upStoreMapcenter',{
                    lat:__latlng.lat(),
                    lng:__latlng.lng()
                  })

                  this.resetRoundParam()

                  //更新地图标识
                  this.refreshMarker()

                  // 更新道场及补给点信息
                  this.resetBoundsHandler()

                })

                /*地图信息层*/
                this.infowindow = new google.maps.InfoWindow({zIndex:5000});

                /**起始标注*/
                this.cur_market = new google.maps.Marker({
                    map: this.map,
                    zIndex:6000,
                    icon: this.PointIcon,
                    animation: google.maps.Animation.DROP,
                    anchorPoint: new google.maps.Point(0,-29),
                    position: this.DefaultPosition
                })
                this.cur_market.setVisible(true)
                this.cur_market.addListener('click',(e)=>{
                    this.is_cur_market = true
                    this.current_position = this.cur_market.position
                    this.setCurrentPositionStr()
                    this.set_info_window(this.cur_market)
                })

                this.impact_point = new google.maps.Marker({
                    map: this.map,
                    icon: this.iconEnd,
                    zIndex: 9,
                    animation: google.maps.Animation.DROP,
                    anchorPoint: new google.maps.Point(0,-29)
                })
                this.impact_point.addListener('click',(e)=>{
                    this.is_cur_market = false
                    this.current_position = this.impact_point.position
                    this.setCurrentPositionStr()
                    this.set_info_window(this.impact_point)
                })

                //地图点击事件
                this.map.addListener('click', (e) => {
                    this.setPoint(e.latLng)
                });

                //视图改变事件
                // this.map.addListener("idle",this.resetBoundsHandler)
                // let throttleMethod = this.$util.throttle(this.resetRoundParam,5000)
                // this.map.addListener('bounds_changed',this.resetRoundParam)
                this.isInit = true
                this.loading = false
                this.$emit('init')

                this.mapZoom = this.map.getZoom()

                this.isMapLoad = true

                //添加自定义标注
                this.round_svg = this.$custom_marker(this.cur_market.getPosition(),this.map,new RoundEl())
                //
                // this.$custom_marker(this.cur_market.getPosition(),this.map,new pokemongoEl({
                //   data:{
                //     'type':'raid',
                //     'pet_id':305,
                //     'is_vip': 2,
                //     'num1': 5,
                //     'start': 1543887768,
                //     'duration': 45
                //   }
                // }))

            }).catch(err => {
              this.loading = false;
              this.retryInterval = setInterval(()=>{
                mapinit()
              },10000);
              this.retryInterval();
            })
        }
        mapinit()
    },
    watch:{
      isChaticoShow(){
        this.$nextTick(()=>{
          this.resetBoundsHandler()
        })
      },
      isMarkergymnewShow(){
        this.$nextTick(()=>{
          this.resetBoundsHandler()
        })
      },
      //巢穴、100iv、团战、田野发生变化
      'pokestops': function(){
        let raidPoints = [];
        if(this.map && this.map.getZoom() >= 16){
          //清除区域外的点
          for(let i in this.pokestopsMarker){
            if(!this.pokestops.hasOwnProperty(i)){
              this.pokestopsMarker[i].setMap()
              delete(this.pokestopsMarker[i])
            }
          }
          //更新区域内未添加的点
          for(let i in this.pokestops){
            debugger
            if(!this.pokestopsMarker.hasOwnProperty(i)){
              let pointStr = this.pokestops[i].lat+ ','+ this.pokestops[i].lng;
              if(this.pokestops[i]['genre'] == 'gym'){ //收集团战坐标
                raidPoints.push(pointStr)
              }
            }
          }

          for(let i in this.pokestops){
            if(!this.pokestopsMarker.hasOwnProperty(i)){
              let pointStr = this.pokestops[i].lat+ ','+ this.pokestops[i].lng;
              if(this.pokestops[i]['genre'] == "gyminfo" && raidPoints.indexOf(pointStr)>-1){

              }else{
                let _latlng = new google.maps.LatLng(this.pokestops[i].lat,this.pokestops[i].lng);
                this.pokestopsMarker[i] = this.$custom_marker(_latlng,this.map,new pokemongoEl({
                  store,
                  data:this.pokestops[i]
                }))
                }
            }
          }


        }
      }
    },
    methods: {
        closeAllMarker: function(){
          for(let i in this.pokestopsMarker){
            this.pokestopsMarker[i].el.popshow = false
          }
        },
        //更新地图标识
        refreshMarker: function(){

          this.$store.dispatch('pokestop/refresh')

        },
        //转换点
        setCurrentPositionStr(ifSecret)
        {
            if(this.current_position != null)
            {
                if(ifSecret){ //加密
                  this.currentText = this.trans.copyed1;
                  this.current_position_str = this.$gps.secretPoint(this.current_position.lat().toFixed(6),this.current_position.lng().toFixed(6),'string');
                }else{
                  this.currentText = this.trans.copyed;
                  this.current_position_str = this.current_position.lat().toFixed(6) + ',' + this.current_position.lng().toFixed(6)
                }
            }
        },
        //设置范围动画
        resetRoundParam:function(){
          let __zoom = this.map.getZoom()

          if(__zoom > 16){
            //改变圈圈大小
            let __metersPerPx = 156543.03392 * Math.cos(this.cur_market.getPosition().lat() * Math.PI / 180) / Math.pow(2, __zoom)
            this.round_svg.el.setActive(true)
            this.round_svg.el.setSize(1/__metersPerPx*30)
          }else{
            this.round_svg.el.setActive(false)
            this.round_svg.el.setSize(30)
          }
        },
        report(){    //使用websocket获取数据
          let vm = this,
              chaticoNum =0,
              markerNum =0;
          if(!!!this.isChaticoShow && !!!this.isMarkergymnewShow){
            return
          }
          let __pos = (this.isChaticoShow && this.isMarkergymnewShow) ? 0 :
            (this.isChaticoShow && !this.isMarkergymnewShow) ? 1 :
              (!this.isChaticoShow && this.isMarkergymnewShow) ? 2 : 0
          vm.infowindow.close()
          vm.$Indicator.open()
          let lng = vm.current_position.lng().toFixed(6),
              lat = vm.current_position.lat().toFixed(6),
              distance = 1000,
              url1 = "http://vlocapi.thinkskysoft.com/api/v1/user/report",
              url2 = "http://vlocapi.thinkskysoft.com/api/v1/location/near";
          vm.$http.get(url1,{
            params:{
              lng:lng,
              lat:lat,
              distance:distance,
            }
          }).then((response)=>{
            console.log("第一个请求成功");
          })

          this.$alert({
            'title':'',
            'content':this.trans.gymInfo,
            'btns':[this.trans.confirmContent]
          })

          setTimeout(()=>{
            vm.$http.get(url2,{params:{
                "pos":__pos,
                "lng":lng,
                "lat":lat,
                "distance":distance,
                "detail":1,
              }}).then((response)=>{
              vm.$Indicator.close();
              if(response.data.status == true){
                let dataList = response.data.data.data;
                dataList.map((item)=>{
                      let noExist = true;
                      this.markerts.forEach((existItem)=>{
                        if(item['poke_id'] == existItem['poke_id']){
                          noExist = false
                          return;
                        }
                      });
                      if(noExist){
                        let latlng = new google.maps.LatLng(item.lat, item.lng),
                          icon;
                        if(item.pos == 1){
                          icon = newChatico
                          chaticoNum ++
                        }else{
                          icon = newMarker
                          markerNum++
                        }
                        let _marker = new google.maps.Marker({
                          map: vm.map,
                          icon: icon,
                          anchorPoint: new google.maps.Point(0,-29),
                          clickable:false,
                        })
                        _marker.$pos = item.pos
                        _marker['poke_id'] = item.poke_id
                        _marker.setPosition(latlng,vm.map)
                        vm.markerts.push(_marker)
                        setTimeout(() => {
                          icon = item.pos == 1 ? chatico : markergymnew
                          _marker.setIcon(icon)
                        },3000) ; //3秒后替换点闪烁gif
                      }
                })
                this.$tip({
                  content:`<p>${this.trans.newGyms} :${chaticoNum}</p><p>${this.trans.newPokeStops} :${markerNum}</p>`
                });

                !!this.__parentData ? this.__parentData.push(...dataList) : this.__parentData = dataList
              }
            })
          },2000) //爬虫需要2秒钟
        },
        /**
         * 获取当前视图下，切分网格数，网格最大为1公里
         */
        __getBoundsLength:function(ne,sw,zoom){
          let __pc_width  = window.innerWidth
          let __pc_height = window.innerHeight
          let __b         = getDisance(ne.lat(),ne.lng(),sw.lat(),sw.lng())
          let __s         = Math.sqrt(Math.pow(__pc_width,2) + Math.pow(__pc_height,2))
          let __px        = __s/Math.round(__b/(Math.pow(2,24-zoom)))
          let __length_x  = Math.round(__pc_width/__px)
          let __length_y  = Math.round(__pc_height/__px)

          let __lat = (ne.lat() - sw.lat())/__length_x
          let __lng = (ne.lng() - sw.lng())/__length_y
          let __points = []
          for(let __i=0; __i<__length_x; __i++)
          {
            for(let __j=0; __j<__length_y;__j++)
            {
              __points.push({
                lat: sw.lat() + (__lat*__i+__lat/2),
                lng: sw.lng() + (__lng*__j+__lng/2),
                dis: Math.pow(2,24-zoom)
              })
            }
          }
          return __points
        },
        /**
         * 视图发生改变触发
         * 获取道场和补给点数据，显示在地图上
         */
        resetBoundsHandler:function(){
          if(!this.map){
            return
          }
          let bounds = this.map.getBounds()
          //东北
          let ne = bounds.getNorthEast()

          //西南
          let sw = bounds.getSouthWest()
          //清除market,发生缩放就清除
          if(!!this.markerts && this.markerts.length > 0 && this.mapZoom != this.map.getZoom()){
            this.markerts.map((item)=>{
              if(item instanceof google.maps.Marker)
              {
                item.setMap(null)
              }
            })
            this.markerts = []
            this.mapZoom = this.map.getZoom()
            //缩放发生改变则清空历史
            this.__parentData = []
          }
          //判断缩放级别
          if(this.map.getZoom() < 14)
          {
            //超过则显示警告，并且不再请求
            if(!this.zoomExceed){
              this.$tip({
                'content':this.trans.mapZoomTip,
              })
            }
            this.zoomExceed = true
          }else{
            this.zoomExceed = false
          }
          //检查图标状态
          if(!this.isChaticoShow ){
            this.markerts.map((item,index)=>{
              if(item.$pos == 1){
                item.setVisible(false)
                item.setMap(null)
              }
            })
            if(!!this.__parentData)
            {
              this.__parentData = this.__parentData.filter(item=>item.pos != 1)
            }
          }
          if(!this.isMarkergymnewShow ){
            this.markerts.map((item,index)=>{
              if(item.$pos == 2){
                item.setVisible(false)
                item.setMap(null)
              }
            })
            if(!!this.__parentData){
              this.__parentData = this.__parentData.filter(item=>item.pos != 2)
            }
          }

          //如果不显示，或者超过缩放级别，则不请求
          if((!this.isChaticoShow && !this.isMarkergymnewShow) || this.zoomExceed){
            this.markerts = []
            return
          }
          let __points = this.__getBoundsLength(ne,sw,this.map.getZoom())
          let __data = []
          __points.map((item)=>{
            __data.push([item.lng,item.lat])
          })
          //取数据
          this.pointsData = __data;
          let __pos = (this.isChaticoShow && this.isMarkergymnewShow) ? 0 :
            (this.isChaticoShow && !this.isMarkergymnewShow) ? 1 :
              (!this.isChaticoShow && this.isMarkergymnewShow) ? 2 : 0
          this.$http.post('http://vlocapi.thinkskysoft.com/api/v1/location/batch',{
            'pos':__pos,
            'detail':1,
            'distance':200,
            'limit': 10,
            'data':__data
          }).then((response)=>{
            if(response.data.status == true)
            {
              if(response.data.data.data instanceof Array){
                let __add = []
                response.data.data.data.map((item)=>{
                  //遍历已存在的点，如果当前位置有则不创建新的marker
                  let __hasMarker = false
                  if(!!this.__parentData && this.__parentData.length > 0)
                  {
                    this.__parentData.map((__parentItem)=>{
                      if(__parentItem.lat == item.lat && __parentItem.lng == item.lng){
                        __hasMarker = true
                      }
                    })
                  }
                  if(!__hasMarker){
                    if((item.pos == 1 && this.isChaticoShow) || (item.pos == 2 && this.isMarkergymnewShow)){
                      __add.push(item)
                    }
                  }

                })
                //只有该位置没有创建过marker
                  __add.map((item)=>{
                  let latlng = new google.maps.LatLng(item.lat, item.lng)
                  let icon = item.pos == 1 ? chatico : markergymnew
                  let _marker = new google.maps.Marker({
                    map: this.map,
                    icon: icon,
                    anchorPoint: new google.maps.Point(0,-29),
                    clickable:false,
                  })
                  _marker['poke_id'] = item.poke_id; //用于后面比较重复
                  _marker.$pos = item.pos
                  _marker.setPosition(latlng,this.map)
                  this.markerts.push(_marker)
                })
                //将新加入的点放入历史
                !!this.__parentData ? this.__parentData.push(...__add) : this.__parentData = __add
              }
            }
          })
        },
      //多点模式下，撤销当前点
        undo:function(){
            if(this.roule.length > 0 && this.type == 2 && this.$parent.runIntervalId == null)
            {
                let item = this.roule[this.roule.length-1]
                this.roule.splice(this.roule.length-1,1)
                if(this.roule.length > 1)
                {
                    this.roule[this.roule.length-1].setIcon(this.iconB)
                }
                if(item instanceof google.maps.Marker)
                {
                    item.setMap(null)
                }

                this.__drawLine(this.roule.map((item)=>{
                    return item.position
                }))
                //抛出一个事件
                this.$emit('mpchange',{
                    lat:this.roule[this.roule.length-1].position.lat(),
                    lng:this.roule[this.roule.length-1].position.lng()
                })
            }

            if(this.roule.length <= 0)
            {
                this.isminimize = false
                this.$parent.$refs.mpb.hide()
            }
        },
        //最小化
        minimize:function(){
            this.infowindow.close()
            this.isminimize = true
            this.$emit('minimize')
        },
        //最大化
        maximize:function(){
            this.isminimize = false
            if(this.roule.length > 0)
            {
                this.set_info_window(this.roule[this.roule.length-1])
            }
        },
        zoomIn:function(){
            let zoom = this.map.getZoom()
            this.map.setZoom(zoom+1)
        },
        zoomOut:function(){
            let zoom = this.map.getZoom()
            this.map.setZoom(zoom-1)
        },
        setAutocompleteInput:function(locationInput)
        {
            this.autoCompleteList = document.createElement('ul')
            this.autoCompleteList.className = 'less-autocomplete'
            locationInput.parentElement.appendChild(this.autoCompleteList)
            this.autoCompleteList.style.display = 'none'
            this.autoCompleteList.addEventListener('mouseleave',(e)=>{
                e.target.style.display = 'none'
            })
            this.AutocompleteService = new google.maps.places.AutocompleteService()
            this.PlacesService = new google.maps.places.PlacesService(this.map)
        },

        locationSearch:function(location)
        {
            this.AutocompleteService.getQueryPredictions({ input: location }, (results, status) => {
                if(!results)
                {
                    return
                }
                this.autoCompleteList.innerHTML = ""
                results.map((item)=>{
                    let _li = document.createElement('li')
                    _li.className = 'icon-location'
                    _li.innerHTML = "<p><b>"+item.structured_formatting.main_text+"</b><span>"+item.structured_formatting.secondary_text+"</span></p>"
                    _li.addEventListener('click',()=>{
                        this.PlacesService.getDetails({placeId:item.place_id},(response,status)=>{
                            if(response.hasOwnProperty('geometry'))
                            {
                                this.setPoint(response.geometry.location)
                            }
                        })
                        this.autoCompleteList.innerHTML = ""
                        this.autoCompleteList.style.display = 'none'
                    })
                    this.autoCompleteList.appendChild(_li)
                })

                this.autoCompleteList.style.display = 'block'
            })
        },

        getRoule:function()
        {
            let _p = this.roule.map((item)=>{
              if((item instanceof google.maps.Marker) || item.hasOwnProperty('position')){
                    return {
                        lat:item.position.lat(),
                        lng:item.position.lng()
                    }
                }else{
                    return {
                        lat:item.lat(),
                        lng:item.lng()
                    }
                }
            })
            // return _p
            return this.$ConverPoint(_p)
        },

        //画一条线段，并且带有起始点
        drawLine:function(points)
        {
            /**
             * 谷歌api只接受google.maps.LatLng对象，得转换一遍
             */
            let _latlng = points.map((item) => {
                return new google.maps.LatLng(item.lat, item.lng)
            })
            this.roule = _latlng
            if(this.marketA)
            {
                this.marketA.setPosition(_latlng[0])
            }else{
                this.marketA = this.createMarket(_latlng[0],this.iconA)
            }

            if(this.marketB)
            {
                this.marketB.setPosition(_latlng[_latlng.length-1])
            }else{
                this.marketB = this.createMarket(_latlng[_latlng.length-1],this.iconB)
            }
            this.__drawLine(_latlng)
        },

        __drawLine:function(points)
        {
            if(this.flightPath)
            {
                this.flightPath.setMap()
            }
            /*画出路径*/
            this.flightPath = new google.maps.Polyline({
                path: points,
                geodesic: true,
                strokeColor: '#f13d6c',
                strokeOpacity: 1.0,
                strokeWeight: 6
            })
            this.flightPath.setMap(this.map)
        },


        //回到当前点
        gotoCurMarker:function()
        {
            this.map.setCenter(this.cur_market.position)
        },

        moveHere:function()
        {
            if(this.roule.length <= 0 && this.type != 0)
            {
                return
            }
            this.$emit('moveHere')
            this.infowindow.close()
            this.isminimize = false
            this.$parent.$refs.mpb.hide()
        },

        /*清除多标记以及线段*/
        clear:function(bool)
        {
            let n = 0
            this.roule.map((item)=>{
                if(item instanceof google.maps.Marker)
                {
                    item.setMap(null)
                }
            })
            this.roule = []
            if(this.impact_point)
            {
                this.impact_point.setVisible(false)
            }
            if(this.marketA)
            {
                this.marketA.setMap(null)
                this.marketA = null
            }
            if(this.marketB)
            {
                this.marketB.setMap(null)
                this.marketB = null
            }
            if(this.flightPath)
            {
                this.flightPath.setMap(null)
                this.flightPath=null
            }
            this.infowindow.close()
            if(this.directionsDisplay)
            {
                this.directionsDisplay.setMap(null)
                this.directionsDisplay = null
            }
            if(!bool)
            {
                this.map.setCenter(this.cur_market.position)
            }

            this.isminimize = false
            try{
              this.$parent.$refs.mpb.hide()
            }catch(error){

            }
        },

      /**
       * 在地图重绘一条路径
       * @param { array } path 路径数组
       */
        newPath:function(path){
          this.clear(true)
          path.map( ( _latlng, index ) => {
            let icon = this.iconEnd
            if(index == 0){
              icon = this.iconA
            }
            if(index == path.length-1){
              icon = this.iconB
            }
            let __market = this.createMarket(_latlng,icon)
            this.roule.push(__market)

          })
          //画线
          this.__drawLine(this.get_roule_position())
        },


      /**设置一个点*/
        setPoint:function(_latlng,ifSecret)
        {

            this.$store.commit('setMyLocation',_latlng)
            //google位置对象
            if(!(_latlng.lat instanceof Function))
            {
                _latlng = new google.maps.LatLng(_latlng.lat, _latlng.lng)
            }

            //如果当前正在定位正在运行
            if(this.$parent.runIntervalId != null)
            {
                this.$alert({
                    'title':this.trans.error,
                    'content':this.trans.gpxErrRuning,
                    'btns':[this.trans.gotit]
                })
                return ;
            }
            this.map.setCenter(_latlng)

            /**多个自定义点*/
            if(this.type == 2)
            {
                //the first market's icon is A and that position is copyed from cur_markert
                if(this.roule.length <= 0)
                {
                    this.roule.push(this.createMarket(this.cur_market.position,this.iconA))
                }
                let __market = this.createMarket(_latlng,this.iconB)

                //最后一个点显示为B
                if(this.roule.length > 1)
                {
                    this.roule[this.roule.length-1].setIcon(this.iconEnd)
                }

                //如果是最小化状态，不要显示出信息框
                if(!this.isminimize)
                {
                    this.current_position = __market.position
                    this.setCurrentPositionStr(ifSecret);
                    this.is_cur_market = false
                    this.set_info_window(__market)
                }

                //抛出一个事件
                this.$emit('mpchange',{
                    lat:__market.position.lat(),
                    lng:__market.position.lng()
                })

                //将点加入列表
                this.roule.push(__market)

                //画线
                this.__drawLine(this.get_roule_position())
            }

            /**瞬移模式*/
            if(this.type != 2)
            {
              console.log("这里触发1");
              this.impact_point.setPosition(_latlng)
                this.current_position = this.impact_point.position
                this.setCurrentPositionStr(ifSecret);
                this.is_cur_market = false
                this.impact_point.setVisible(true)
                this.set_info_window(this.impact_point)
            }

            /**导航模式，画出导航路线*/
            if(this.type == 1)
            {
              console.log("这里触发2");
                this.clear(true)
                this.impact_point.setVisible(true)
                this.set_info_window(this.impact_point)
                this.calcRoute()
            }
        },

        /*返回多点标点的位置*/
        get_roule_position()
        {
            let __position_list = [];
            this.roule.map((market)=>{ __position_list.push(market.position) });
            return __position_list;
        },

        //创建一个点
        createMarket:function(latLng,icon)
        {
            if(undefined == icon)
            {
                icon = this.iconEnd
            }
            let __market = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                icon: icon,
                anchorPoint: new google.maps.Point(0,-29)
            });
            __market.setPosition(latLng, this.map)
            __market.addListener('click',()=>{
                this.current_position = __market.position
                this.setCurrentPositionStr()
                this.is_cur_market = false
                this.set_info_window(__market)
            })
            return __market
        },

        //获取目标点坐标
        getImpactMarker:function()
        {
            return {
                lat:this.impact_point.position.lat(),
                lng:this.impact_point.position.lng()
            }
        },

        //获取当前点坐标
        getCurMarket:function()
        {
            return {
                lat:this.cur_market.position.lat(),
                lng:this.cur_market.position.lng()
            }
        },

        //设置当前点的坐标
        setCurMarketPosition:function(latlng)
        {
          if(this.type == 0)
          {
            this.$store.commit('setMyLocation',latlng)
          }
          this.$store.dispatch('googlemap/upCurPosition',latlng)
          let _latlng = new google.maps.LatLng(latlng.lat, latlng.lng);
          this.cur_market.setPosition(_latlng)

          //改变范围动画位置
          this.round_svg.setPosition(_latlng)
        },

        setCenter:function(latlng)
        {
            let _latlng = new google.maps.LatLng(latlng.lat, latlng.lng);
            this.map.setCenter(_latlng)
        },

        /**计算路径*/
        calcRoute:function()
        {
            if(!this.cur_market || !this.impact_point)
            {
                return ;
            }
            /*导航*/
            this.directionsService = new google.maps.DirectionsService()
            this.directionsDisplay = new google.maps.DirectionsRenderer()
            this.directionsDisplay.setMap(this.map);
            this.roule = []
            var request = {
                origin: this.cur_market.position,
                destination: this.impact_point.position,
                travelMode: google.maps.TravelMode['WALKING']
            };
            this.directionsService.route(request, (response, status) => {
              console.log("status:"+status);
                if (status == 'OK') {
                    this.directionsDisplay.setDirections(response);
                    let roule = response.routes[0].legs[0].steps;
                    for(var i=0,max=roule.length;i<max;i++)
                    {
                        for(var j=0,m=roule[i].path.length;j<m;j++)
                        {
                            this.roule.push({position:roule[i].path[j]});
                        }
                    }
                }else{
                    this.$alert({
                        'title':this.trans.error,
                        'content':this.trans.tooFar,
                        'btns':[this.trans.gotit]
                    })
                }
            })
        },

        //设置信息层
        set_info_window:function(market)
        {
            this.showInfo = true
            this.infowindow.setContent(this.$refs.infoElement);
            this.infowindow.open(this.map, market);
        },
    },
}
</script>
