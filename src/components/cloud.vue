<template>
    <div class="less-cloud-wrap" v-show="isshow">
        <div class="less-cloud-tit">Advanced GPX <span @click="hide" class="icon-x-square"></span></div>

        <div class="less-cloud-label">
            <span @click="nearbyInit" :class=" type==3 ? 'active' : ''">{{trans.nearby}}</span>
            <span @click="favoriteInit" :class=" type==2 ? 'active' : ''">{{trans.favorites}}</span>
            <span @click="searchInit" :class=" type==1 ? 'active' : ''">{{trans.search}}</span>
        </div>

        <div v-show="type==3">
            <div class="less-cloud-nearby-form">
                <input type="number" class="less-range-input" v-model="dis" :placeholder="trans.nearbyInputMsg" />
                <button @click="nearbySearch" class="btn btn-default">{{trans.generate}}</button>
            </div>
            <div class="less-cloud-nearby-form-type">
                <label> <input type="radio" name="near_type" value="0" v-model="near_type" /> All</label>
                <label> <input type="radio" name="near_type" value="1" v-model="near_type" /> Stops</label>
                <label> <input type="radio" name="near_type" value="2" v-model="near_type" /> Gyms</label>
            </div>

            <div class="less-cloud-nearby-result">
                <loading :visible="false" ref="nearbyLoading" :style="'background:rgba(255,255,255,0.5)'" ></loading>
                <div v-if="CloudNearbyResult.stop_count > 0 && !nodata && !isDisError && !reshide">
                    <div class="result">
                        <p>
                            <span v-if="near_type == 0" v-html="trans.stops_gyms"></span>
                            <span v-if="near_type == 1" v-html="trans.stops"></span>
                            <span v-if="near_type == 2" v-html="trans.gyms"></span>
                            <br/>{{CloudNearbyResult.stop_count}}
                        </p>
                        <p>{{trans.length}}<br/>{{CloudNearbyResult.distiance}}km</p>
                    </div>
                    <button @click="gpxgoHandler(CloudNearbyResult.data,true)" class="btn btn-default">{{trans.apply_it}}</button>
                </div>

                <div class="result" v-if="(nodata || CloudNearbyResult.stop_count <= 0) && !reshide">
                    {{trans.nodata}}
                </div>

                <div class="result" style="text-align:center" v-if="isDisError">
                    {{trans.nearErrorInput}}
                </div>
            </div>
        </div>

        <div v-show="type==2">
            <gpxlist ref="favorite" @gpxgo="favoriteGpxgoHandler" v-show="type==2" :list="CloudFavoriteResult" @pageChange="FavoritePageChange"></gpxlist>
        </div>

        <!--<div v-show="type==1">
            <gpxlist ref="favorite" @gpxgo="gpxgoHandler" v-show="type==1" :list="CloudFavoriteResult" @pageChange="FavoritePageChange"></gpxlist>
        </div>-->

        <!-- <gpxlist ref="nearby" @gpxgo="gpxgoHandler" :list="CloudNearbyResult" @pageChange="NearbyPageChange"></gpxlist> -->

        <div v-show="type==1">
            <div class="less-cloud-search-form">
                <button  class="btn btn-white" @click="choseLocation">{{ chooseText=='' ? 'Choose location' : chooseText }}<span class="icon-chevron-down"></span></button>
                <!--<location ref="locationRef" @choose="chooseHandler" :param="locationData"></location>-->
                <location @choose="chooseHandler"></location>
                <!-- <input type="text" class="less-range-input" placeholder="Maker" /> -->
                <author ref="author"></author>
                <button @click="search" style="flex:1" class="btn less-cloud-search"><span class="icon-search"></span>Search</button>
            </div>
            <gpxlist ref="search" @gpxgo="searchGpxgoHandler" :list="CloudSearchResult" @pageChange="SearchPagechange"></gpxlist>
        </div>

        <!--<gpxlist ref="favorite" @gpxgo="gpxgoHandler" v-show="type==2" :list="CloudFavoriteResult" @pageChange="FavoritePageChange"></gpxlist>-->

    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import gpxlist from './gpxlist.vue'
import loading from './loading.vue'
import { sortPoints } from '../lib/sortPoints'
// import location from './base/location.vue'
import location from './location.vue'
import author from './author.vue'

