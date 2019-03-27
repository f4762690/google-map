<template>
    <div class="less-gpx-list">
        <div class="row labels">
            <span @click="sortName" class="name">Name<i class="icon-sort"></i></span>
            <span @click="sortGyms" class="stops">Stops&Gyms<i class="icon-sort"></i></span>
            <span @click="sortDis" class="distance">Distance<i class="icon-sort"></i></span>
            <span @click="sortMaker" class="author">Maker<i class="icon-sort"></i></span>
        </div>

        <div v-if="list.data.length > 0" class="list">
            <p @click="$emit('gpxgo',{data:item.data,md5:item.md5,order:item.order})" class="row" v-for="(item,index) in list.data" :key="index">
                <span class="name">{{item.title}}</span>
                <span class="stops">{{item.stop_count}}</span>
                <span class="distance">{{(getDistance(item.data)/1000).toFixed(2)}}km</span>
                <span class="author">{{item.author}}</span>
            </p>
        </div>

        <p v-if="list.data.length <= 0" style="text-align:center;color:#999;padding:2em 0;">No data</p>

        <div v-if="list.page>1" class="pages">
            <span :class="list.cur == p ? 'active' : ''" v-for="p in list.page" :key="p" @click="$emit('pageChange',p)">{{p}}</span>
        </div>

        <loading ref='loading' :visible="false"></loading>
    </div>
</template>

<script>
import loading from './loading.vue'
import { mapState } from 'vuex'
export default {
    name: 'gpx-list',
    data(){
        return {
            sn:false,
            sg:false,
            sd:false,
            sm:false
        }
    },
    props:['list'],
    components:{loading},
    computed:{
      ...mapState('googlemap',['curPosition'])
    },
    methods:{
        getDistance(data){
          let points = [];
          data.map(item=>{
            points.push({
              lat:item[0],
              lng:item[1]
            })
          });
          return this.$ConverPoint(points).distance
        },
        ShowLoading:function(){
            this.$refs.loading.show()
        },
        HideLoading:function(){
            this.$refs.loading.hide()
        },
        sortName:function(){
            this.list.data.sort((a,b)=>{
                if(this.sn){
                    return String(a.title) < String(b.title) ? 1 : -1
                }else{
                    return String(a.title) < String(b.title) ? -1 : 1
                }
            })
            this.sn = !this.sn
        },
        sortGyms:function(){
            this.list.data.sort((a,b)=>{
                if(this.sg){
                    return parseInt(a.stop_count) < parseInt(b.stop_count) ? 1 : -1
                }else{
                    return parseInt(a.stop_count) < parseInt(b.stop_count) ? -1 : 1
                }
            })
            this.sg = !this.sg
        },
        sortDis:function(){
            this.list.data.sort((a,b)=>{
                if(this.sd){
                    return parseFloat(a.distiance) < parseFloat(b.distiance) ? 1 : -1
                }else{
                    return parseFloat(a.distiance) < parseFloat(b.distiance) ? -1 : 1
                }
            })
            this.sd = !this.sd
        },
        sortMaker:function(){
            this.list.data.sort((a,b)=>{
                if(this.sm){
                    return String(a.maker) < String(b.maker) ? 1 : -1
                }else{
                    return String(a.maker) < String(b.maker) ? -1 : 1
                }
            })
            this.sm = !this.sm
        },
    }
}
</script>
