<template>
    <div>
        <div id="map" ref="MapBox"></div>
        
        <div ref="infoElement" class="less-info-element less-info-element-mapbox" v-show="showInfo">
            <p v-if="type==2" class="less-info-control-group-mapbox"><span @click="undo" class="icon-undo"></span><span @click="minimize" class="icon-minus"></span></p>
            <p>{{trans.coord}}:<b>({{current_position_str}})</b></p>
            <p v-if="!is_cur_market">{{trans.Distances2}}:{{current_distances}}</p>
            <p><span @click="$emit('copy',current_position_str)" class='c_link' >{{trans.copyed}}</span></p>
            <p v-if="!is_cur_market"><button class="btn btn-default" @click="moveHere">{{trans.moveHere}}</button></p>
        </div>
        
        <loadingBar v-if="loading"></loadingBar>
    </div>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { mapGetters } from 'vuex'
import loadingBar from './loading.vue'
/**初始化地图*/
mapboxgl.accessToken = window.mapbox_api_key

/**增加方法设置 market显示和隐藏 */
mapboxgl.Marker.prototype.setVisible = function(bool){
    let _element = this.getElement()
    if(bool)
    {
        _element.style.display = 'block'
    }else{
        _element.style.display = 'none'
    }
}
/**设置market icon */
mapboxgl.Marker.prototype.setIcon = function(img){
    let element = this.getElement()
    element.src = img
}

/*增加方法设置侦听事件*/
mapboxgl.Marker.prototype.addListener = function(event,call){
    let _element = this.getElement()
    let _self = this
    _element.addEventListener(event,function(e){
        e.lnglat = _self.getLngLat()
        call(e)
        e.stopPropagation()
    })
}

