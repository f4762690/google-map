<template>
  <li @click.stop.prevent="getDetail" v-if="ifShow">
              <span class="pets-icon">
                <img :src="nestImgPrefix+parseInt(item.pokemon_id)+'.png'" class="pet-img"><br>
                {{item.name}}
                <img v-if="item.is_shiny == 1" src="../../image/shiny.png" class="shiny_wrap">
              </span>
              <span>
                <div class="t-content flag-img-wrap"><img :src="getFlag(item.country)" class="flag-wrap"></div>
                <div class="b-content" style="overflow:hidden">{{item.city}}</div>
              </span>
              <span>
                <div class="t-content text-left o-h"><i class="t-wrap"><img class="time-icon" :src="'./static/images/TIME.png'"/></i><span>{{findTime}}m</span></div>
                <div class="b-content text-left o-h"><i class="t-wrap"><img class="time-icon" :src="'./static/images/STOP.png'"/></i><span>{{$getCoolTime($getDisance(item.lat,item.lng,curPosition.lat,curPosition.lng)) }}m</span></div>
              </span>
              <span class="icon-target" @click.stop.prevent="goPoint" :class="{'active':item.ifClick}"></span>
  </li>
</template>

<script>
    import { mapState,mapGetters } from 'vuex';
    export default {
        name: "wildItem",
        data(){
          return {
            ifShow:true,
            timeoutID:null,
            findTime:0,
          }
        },
        mounted(){
          this.calFindTime();
        },
        computed:{
          ...mapState('googlemap',['curPosition']),
          ...mapGetters(['petsName','flagPrefix','flags','nestImgPrefix','titleLang']),
          ...mapGetters('wild',['clickPoint']),
        },
        methods:{
          goPoint(){
            let result = [...this.clickPoint,this.item._id];
            this.$store.commit('wild/setClickPoint',result);
            this.$emit('goPoint',{item:this.item,index:this.index})
          },
          calFindTime(){
            this.timeoutID = setTimeout(()=>{
              this.calFindTime()
            },1000)
            let _confirmed = Date.now()/1000 - this.item.last_modified;
            this.findTime  = _confirmed < 60?'<1':Math.ceil(_confirmed/60);
          },
          getDetail(){
            this.$emit('showDetail',this.item)
          },
          getFlag(countryName){
            return this.flagPrefix + this.flags[countryName];
          },
        },
        props:['item','index'],
    }
</script>

<style scoped lang="less">
    @import '../../assets/less/util';
    li{
      font-size:10px;
      display:flex;
      padding:5px;
      align-items:center;
      .border-1px(#eee);
    }
    span{
      flex:1;
      text-align:center;
    }
    .pets-icon{
      /*flex: 0 0 35px!important;*/
      /*width:35px!important;*/
      text-align: left;
      flex:0 0 65px;
      border-right:1px solid #ccc;
      position:relative;
      .shiny_wrap{
        right:5px;
        top:0;
        position:absolute;
        width:15px;
      }
    }
    .pet-img{
      width:30px;
    }
    .t-content{
      height:30px;
      line-height:30px;
      overflow: hidden;
      border-bottom:1px solid #eee;
    }
    .b-content{
      height:25px;
      line-height:25px;
      overflow: hidden;
    }
    .time-icon{
      height:20px;
      width:20px;
      vertical-align: middle;
    }
    .flag-wrap{
      width:35px;
      height:20px;
      vertical-align: middle;
      border:1px solid #eee;
    }
    .t-wrap{
      margin:0 5px 0 3px;
    }
    .l-wrap{
      width:110px!important;
    }

    .icon-target{
      flex: 0 0 30px;
      font-size:25px;
      color:red;
    }
    .active{
      color:#999;
    }
</style>