export default {
    name: 'gpx-cloud',
    data(){
        return {
            locationData:{},
            type:3,
            isshow:false,
            dis:'',
            nodata:false,
            near_type:0,
            reshide:true
        }
    },
    created(){
      this.$http.get('http://vlocapi.thinkskysoft.com/api/v1/city/index').then((response)=>{
        this.locationData = response.data
      })
    },
    components:{ loading, gpxlist, location, author },
    computed:{
        isDisError:function(){
            return this.dis != '' && (this.dis < 1 || this.dis > 5000) ? true : false
        },
        ...mapGetters(['speed','CloudSearchResult','CloudFavoriteResult','CloudNearbyResult','isPointChange','trans'])
    },
    watch:{
        dis:function(){
            // this.nodata = false
        },
        near_type:function(val)
        {
            this.reshide = true
        }
    },
    methods:{
        choseLocation(){
          this.$refs.locationRef.show();
        },
        chooseHandler:function(val)
        {
            this.searchVal = val
        },
        show:function()
        {
            this.isshow = true
        },
        hide:function()
        {
            this.isshow = false
        },
        search:function()
        {

                this.SearchPagechange(1)

        },

        /**
         * 搜索接口
         */
        searchInit:function(){
            this.type = 1
        },

        /**
         * 收藏，只有初始化时拉取数据
         */
        favoriteInit:function(){
            this.type = 2
            this.FavoritePageChange(1)
        },

        /**
         * 附近的gpx
         * 只有当前点发生改变，才会触发去重新拉取数据
         */
        nearbyInit:function(){
            this.type = 3
            // if(this.isPointChange || this.CloudNearbyResult.data.length <= 0)
            // {
            //     this.NearbyPageChange(1)
            // }
        },

        /**
         * 搜索页发生页码跳转
         */
        SearchPagechange:function(page){
            this.$refs.search.ShowLoading()
            this.$store.commit('CloudSearch',{
                limit:10,
                p:page,
                city:this.searchVal ? this.searchVal.city : '',
                author:this.$refs.author.chooseText,
                errorCall:()=>{
                    this.$refs.search.HideLoading()
                    this.$alert({
                        'title':'fail',
                        'content':'no data',
                        'btns':['Got it']
                    })
                },
                successCall:(res)=>{
                    this.$refs.search.HideLoading()
                },
                ...this.$parent.map.getCurMarket()
            })
        },

        /**
         * 收藏页发生页码跳转
         */
        FavoritePageChange:function(page){
            this.$refs.favorite.ShowLoading()
            this.$store.commit('CloudFavorite',{
                errorCall:()=>{
                    this.$refs.favorite.HideLoading()
                    this.$tip({
                        'content':this.trans.nodata,
                    })
                },
                successCall:(res)=>{
                    this.$refs.favorite.HideLoading()
                }
            })
        },

        /**
         * 附近点发生页码跳转
         */
        NearbyPageChange:function(page){
            this.$refs.nearbyLoading.show()
            this.$store.commit('CloudNearby',{
                limit:10,
                p:page,
                city:'shengzhen',
                errorCall:()=>{
                    this.$refs.nearbyLoading.hide()
                    this.$tip({
                        'content':this.trans.nodata,
                    })
                },
                successCall:(res)=>{
                    this.$refs.nearbyLoading.show()
                },
                ...this.$parent.map.getCurMarket()
            })
        },

        /**
         * 网络错误提示
         */
        netErrorCall:function(){},

        searchGpxgoHandler:function(points){
            //为0是要连线
            if(points.order == 0){
                points = sortPoints(points.data,{
                    lat:this.CloudSearchResult.center.lat,
                    lng:this.CloudSearchResult.center.lng
                })

            }else{
                points = points.data
            }
            if(points.length > 0)
            {
                points = points.map((item)=>{
                    return {
                        lng:item[0],
                        lat:item[1]
                    }
                })
            }
            //清除时不发生更改地图中心点
            this.$parent.close_run_message(true)
            this.$nextTick(()=>{
                this.$parent.runPoints(points)
            })
        },

        /**
         * 画出点
         * @param points 点的序列
         * @param bool 是否对点排序
         */
        gpxgoHandler:function(points,bool)
        {
            if(bool)
            {
                //进行排序
                points = sortPoints(points,this.$parent.map.getCurMarket())
            }
            if(points.length > 0)
            {
                points = points.map((item)=>{
                    return {
                        lng:item[0],
                        lat:item[1]
                    }
                })
            }
            this.$store.commit('customRun',false)
            //清除时不发生更改地图中心点
            this.$parent.close_run_message(true)
            this.$nextTick(()=>{
                this.$parent.runPoints(points)
            })
        },

        /**
         * 收藏列表点击 事件
         */
        favoriteGpxgoHandler:function(data,bool){
            this.gpxgoHandler(data.data,bool)
            this.$store.commit('isFavorite',data.md5)
        },

        nearbySearch:function()
        {
            if(this.dis<0 || this.dis>5000){
                return;
                this.nodata = true
            }
            this.$refs.nearbyLoading.show()
            this.$store.commit('CloudNearby',{
                distance:this.dis,
                pos:this.near_type,
                errorCall:()=>{
                    this.$refs.nearbyLoading.hide()
                    this.nodata = true
                },
                successCall:(res)=>{
                    if(res.data.length <= 0)
                    {
                        this.nodata = true
                    }
                    this.nodata = false
                    this.reshide = false
                    this.$refs.nearbyLoading.hide()
                },
                ...this.$parent.map.getCurMarket()
            })
        }
    }
}
</script>
