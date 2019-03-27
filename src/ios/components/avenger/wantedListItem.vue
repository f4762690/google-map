<template>
  <li class="list-item">
    <span class="list-item-text">{{item.ownerName}}</span>

    <span class="list-item-text">发现于 {{item.lastTime|specialTime}}</span>
    <span class="item-btn-wrap right">
          <button class="btn btn-default" @click="go()" :class="{'grey':ifClick}">
          {{trans.go}}
          </button>
    </span>
  </li>
</template>

<script>
    import { mapGetters } from 'vuex';
    "use strict";
    export default {
        name: "wantedListItem",
        data(){
            return{
              ifClick:false,
            }
        },
        props:['item'],
        methods:{
          go(){
            this.ifClick = true;
            this.$emit('goPoint');
          }
        },
        // mounted(){
        //   this.ifClick = item['ifClick']
        // },
        computed:{
          ...mapGetters(['trans']),
        }
    }
</script>

<style scoped lang="less">
  @import '../../assets/less/util';
  .list-item{
    .border-1px(#eee);
    padding:5px 0;
    display:flex;
    justify-content: center;
    align-items: center;
    .list-item-text{
      flex:1;
      word-break: break-all;
      flex-wrap: wrap;
      padding-right:5px;
    }
    .item-btn-wrap{
      .grey{
        background-color:#ccc;
      }
    }
  }
</style>
