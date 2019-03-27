<template>
  <transition name="text-transition-class" enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
    <div class="text-wrap" v-show="ifShow">
      <header>
        {{trans.textType}}
        <i class="icon-close" @click="()=>{ifShow = false;text=''}"></i>
      </header>
      <!--<pre class="text-pre" contenteditable="true" style="-webkit-user-select:auto">{{text}}</pre>-->
      <textarea v-model="text" class="text-content" spellcheck="false" style="-webkit-user-select:auto"></textarea>
      <!--<mt-field type="textarea" value="text"></mt-field>-->
      <div class="button-wrap">
        <mt-button size="normal" @click="()=>{$emit('importData',text);text=''}">
          {{trans.confirmContent}}
        </mt-button>
        <mt-button size="normal" @click="()=>{ifShow = false;text=''}">
          {{trans.no}}
        </mt-button>
      </div>
    </div>
  </transition>
</template>

<script>
    import { mapGetters } from 'vuex';
    export default {
        name: "textImport",
        computed:{
          ...mapGetters(['trans'])
        },
        data(){
          return {
            ifShow:false,
            text:'',
          }
        },
        methods:{
          show(){
            this.ifShow = true;
          },
          hide(){
            this.ifShow = false;
          }
        }
    }
</script>

<style scoped lang="less">
  .text-wrap{
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    width:80%;
    height:50%;
    margin:auto;
    background-color:#fff;
    z-index:999;
    padding:10px;
    header{
      text-align:center;
      padding:10px 0;
      .icon-close{
        float:right;
      }
    }
    .text-pre{
      overflow:scroll;
      border:1px solid #eee;
      font-size:14px;
      width:100%;
      height:80%;
      margin-bottom:10px;
    }
    .text-content{
      outline:0;
      font-size:14px;
      width:100%;
      height:70%;
      margin-bottom:10px;
    }
    .button-wrap{
      text-align:center;
    }
    .mint-button--default{
      background-color:#4d90fe;
      color:#fff;
    }
  }
</style>
