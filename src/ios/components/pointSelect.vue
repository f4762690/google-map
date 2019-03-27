<template>
    <transition name="info-classes-transition" enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">
      <div class="container" v-show="ifShow">
        <header>
          <span>{{getTitle}}</span>
          <i class="icon-plus" @click="()=>{ifShow =false;$emit('maximize')}"></i>
          <i class="icon-close" @click.stop.prevent="ifShow = false"></i>
        </header>
        <div class="content-container">
            <ul class="sinper-wrap" v-show="currentType == 'sniper'">
              <sniper-item v-for="(item,index) in filterPets" :item="item" :key="index" @goPoint="goPoint"></sniper-item>
            </ul>
            <ul class="nest-wrap" v-show="currentType == 'nest'">
              <nest-item v-for="(item,index) in nestDataList" :key="index" :item="item" @goPoint="goPoint"></nest-item>
            </ul>
            <ul class="raid-wrap" v-show="currentType == 'raid'">
              <raid-item v-for="(item,index) in raidFilterData" :item="item" :key="index" @goPoint="goPoint"></raid-item>
            </ul>
            <ul class="field-wrap" v-show="currentType == 'field'">
             <field-item v-for="(item,index) in fieldFilterData" :item="item" :key="index" @goPoint="goPoint"></field-item>
            </ul>
            <ul class="wild-wrap" v-show="currentType == 'wild'">
              <wild-item v-for="(item,index) in wildFilterData" :key="index" :item="item" :index="index"  @goPoint="goPoint"></wild-item>
            </ul>
            <ul class="gym-wrap" v-show="currentType == 'gym'">
              <gym-item :item="item" v-for="(item,index) in gymFilterData" :key="index" @goPoint="goPoint"></gym-item>
            </ul>
          </div>
      </div>
    </transition>
</template>

<script>
    import { mapState,mapGetters } from 'vuex';
    import sniperItem from './sniperItem'
    import nestItem from './nestItem'
    import raidItem from './raid/raidItem'
    import fieldItem from './fieldItem'
    import wildItem from './wild/wildItem'
    import gymItem from './gym/gymItem'
    "use strict";
    export default {
        name: "pointSelect",
        data(){
          return {
            ifShow:false,
          }
        },
        components:{
          sniperItem,nestItem,raidItem,fieldItem,wildItem,gymItem
        },
        methods:{
          getFlag(name){
            return this.flagPrefix + this.flags[name];
          },

          goPoint(item){
            item['ifClick'] = true;
            this.$parent.simulationType = 0;
            switch (this.currentType) {
              case 'sniper':
                this.$parent.go_to_point(item,true);
                break;
              case 'nest':
                this.$parent.go_to_point(item);
                break;
              case 'raid':
                this.$parent.go_to_point(item);
                break;
              case 'field':
                this.$parent.go_to_point(item);
                break;
              case 'wild':
                this.$store.commit('wild/setClick',{'item':item.item,'index':item.index});
                this.$parent.go_to_point(item.item);
                break;
              case 'gym':
                this.$parent.go_to_point(item);
                break;
            }
          },

          show(){
            this.ifShow = true;
          },
          close(){
            this.ifShow = false;
          }
        },
        computed:{
          getTitle(){
            let title = {
              'sniper':this.trans.pokesniper,
              'nest':this.trans.nests,
              'raid':this.trans.raidText,
              'field':this.trans.filedResrearch,
              'wild':this.trans.wildLife,
              'gym':this.trans.gyms,
            };
            return title[this.currentType];
          },
          ...mapState('googlemap',['curPosition']),
          ...mapGetters('sniper',['getPets','is_shiny','openLV','chosePets','filterPets']),
          ...mapGetters('nests',['nestDataList']),
          ...mapGetters('raid',['raidFilterData']),
          ...mapGetters('field',['fieldFilterData']),
          ...mapGetters('wild',['wildFilterData']),
          ...mapGetters('gym',['gymFilterData']),
          ...mapGetters(['trans','currentType','pointOptions','flagPrefix','nestImgPrefix','titlesName','flags','titleLang','pokemonImgPrefix'])
        },
    }
</script>

<style scoped lang="less">
  @import '../assets/less/util';
  .container {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    max-height: 300px;
    background-color: rgba(255, 255, 255, .8);
    z-index: 9999;
    header {
      position: relative;
      padding: 5px;
      text-align: center;
      .border-1px(#eee);
      i {
        position: absolute;
      }
      .icon-plus {
        right: 40px;
      }
      .icon-close {
        right: 10px;
      }
    }

    .content-container{
      position:static;
      max-height:270px;
      overflow-y:scroll;
      -webkit-overflow-scrolling: touch;
      z-index:1;
      &:after{
        min-height:calc(100% + 1px);
      }
    }
  }
</style>
