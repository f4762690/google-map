<template>
  <transition name="info-classes-transition" enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
    <div class="avenger-wrap" v-show="ifShow">
      <header>{{trans.avenger}}
        <i class="icon-close" @click.stop.prevent="closeWin"></i>
      </header>
      <ul>
        <li v-for="(item,index) in titles" :key=index @click="setTitle(item)" :class="{'active':curComponent == item.value}">
          {{item.name}}
        </li>
      </ul>
      <keep-alive>
        <component :is="curComponent"></component>
      </keep-alive>
    </div>
  </transition>
</template>

<script>
    import wantedList from './wantedList';
    import blackList from './blackList';
    import warnArea from './warnArea';
    import { mapGetters,mapActions } from 'vuex';
    "use strict";
    export default {
        name: "avenger",
        components:{ wantedList,blackList,warnArea},
        data(){
          return {
            ifShow:false,
            curComponent:'',
            wrapHeight:'',
            titles:[],
          }
        },
      created(){
        this.setBlackNameList();
        this.titles = [
            {
              name:this.trans.wantedList,
              value:'wantedList',
            },{
              name:this.trans.blackList,
              value:'blackList',
            },{
              name:this.trans.warnArea,
              value:'warnArea',
            },
          ];
      },
      computed:{
        ...mapGetters(['trans'])
      },
      methods:{
        closeWin(){
          this.ifShow = false;
          this.curComponent = 'wantedList';
        },
        setTitle(item){
          this.curComponent = item.value;
        },
        show(){
          this.$store.commit('avenger/avengerNews',false);
          this.ifShow = true;
          this.$nextTick(()=>{
            this.curComponent = 'wantedList';
            this.wrapHeight = document.getElementsByClassName("avenger-wrap")[0].clientHeight; //用来判断滚动区域应该的高度.
          })
        },
        jumpPoint(obj){
          this.$parent.go_to_point(obj);
          this.$parent.simulationType = 0;
          this.ifShow = false;
        },
        ...mapActions('avenger',['setBlackNameList'])
      }
    }
</script>

<style scoped lang="less">
  .avenger-wrap {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 90%;
    height: 95%;
    background-color: #fff;
    z-index: 300;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
    header {
      padding: 10px;
      text-align: center;
      .icon-close {
        float: right;
      }
    }

    ul{
      text-align:center;
      font-size:0;
      display:flex;
      padding:0 10px 5px 10px;
      li{
        display: inline-block;
        border-top:1px solid #eee;
        border-left:1px solid #eee;
        border-bottom:1px solid #eee;
        font-size:14px;
        padding:5px 0;
        flex:1;
        color:#ccc;
      }
      li:last-child{
        border-right:1px solid #eee;
      }
      .icon-uniE921{
        color:#4bb24b;
      }
      .active{
        font-weight:700;
        color:rgb(7,17,27);
      }
    }
  }

</style>
