<template>
    <transition name="fade">
    <div class="location-wrap" v-if="ifShow">
      <ul>
        <li @click="setSecond(val,key)" v-for="(val,key) in param" :key="key" class="text-wrap" :class="key == fChose?'active':''">
          <b>{{key}}</b>
        </li>
      </ul>
      <ul v-if="secondData">
        <li @click="setLast(val,key)" v-for="(val,key) in secondData" :key="key" class="text-wrap" :class="key == sChose?'active':''">
          <b>{{key}}</b>
          <!--<i v-if="undefined == val.lat" class="icon-chevron-right"></i>-->
        </li>
      </ul>
      <ul v-if="lastData">
        <li @click="callBack(key,val)" v-for="(val,key) in lastData" :key="key" class="text-wrap">
          <b>{{key}}</b>
          <!--<i v-if="undefined == val.lat" class="icon-chevron-right"></i>-->
        </li>
      </ul>
    </div>
    </transition>
</template>

<script>
    export default {
        name: 'location',
        props:{
          param:{
            type:Object,
            default:{}
          },
          ifShow:{
            type:Boolean,
            default:false
          }
        },
        data(){
          return {
            fChose:'',
            sChose:'',
            secondData:{},
            lastData:{},
          }
        },
        methods:{
          show(){
            this.ifShow = true;
          },
          setSecond(value,key){
            this.fChose = key;
            this.secondData = value;
          },
          setLast(value,key){
            this.sChose = key;
            this.lastData = value;
          },
          callBack(cityName,point){
            this.ifShow = false;
            this.$emit("choose",{cityName,point});
          }
        }
    }
</script>

<style scoped lang="less">
   @basecolor:#fff;
  .location-wrap{
    position:fixed;
    top:0;
    left:0;
    bottom:0;
    right:0;
    background-color:@basecolor;
    display:flex;
    z-index:99999;
    ul{
      flex:1;
      overflow: scroll;
    }
    li{
      box-sizing:border-box;
      padding:5px;
      border-bottom:1px solid #eee;
    }
  }
   .active{
     background-color:#54E21D;
     color:#fff;
   }
  .fade-enter-active,.fade-leave-active{
    transition:.3s;
  }
  .fade-enter-to, .fade-leave{
    transform: translate3d(0,-100%,0);
  }

</style>
