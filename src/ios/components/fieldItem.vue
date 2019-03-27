<template>
  <li>
    <span class="f-w-35 mr-10 text-center"><img style="width:35px" :src="pokemonImgPrefix+item.pet_id+'.png'"><br/><span v-if="item.num1 > 0">({{item.num1}})</span></span>
    <span class="bouns-text">{{item.bonusName}}</span>
    <span class="f-w-35"><img style="width:35px" :src="flagPrefix + flags[item.country]" class="flag-wrap"/><br/><span>{{item.city}}</span>
              </span>
    <span class="task-text-wrap">{{item.taskName}}</span>
    <span class="button-container"><button  class="btn btn-default font-16" @click.stop.prevent="$emit('goPoint',item)">Go</button></span>
  </li>
</template>

<script>
    import { mapGetters } from 'vuex'
    "use strict";
    export default {
        name: "fieldItem",
        props:['item'],
        computed:{
          ...mapGetters(['flagPrefix','flags','pokemonImgPrefix'])
        }
    }
</script>

<style scoped lang="less">
  li{
    font-size:0;
    display:flex;
    flex-wrap: wrap;
    text-align:left;
    padding:10px 0;
    border-bottom:1px solid #ccc;
    vertical-align: middle;
    word-break:break-all;
    align-items:center;
    justify-content: center;
    .f-w-35{
      flex:0 0 35px;
      width:35px;
    }
    span{
      vertical-align: middle;
      flex:1;
      font-size:10px;
      display:inline-block;
    }
    .flag-wrap{
      border:1px solid #eee;
      vertical-align:middle;
      width:35px;
      height:20px;
    }
    .task-text-wrap{
      flex:1.5;
      margin:0 10px;
      text-align:center;
    }

  }
</style>
