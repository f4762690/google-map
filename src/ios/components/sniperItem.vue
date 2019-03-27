<template>
  <li class="pets-item">
    <span class="pets-icon" :class="{'m-icon':item.sex == 2,'f-icon':item.sex == 1}"><img :src="nestImgPrefix+parseInt(item.pet_id)+(1 ==item.type?'-1.png':'.png')" class="width-30"><br><span>{{getPetName(item)}}</span><br><strong v-show="item.scale">({{item.scale}})</strong></span>
    <span style="text-align:left" class="ml-10">
      <div class="t-content"><i class="t-wrap"><img class="time-icon" :src="'./static/images/LV.png'"/></i>{{item.lv}}</div>
      <div class="b-content"><i class="t-wrap"><img class="time-icon" :src="'./static/images/CP.png'"/></i>{{item.cp}}</div>
    </span>
    <span>
      <div class="t-content flag-img-wrap"><img :src="flagPrefix + flags[item.country]" class="flag-wrap"></div>
      <div class="b-content" style="overflow:hidden">{{item.city}}</div>
    </span>
    <span>
      <div class="t-content o-h"><i class="t-wrap"><img class="time-icon" :src="'./static/images/TIME.png'"/></i>{{confirmTime}}m {{item.ifClick}}</div>
      <div class="b-content o-h"><i class="t-wrap"><img class="time-icon" :src="'./static/images/STOP.png'"/></i>{{$getCoolTime($getDisance(item.lat,item.lng,curPosition.lat,curPosition.lng)) }}m</div>
    </span>
    <span class="icon-target" @click.stop.prevent="goPoint" :class="{'active':item.ifClick}"></span>
  </li>
</template>

<script>
    import { mapState,mapGetters } from 'vuex';
    "use strict";
    export default {
        name: "sniperItem",
        data(){
          return {
            confirmTime:0,
          }
        },
        props:['item'],
        computed:{

          ...mapState('googlemap',['curPosition']),
          ...mapGetters('sniper',['clickPoint']),
          ...mapGetters(['nestImgPrefix','flagPrefix','titlesName','titleLang','flags'])
        },
        methods:{
          getConfirmTime(){
            let _confirmed = Math.ceil(new Date().getTime()/1000) - this.item.start_time;
            this.confirmTime =  _confirmed < 60?'<1':Math.ceil(_confirmed/60);
              setTimeout(()=>{
              this.getConfirmTime();
              },30000)
          },
          goPoint(){
            this.item['ifClick'] = true;
            let result = [...this.clickPoint,this.item._id];
            this.$store.commit('sniper/setClickPoint',result);
            this.$emit('goPoint',this.item)
          },
          getPetName(item){
            let strId = item.pet_id+'';
            if(this.titlesName[strId]){
              return 1 == item['type']?'Alola '+this.titlesName[strId][this.titleLang]:this.titlesName[strId][this.titleLang];
            }
          },
        }

    }
</script>

<style scoped lang="less">
  @import '../assets/less/util';
  .pets-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    word-break:break-all;
    padding:5px;
    font-size:10px;
    box-sizing:border-box;
    .border-1px(#eee);
    .width-30 {
      width:30px;
    }
    .pets-icon{
      text-align:center;
      border-right:1px solid #eee
    }
    span {
      flex: 1;
    }
    .icon-target{
      flex: 0 0 30px;
      font-size:25px;
      color:red;
    }
    .active{
      color:#999;
    }

    .l-icon{
      border-radius:50%;
      color:red;
      border:2px solid #eee;
      font-size:10px;
      padding:2px;
      /*margin-right:3px;*/
      /*margin-left:15px;*/
    }
    .time-icon{
      width:20px;
      height:20px;
      margin-right:3px;
      vertical-align: middle;
    }

    .o-h{
      overflow:hidden;
    }
    .t-wrap{
      vertical-align: middle;
    }
    .flag-img-wrap{
      vertical-align: middle;
    }
  }

  .m-icon,
  .f-icon {
    position: relative;
    &:before {
      display: block;
      border-radius: 50%;
      font-size:20px;
      position:absolute;
      top:-5px;
      left:80%;
      text-align: center;
    }
  }
  .m-icon {
    &:before {
      color:@mColor;
      content: "♂";
    }
  }
  .f-icon {
    &:before {
      color:@fColor;
      content: "♀";
    }
  }
  .flag-wrap{
    height:20px;
    width:35px;
    border:1px solid #eee;
    overflow: hidden;
  }
  .ml-10{
    margin-left:10px;
  }
</style>