export default {
    name: 'google-map',
    props: ['DefaultPosition', 'PointIcon', 'iconA', 'iconB', 'iconEnd', 'type', 'locationInput'],
    components: { loadingBar },
    data(){
        return {
            //点击的点是否是当前点
            is_cur_market:false,
            current_position:null,
            isInit:false,
            showInfo:false,
            roule:[],
            impact_point:null,
            locations:[],
            loading:true,
            isminimize:false
        }
    },
    computed:{
        //转换点
        current_position_str:function()
        {
            if(this.current_position != null && this.current_position.hasOwnProperty('lat'))
            {
                return parseFloat(this.current_position.lat).toFixed(6) + ',' + parseFloat(this.current_position.lng).toFixed(6)
            }
            if(this.current_position instanceof Array){
                return this.current_position[0].toFixed(6) + ',' + this.current_position[1].toFixed(6)
            }
            return ''
        },
        //获取起始点到当前点的距离
        current_distances:function()
        {
            if(null == this.current_position )
            {
                return ''
            }
            let _curMarketPosition = this.cur_market.getLngLat()
            let _distances = this.$getDisance(_curMarketPosition.lat,_curMarketPosition.lng,this.current_position.lat,this.current_position.lng)
            _distances = parseFloat(_distances)
            if(_distances > 1000)
            {
                _distances = _distances/1000;
                _distances = _distances.toFixed(2)+'km'
            }
            if(_distances < 1000){
                _distances = _distances.toFixed(2)+'m'
            }
            return _distances
        },
        _def_lnglat:function()
        {
            return [this.DefaultPosition.lng, this.DefaultPosition.lat]
        },
        ...mapGetters(['trans'])
    },
    watch:{
        DefaultPosition:function(val){
            if(false != val){
                this.showMap()
            }
        }
    },

    mounted:function(){
        if(this.DefaultPosition != false){
            this.showMap()
        }
        this.$addQuickKey(['ctrl','space'],()=>{
            if(this.showInfo){
                this.moveHere()
            }
        })
    },
   
    methods: {
        showMap:function(){
            /*创建地图*/
            this.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v9',
                center: this._def_lnglat,
                zoom: 16
            })
            this.map.on('load',()=>{
                this.loading = false
            })
            this.mapinit()
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
                if(item instanceof mapboxgl.Marker)
                {
                    item.remove()
                }

                this.__drawLine(this.roule.map((item)=>{
                    let lnglat = item.getLngLat()
                    return [lnglat.lng,lnglat.lat]
                }))

                //抛出一个事件
                let __p = this.roule[this.roule.length-1].getLngLat()

                this.$emit('mpchange',__p)
            }

            if(this.roule.length <= 0)
            {
                this.isminimize = false
                this.$parent.$refs.mpb.hide()
            }
        },
        //最小化
        minimize:function(){
            this.infowindow.remove()
            this.isminimize = true
            this.$emit('minimize')
        },
        //最大化
        maximize:function(){
            this.isminimize = false
            if(this.roule.length > 0)
            {
                let lnglat = this.roule[this.roule.length-1].getLngLat()
                this.current_position = lnglat
                this.infowindow.setLngLat(lnglat)
                .setDOMContent(this.$refs.infoElement)
                .addTo(this.map)
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
        mapinit:function()
        {
            //地图点击事件
            this.map.on('click',(e)=>{
                this.setPoint(e.lngLat)
            })
            
            this.infowindow = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false
            })

            this.impact_point = this.createMarket(this._def_lnglat,this.iconEnd)
            this.impact_point.setVisible(false)
            this.impact_point.addListener('click',(e)=>{
                this.is_cur_market = false
                e.stopPropagation()
            })
            
            /**当前点 */
            this.cur_market = this.createMarket(this._def_lnglat,this.PointIcon)
            this.cur_market.addListener('click',(e)=>{
                this.is_cur_market = true
                e.stopPropagation()
            })

            this.current_position = this.DefaultPosition

            this.isInit = true
            this.$emit('init')
        },

        /**
         * 地名搜索自动完成
         * @param locationInput 一个input dom
         */
        setAutocompleteInput:function(locationInput)
        {
            this.autoCompleteList = document.createElement('ul')
            this.autoCompleteList.className = 'less-autocomplete'
            locationInput.parentElement.appendChild(this.autoCompleteList)
            this.autoCompleteList.style.display = 'none'
            this.autoCompleteList.addEventListener('mouseleave',(e)=>{
                e.target.style.display = 'none'
            })
        },

        locationSearch:function(val)
        {
            let _word = encodeURIComponent(val)
            let _api = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+_word+'.json?access_token='+window.mapbox_api_key
            this.$http.get(_api).then((response)=>{
                
                //处理返回数据，渲染成列表，并且显示出来
                let locations = response.data.features
                if(locations.length <= 0)
                {
                    return 
                }
                this.autoCompleteList.innerHTML = ""
                locations.map((item)=>{
                    let _li = document.createElement('li')
                    _li.className = 'icon-location'
                    _li.innerHTML = "<p><b>"+item.text+"</b><span>"+item.place_name+"</span></p>"
                    _li.addEventListener('click',()=>{
                        this.autoCompleteList.innerHTML = ""
                        this.autoCompleteList.style.display = 'none'
                        this.setPoint(item.center)
                    })
                    this.autoCompleteList.appendChild(_li)
                })

                this.autoCompleteList.style.display = 'block'

            },(error) => {
                
            })

        },

        getRoule:function()
        {
           let _p = this.roule.map((item)=>{
                if(item.hasOwnProperty('lng'))
                {
                    return {
                        lat:item.lat,
                        lng:item.lng
                    }
                }else{
                    let _lnglat = item.getLngLat()
                    return {
                        lat:_lnglat.lat,
                        lng:_lnglat.lng
                    }
                }
            })
            // return _p
            return this.$ConverPoint(_p)
        },

        moveHere:function()
        {
            this.isminimize = false
            this.$parent.$refs.mpb.hide()
            this.$emit('moveHere')
            this.infowindow.remove()
        },

        /*清除多标记以及线段*/
        clear:function(bool)
        {
            let n=0
            this.roule.map((item)=>{
                if(item instanceof mapboxgl.Marker)
                {
                    item.remove()
                }
            })
            if(this.marketA)
            {
                this.marketA.remove()
                this.marketA = null
            }
            if(this.marketB)
            {
                this.marketB.remove()
                this.marketB = null
            }
            this.__drawLine([])
            this.roule = []
            let _lnglat = this.cur_market.getLngLat()
            this.impact_point.setVisible(false)
            this.infowindow.remove()
            if(!bool){
                this.map.setCenter(_lnglat)
            }
            this.isminimize = false
            this.$parent.$refs.mpb.hide()
        },

        /*搜索框自动完成，跳转事件*/
        place_changed_hander:function(event)
        {
            
        },

        //回到当前点
        gotoCurMarker:function()
        {
            this.map.setCenter(this.cur_market.getLngLat())
        },

        /**设置一个点*/
        setPoint:function(lnglat)
        {

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

            this.current_position = lnglat
            this.is_cur_market = false
            this.showInfo = true
            
            if(this.type !=2)
            {
                this.infowindow.setLngLat(lnglat)
                .setDOMContent(this.$refs.infoElement)
                .addTo(this.map)
            }else{
                if(!this.isminimize)
                {
                    this.infowindow.setLngLat(lnglat)
                    .setDOMContent(this.$refs.infoElement)
                    .addTo(this.map)
                }
            }
            
            this.map.setCenter(lnglat)

            /**瞬移模式*/
            if(this.type != 2)
            {
                this.impact_point.setVisible(true)
                this.impact_point.setLngLat(lnglat)

            }

            if(this.type == 2)
            {
                if(this.roule.length <= 0)
                {
                    this.roule.push(this.createMarket(this.cur_market.getLngLat(),this.iconA))
                }
                let _market = this.createMarket(lnglat,this.iconB)
                if(this.roule.length > 1)
                {
                    this.roule[this.roule.length-1].setIcon(this.iconEnd)
                }
                this.roule.push(_market)
                
                let _position = this.roule.map((item)=>{
                    let _latlng = item.getLngLat()
                    return [_latlng.lng,_latlng.lat]
                })
                //抛出一个事件
                this.$emit('mpchange',lnglat)
                this.__drawLine(_position)
            }

            /**导航模式，画出导航路线*/
            if(this.type == 1)
            {
                let _start = this.cur_market.getLngLat()
                this.calcRoute(_start,lnglat,(_roule)=>{
                    this.roule = _roule.map((item)=>{
                        return {
                            lng:item[0],
                            lat:item[1]
                        }
                    })
                    this.__drawLine(_roule)
                })
            }
        },

        /**
         * 开放接口，父组件传递坐标序列，画出路线和起始点
         * @param points {lat:xxx,lng:xxx}
        */
        drawLine:function(points)
        {
            let lnglats = points.map((item)=>{
                return [item.lng,item.lat]
            })
            if(this.marketA)
            {
                this.marketA.setLngLat(lnglats[0])
            }else{
                this.marketA = this.createMarket(lnglats[0],this.iconA)
            }
            

            if(this.marketB)
            {
                this.marketB.setLngLat(lnglats[lnglats.length - 1])
            }else{
                this.marketB = this.createMarket(lnglats[lnglats.length - 1],this.iconB)
            }
            
            this.roule = points
            this.__drawLine(lnglats)
        },


        /**
         * 画出一条线
         * @param _position mapbox's gps value, the format like [lng,lat]
         */
        __drawLine:function(_position){
            
            let geojson = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates":_position
                    }
                }]
            }
            let json = {
                "id": "route",
                "type": "line",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "LineString",
                            "coordinates": _position
                        }
                    }
                },
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": {
                    "line-color": "#f13d6c",
                    "line-width": 6
                }
            }
            let layer = this.map.getLayer('route')
            if(undefined != layer)
            {
                this.map.getSource('route').setData(geojson)
            }else{
                this.map.addLayer(json)
            }

        },

        //创建一个点
        createMarket:function(lnglat,icon)
        {
            let el = document.createElement('img')
            el.src = icon
            el.style.cursor="default"
            el.style.marginTop = "-13px"
            let _market = new mapboxgl.Marker(el)
            .setLngLat(lnglat)
            .addTo(this.map)

            _market.addListener('click',(e)=>{
                this.showInfo = true
                let lnglat = e.lnglat
                this.current_position = lnglat
                this.infowindow.setLngLat(lnglat)
                .setDOMContent(this.$refs.infoElement)
                .addTo(this.map)
            })

            return _market
        },

        //获取目标点坐标
        getImpactMarker:function()
        {
           let _lnglat = this.impact_point.getLngLat()
           return {
               lat:_lnglat.lat,
               lng:_lnglat.lng
           }
        },

        //获取当前点坐标
        getCurMarket:function()
        {
           let _lnglat = this.cur_market.getLngLat()
           return {
               lat:_lnglat.lat,
               lng:_lnglat.lng
           }
        },

        //设置当前点的坐标
        setCurMarketPosition:function(lnglat)
        {
            if(this.type == 0)
            {
                this.$store.commit('setMyLocation',lnglat)
            }
            this.cur_market.setLngLat([lnglat.lng,lnglat.lat])
            
        },

        setCenter:function(lnglat)
        {
            this.map.setCenter([lnglat.lng,lnglat.lat])
        },

        /**计算路径*/
        calcRoute:function(start,end,call)
        {
            let directionsRequest = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start.lng + ',' + start.lat + ';' + end.lng + ',' + end.lat + '?geometries=geojson&access_token=' + window.mapbox_api_key
            this.$http.get(directionsRequest).then((response)=>{
                if(response.data.hasOwnProperty('routes') && response.data.routes.length > 0)
                {
                    let route = response.data.routes[0].geometry
                    call(route.coordinates)
                }else{
                    this.$alert({
                        'title':this.trans.error,
                        'content':this.trans.tooFar,
                        'btns':[this.trans.gotit]
                    })
                }
            },(error) => {
                this.$alert({
                    'title':this.trans.error,
                    'content':this.trans.tooFar,
                    'btns':[this.trans.gotit]
                },()=>{
                    this.clear()
                })
            })
        },

        //设置信息层
        set_info_window:function(lnglat)
        {
            this.infowindow.setLngLat(lnglat)
            .setDOMContent(this.$refs.infoElement)
            .add(this.map)
        },
    },
}
</script>
