<template>
  <transition name="fade">
    <div class="wrap" v-show="ifShow">
      <div class="page-header">
        <i class="icon-chevron-left" @click.stop.prevent="ifShow = false"></i>
        <span>{{trans.setting}}</span>
      </div>
      <ul>
        <li @click="()=>{$refs.languageRef.show()}">
          {{trans.lanSet}}
        </li>
        <li class="btn-content">
          <div class="clear" :class="{'mb-20':ifDrift}"><span>{{trans.drift}} </span><div class="right inline"><mt-switch :value.sync="ifDrift" @change="changeDrift()"></mt-switch></div></div>
        </li>
        <li v-show="ifDrift">
          <span>{{trans.frequency}}</span><div class="right drift-input">
          <input class="input-style" v-model="currentDrift" @input="checkValue()" :placeholder='trans.driftInterval'>
          <span v-show="ifError" class="error-text">{{trans.errorDriftValue}}</span></div>
        </li>
      </ul>
      <Language ref="languageRef"></Language>
    </div>
  </transition>
</template>

<script>
    import Language from './language'
    import { mapGetters } from 'vuex'
    export default {
        name: 'setting-page',
        data(){
          return {
            currentDrift:'',
            ifShow : false,
            ifError : false,
          }
        },
        components:{ Language },
        created(){
          this.currentDrift = this.driftValue;
        },
        watch:{
          driftValue(){
            this.currentDrift = this.driftValue;
          }
        },
        computed:{
            ...mapGetters(['trans','ifDrift','driftValue'])
        },
        methods:{
            checkValue(){
              if(!(/^([1-9]|10|['1','2','3','4','5','6','7','8','9','10'])$/.test(this.currentDrift))){
                this.ifError = true;
              }else{
                this.ifError = false;
                this.$store.commit('setDriftValue',this.currentDrift);
              }
            },
            changeDrift(){
              this.$store.commit("setDrift",!this.ifDrift)
            },
            show(){
              this.ifShow = true;
            }
        }
    }
</script>

<style scoped lang="less">
  @import '../assets/less/util';
  .fade-enter-active,.fade-leave-active{
    transition:all 0.5s ease;
    transform:translate3d(0,0,0);
  }
  .fade-enter,.fade-leave-to{
    transform:translate3d(-100%,0,0);
  }
  .wrap {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #fff;
    z-index: 500;
    text-align: center;
    .page-header {
      .border-1px(#eee);
      height: 40px;
      line-height: 40px;
      text-align: center;
      .icon-chevron-left {
        position: absolute;
        left: 20px;
        line-height: 40px;
      }
    }
    ul{
      li{
        .border-1px(#eee);
        text-align:left;
        padding:10px 20px;
        .drift-input{
          max-width:200px;
          display:flex;
          flex-direction: column;
          position:relative;
        }
        .input-style{
          max-width:100px;
          -webkit-appearance: none;
          -moz-appearance: none;
          -o-appearance: none; appearance: none;
          text-align:right;
          font-size:20px;
        }
        .left{
          float:left;
        }
        .right{
          float:right;
        }
        .inline{
          display: inline-block;
        }
      }
    }
    .clear{
    }
    &:after{
      content:'';
      zoom:1;
      visibility: hidden;
      display:block;
      clear:both;
    }
    .btn-content{
      height:32px;
      line-height:32px;
    }
    .mb-20{
      margin-bottom:20px;
    }
  }
  .error-text{
    font-size:14px;
    position:absolute;
    top:30px;
    color:red;
    padding:3px;
    right:0px;
    border:1px solid #eee;
    background-color:#fff;
    z-index:1;
  }
</style>
