<template>
  <li>
    <span class="f-w-35 mr-10"><img style="width:35px" :src="nestImgPrefix+parseInt(item.pet_id)+'.png'"></span>
    <span>{{item.petName}}</span>
    <span class="width-40">{{item.pet_id}}</span>
    <span><img :src="flagPrefix + flags[item.country]" class="flag-wrap"></span>
    <span>{{item.count_str}}</span>
    <span><button  style="font-size:16px" class="btn btn-default" @click.stop.prevent="$emit('goPoint',item)">Go</button></span>
  </li>
</template>

<script>
    import { mapGetters,mapMutations } from 'vuex'
    "use strict";
    export default {
        name: "nestItem",
        computed:{
          ...mapGetters(['flagPrefix','nestImgPrefix','flags']),
        },
        props:['item']
    }
</script>

<style scoped lang="less">
    li {
      font-size: 10px;
      display: flex;
      flex-wrap: wrap;
      text-align: left;
      padding: 10px 0;
      border-bottom: 1px solid #ccc;
      vertical-align: middle;
      word-break: break-all;
      align-items: center;
      .f-w-35 {
        flex: 0 0 35px;
        width: 35px;
      }
      span {
        vertical-align: middle;
        max-width: 100px;
        flex: 1;
        font-size: 10px;
        display: inline-block;
      }
      .hasClick {
        background-color: #eee;
      }
    }
    .flag-wrap{
      border:1px solid #eee;
    }
</style>
