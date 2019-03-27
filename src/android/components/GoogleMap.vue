<template>
    <div>
        <div id="map" ref="GoogleMap"></div>

        <div ref="infoElement" :class=" type == 2 ? 'less-info-element' : 'less-info-element less-info-element-google'" v-show="showInfo">
            <p v-if="type==2" class="less-info-control-group"><span class="icon-undo" @click="undo"></span><span @click="minimize" class="icon-minus"></span></p>
            <p>{{trans.coord}}:<b>({{current_position_str}})</b></p>
            <p>{{trans.Distances2}}:{{current_distances}}</p>
            <!--<p><span @click="$emit('copy',current_position_str)" class='c_link' >{{trans.copyed}}</span></p>-->
            <p><button class="btn btn-default" @click="$emit('copy',current_position_str)">{{trans.copyed}}</button></p>
            <p v-if="!is_cur_market"><button class="btn btn-default" @click="moveHere">{{trans.moveHere}}</button></p>
        </div>

        <loadingBar v-if="loading"></loadingBar>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import loadingBar from './loading.vue'

export default {
    name: 'google-map',
    props: ['DefaultPosition', 'PointIcon', 'iconA', 'iconB', 'iconEnd', 'type', 'locationInput'],
    data(){
        return {
            //点击的点是否是当前点
            is_cur_market:false,
            current_position:null,
            isInit:false,
            showInfo:false,
            roule:[],
            impact_point:null,
            loading:true,
            isminimize:false
        }
    },
    components: { loadingBar },
    computed:{
        //转换点
        current_position_str:function()
        {
            if(this.current_position != null)
            {
                return this.current_position.lat().toFixed(6) + ',' + this.current_position.lng().toFixed(6)
            }
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
        ...mapGetters(['trans'])
    },
    mounted: function(){
        this.$addQuickKey(['ctrl','space'],()=>{
            if(this.showInfo){
                this.moveHere()
            }
        })
        /**初始化地图*/
        const mapinit = ()=>{
            this.$jsonp('https://maps.googleapis.com/maps/api/js', { libraries: 'places,geometry', key: window.google_api_key }).then(() => {


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

                /*地图信息层*/
                this.infowindow = new google.maps.InfoWindow();

                /**起始标注*/
                this.cur_market = new google.maps.Marker({
                    map: this.map,
                    icon: this.PointIcon,
                    animation: google.maps.Animation.DROP,
                    anchorPoint: new google.maps.Point(0, -29)
                })
                this.cur_market.setPosition(this.DefaultPosition)
                this.cur_market.setVisible(true)
                this.cur_market.addListener('click',(e)=>{
                    this.is_cur_market = true
                    this.current_position = this.cur_market.position
                    this.set_info_window(this.cur_market)
                })

                this.impact_point = new google.maps.Marker({
                    map: this.map,
                    icon: this.iconEnd,
                    animation: google.maps.Animation.DROP,
                    anchorPoint: new google.maps.Point(0, -29)
                })
                this.impact_point.addListener('click',(e)=>{
                    this.is_cur_market = false
                    this.current_position = this.impact_point.position
                    this.set_info_window(this.impact_point)
                })

                //地图点击事件
                this.map.addListener('click', (e) => {
                    this.setPoint(e.latLng)
                });
                this.isInit = true
                this.loading = false
                this.$emit('init')


            }).catch(err => {
                this.loading = false
                this.$alert({
                    title:"Map load fail",
                    content:"",
                    btns:['Try again']
                },()=>{
                    mapinit()
                })
            })
        }
        mapinit()
    },
    methods: {
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
                            // console.log(response)
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
            this.$parent.$refs.mpb.hide()
        },


        /**设置一个点*/
        setPoint:function(_latlng)
        {
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
                this.impact_point.setPosition(_latlng)
                this.current_position = this.impact_point.position
                this.is_cur_market = false
                this.impact_point.setVisible(true)
                this.set_info_window(this.impact_point)
            }

            /**导航模式，画出导航路线*/
            if(this.type == 1)
            {
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
                anchorPoint: new google.maps.Point(0, -29)
            });
            __market.setPosition(latLng, this.map)
            __market.addListener('click',()=>{
                this.current_position = __market.position
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
            let _latlng = new google.maps.LatLng(latlng.lat, latlng.lng);
            this.cur_market.setPosition(_latlng)
            this.infowindow.close()


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
