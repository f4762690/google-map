<template>
    <div>
      <transition name="fade">
        <div class="wrap" v-show="ifShow">
          <div class="page-header">
            <i class="icon-chevron-left" @click.stop.prevent="ifShow = false"></i>
            <span>{{trans.lanSet}}</span>
          </div>
          <div>
            <div class="list-wrap" ref="wrapper">
              <ul>
                <li  v-for="(item,index) in languages" :key="index" @click.stop.prevent="setLan(item)">
                  <span :class="{'active':currentLanguage == item.key}">{{item.value}}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </transition>
    </div>
</template>

<script>
    import { mapGetters,mapMutations } from 'vuex'
    export default {
        name: 'language',
        data(){
          return {
            ifShow:false,
          }
        },
        computed:{
          languages(){
            return this.langs.languages
          },
          ...mapGetters(['trans','langs','currentLanguage'])
        },
        mounted(){
            console.log("预言是："+this.currentLanguage);
        },
        methods:{
          show(){
            this.ifShow = true;
          },
          setLan(data){
            this.$alert({
              'title':this.trans.prompt,
              'content':this.trans.ifMakesure+" "+data['value']+this.trans.setDefaultLan+"?",
              'btns':[this.trans.no,this.trans.yes]
            },()=>{
              this.$alert.close;
            },()=>{
              this.$store.commit('setCurrentLanguage',data);
              this.ifShow = false;
            })
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
    }
    .icon-chevron-left{
      position:absolute;
      left:20px;
      line-height:40px;
    }
    .list-wrap{
      position: fixed;
      top: 40px;
      left:0;
      bottom: 0;
      width: 100%;
      overflow:hidden;
    }
    li{
      .border-1px(#eee);
      text-align: left;
      width: 100%;
      padding: 10px 0 10px 20px;
    }
    .active{
      color:red;
    }
  }
</style>
