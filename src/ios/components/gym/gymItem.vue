<template>
  <li class="item-content-list">

    <div class="item-wrap">
      <span class="img-container"><img :src="getGymImg()"/></span>
      <span class="text-container">{{item.name}}&nbsp;({{item.gmt_date}})</span>
    </div>

    <div class="item-wrap">
      <span class="img-container"><img :src="flagPrefix + flags[item.country]" class="flag-wrap"/><br>{{item.country}}</span>
      <span class="img-list-container">
        <div  v-for="(detail,index) in item.details" :key="index" class="inline detail-wrap">
          <img :src="detail.imgIcon" class="img-wrap"><br>
          <div class="detail-progress-wrap">
            <div class="detail-progress-percent" :style="{width:currentPercent(detail.pokemon_cp,detail.max_cp)}">
            </div>
            {{currentPercent(detail.pokemon_cp,detail.max_cp)}}
          </div>
        </div>
      </span>
      <span class="button-container">
        <span><button  style="font-size:16px" class="btn" @click.stop.prevent="()=>{$emit('goPoint',item)}">Go</button></span>
      </span>
    </div>

  </li>
</template>

<script>
    import icon0 from './../../../../static/images/stops/0.png'
    import icon1 from './../../../../static/images/stops/1.png'
    import icon2 from './../../../../static/images/stops/2.png'
    import icon3 from './../../../../static/images/stops/3.png'
    import { mapState } from 'vuex'
    export default {
        name: "gymItem",
        props:['item'],
        computed:{
          ...mapState(["flagPrefix","flags","nestImgPrefix"])
        },
        methods:{
          currentPercent(num,maxVal){
              let percent = Math.round(num/maxVal*100);
              return percent?percent+'%':0
          },

          getGymImg(){
            let result = {
              0:'./static/images/stops/0.png',
              1:'./static/images/stops/1.png',
              2:'./static/images/stops/2.png',
              3:'./static/images/stops/3.png'
            };
            return result[this.item.team]
          },
        }
    }
</script>

<style scoped lang="less">
   @import '../../assets/less/util';
  .item-content-list{
    font-size:0;
    vertical-align: bottom;
    .item-wrap{
      display:flex;
      font-size:10px;
      text-align:center;
      align-items: center;
      .border-1px(#eee);
      .img-container{
        width:60px;
        text-align:center;
        .flag-wrap{
          width:35px;
          height:25px;
          border:1px solid #eee;
        }
      }
      .text-container{
        flex:1;
      }
      .button-container{
        width:80px;
      }

      .img-list-container{
        vertical-align: bottom;
        font-size:10px;
        display:inline-block;
        text-align:center;
        .border-1px(#eee);
        padding:10px 0;
        word-break:break-all;
        .img-wrap{
          width:100%;
          vertical-align: bottom;
        }
      }
    }


    .detail-wrap{
      box-sizing:border-box;
      width:16%;
      padding-right:10px;
    }

    .btn{
      margin:0;
      outline:none;
      border:1px solid transparent;
      box-sizing:border-box;
      display:inline-block;
      background-color:#4d90fe;
      color:#fff;
    }
  }
  .detail-progress-wrap{
    text-align:center;
    font-size:6px;
    border:1px solid #eee;
    background-color:#fff;
    height:15px;
    line-height:15px;
    width:100%;
    position:relative;
    .detail-progress-percent{
      position:absolute;
      height:15px;
      background-color:rgba(7,250,255,.5);
      left:0;
    }
    .grey{
      position:absolute;
      height:15px;
      background-color:grey;
      width:100%;
      left:0;
    }
  }


</style>
