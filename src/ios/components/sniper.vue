<template>
  <div class="sniper-wrap">
    <section class="pets-warp text-center">
      <div v-show="!ifFilter">
        <header class="header-style">
          <p>
            <i class="icon-spinner11" @click.stop.prevent="getNewsData"></i>
            {{trans.lastUpdated}}: {{lastUpdateTime|timeFormat}}  (UTC)<!--距离上次更新过去了多少秒-->
            <span class="icon-filter" @click.stop.prevent="setFilter(true)"></span>
          </p>
        </header>
        <ul  class="pets-title">
          <li class="pets-icon">Pokémon</li>
          <li>{{trans.information}}</li>
          <li>{{trans.region}}</li>
          <li>{{trans.time}}</li>
          <li></li>
        </ul>
        <ul ref="sniperWrap" class="pets-content">
          <div>
            <div v-show="netWorkError" @click="getNewsData" class="error-info-class">Failed to load. Please try it again</div>
            <sniper-item v-for="(item,index) in filterPets" :key="index" :item=item @goPoint="goPoint"></sniper-item>
            <div class="text-center" v-show="!filterPets.length">
              {{trans.nodata}}
            </div>
          </div>
        </ul>
        <ul class="filter-options-content">
          <li><span class="left">LV35</span><mt-switch class="inline right" :value.sync="openLV" @change="changeLV"></mt-switch></li>
          <li><span class="left">{{trans.shiny_check}}</span><mt-switch class="inline right" :value.sync="is_shiny" @change="changeShiny"></mt-switch></li>
          <li><span class="left">{{trans.feeds_noti}}</span><mt-switch class="inline right" :value.sync="notify" @change="()=>{$store.commit('sniper/setNotify',!notify)}"></mt-switch></li>
          <li><span class="left">{{trans.showOnMap}}</span><mt-switch class="inline right" :value.sync="displayOnMap" @change="showOnMap"></mt-switch></li>
        </ul>
      </div>

      <div class="filter-wrap" v-show="ifFilter">
        <ul class="box-content" ref="pOptionWrap">
          <div>
            <li v-for="(item,index) in petNamesList" :key="index" class="mb-10">
              <input :id="'checkbox-'+index+'p'" type="checkbox" :checked="item['checked']" @click="chosePet(item)" v-show="false">
              <label :for="'checkbox-'+index+'p'"></label>
              <span>{{item.name}}</span>
            </li>
          </div>
        </ul>
        <div class="text-center">
          <button class="btn btn-default" @click.stop.prevent="cancel">{{trans.no}}</button>
          <button class="btn btn-default" @click.stop.prevent="confirm">{{trans.confirmContent}}</button>
          <div class="inline v-m">
            <input id="checkbox-all-pet" type="checkbox" :checked="allPets" @click="choseAll" v-show="false">
            <label for="checkbox-all-pet"></label>
            <span>{{trans.selectAll}}</span>
          </div>
        </div>
      </div>
    </section>
    <loading ref='loading' :visible="isloading"></loading>
  </div>
</template>

<script>
    import { throttle } from '../lib/util'
    import { mapState,mapGetters,mapActions,mapMutations } from 'vuex';
    import loading from './loading';
    import sniperItem from './sniperItem'
    import BScroll from 'better-scroll';
    export default {
        name: "sniper",
        data(){
          return {
            netWorkError:false,
            autoTimeoutID:null,  //30秒的定时器
            closeTimeoutID:null,  //close
            retryTimeoutID:null,  //retry
            filterCheck:false,
            colorCheck:false,
          }
        },
        components:{ loading ,sniperItem},
        computed:{
          // filterPets(){
          //   if(this.pets.length <= 0){
          //    return [];
          //   }else{
          //    return  this.pets.filter((item)=>{
          //       let _color = this.is_shiny?item.is_shiny==1?true:false:true;  //判断是否开启异色判定,开启就需要判定子选项是否异色，否则关掉
          //       let _lv = this.openLV?item.lv >= 35 ? true : false:true;
          //       let _petsName = !this.chosePets.length||this.chosePets.indexOf(item.pet_id+"")>-1;
          //       return _color&&_lv&&_petsName;
          //     })
          //   }
          // },
          ...mapState('sniper',['is_shiny','openLV','ifFilter','petNamesList','notify','displayOnMap','lastTime','lastUpdateTime','isloading','pets','openLV','openShiny']),
          ...mapGetters(['version','flagPrefix','flags','currentLanguage','trans','userToken','titleLang','titlesName','nestImgPrefix']),
          ...mapGetters('sniper',['getPets','chosePets','allPets','clickPoint','ifFirstTime','filterPets'])
        },

        created(){
          window.ConfigGet('sniperSaveOptions',(res)=> {
            let result = res == ""?[]:JSON.parse(res)['petOption']
            this.setChosePets(result)
            this.setSavedPets(result);
            this.getData();
            this.getPetsName();
            setInterval(()=>{
              this.getData();
            },30000)
          })
        },

        mounted(){
          this.$nextTick(()=>{
            this.$store.commit('sniper/setCallBack',this.calBS);

            this.$refs.sniperWrap.style.height = this.$parent.wrapHeight - 300 +'px';

            this.$refs.pOptionWrap.style.height = this.$parent.wrapHeight - 160 + "px";
          })
        },

        methods:{
          cancel(){
            window.ConfigGet('sniperSaveOptions',(res)=> {
              let historyPets = res == ""?[]:JSON.parse(res)['petOption'];
              this.petNamesList.forEach((item)=>{
                item.checked = historyPets.indexOf(item.pet_id) >-1?true:false;
              });
              let ifChecked = this.petNamesList.every(item=>item.checked === true)
              this.setAllPets(ifChecked)
              this.setFilter(false);
            })
          },

          confirm(){
            this.setFilter(false);
            let chosePetsList = [];
            this.petNamesList.forEach((item)=>{
              if(item.checked) chosePetsList.push(item.pet_id)
            });

            this.setChosePets(chosePetsList);

            let petOption = this.chosePets,
                optionStr = JSON.stringify({petOption});
                console.log(`每次保存的内容是什么${optionStr}`);
                window.SyncConfig('sniperSaveOptions',optionStr);  //保存每次的选择
          },
          choseAll(){
            this.setAllPets(!this.allPets);
            this.petNamesList.map((item)=>{
              item.checked = this.allPets;
            })
          },
          chosePet(item){
            item.checked = !item.checked
            let ifChecked = this.petNamesList.every((item)=>{
              return item.checked === true;
            })
            this.setAllPets(ifChecked)
          },

          getNewsData:throttle(function(){
              this.getData();
          },5000,5000),

          showOnMap(){
            this.$store.commit('sniper/setDisplay',!this.displayOnMap);
            this.$store.dispatch('pokestop/refresh')
          },

          changeShiny(){
            this.setShiny(!this.is_shiny);
            this.calBS();
          },
          changeLV(){
            this.setLV(!this.openLV);
            this.calBS();
          },

          calBS(){
            this.$nextTick(()=>{
              if(!this.pScroll){
                this.pScroll = new BScroll(this.$refs.sniperWrap,{
                  click:true,
                  probeType:3,
                  scrollbar: true,
                  mouseWheel:true,
                })
              }else{
                this.pScroll.refresh();
              }
            })
          },

          goPoint(item){
            this.$parent.goPoint(item,true); //加密
            this.$store.commit('setCurrentType','sniper');
          },

          ...mapMutations('sniper',['setChosePets','setAllPets','setSavedPets','setLV','setShiny','setFilter','setHasNew','setCallBack','setLastUpdateTime','setLastTime','setPets']),
          ...mapActions('pokestop',['refresh']),
          ...mapActions('sniper',['getData','getPetsName'])
        }
    }
</script>

<style scoped lang="less">
  @import '../assets/less/util';
  .sniper-wrap{
    .pets-warp {
      font-size:10px;
      header {
        text-align:center;
        margin-bottom:5px;
        .icon-filter{
          float:right;
          margin-right:10px;
        }
        span {
          font-size: 24px;
          font-weight: 200;
        }
        .icon-close {
          margin:5px 5px 0 0;
          float:right;
          right:10px;
          font-size: 20px
        }
      }
      .pets-title{
        display:flex;
        flex-wrap: wrap;
        align-items: center;
        padding:0 10px;
        font-weight:700;
        overflow:hidden;
        li:not(:last-child){
          flex:1;
          overflow:hidden;
        }
      }
      .pets-content {
        position: relative;
        margin-bottom:10px;
        overflow:scroll;
        -webkit-overflow-scrolling: touch;
      }
      .filter-options-content{
        height:100%;
        padding:0 10px;
        display:flex;
        align-items:center;
        flex-direction: column;
        li{
          width:100%;
          padding:0 5px;
          margin-bottom:5px;
          .left{
            float:left;
          }
          .right{
            float:right;
          }
        }
        .inline{
          display:inline-block;
        }
        .openNotify{
          background-color:red;
          color:#fff;
          border:1px solid red;
        }
      }
    }
    .filter-wrap{
      padding:10px;
      text-align:left;
      input[type="checkbox"] + label {
        cursor: pointer;
        font-size: 1em;
      }
      [id^="checkbox-"] + label {
        background-color: #ffffff;
        border: 1px solid #666666;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05), inset 0px -15px 10px -12px rgba(0, 0, 0, 0.05);
        padding: 12px;
        border-radius: 3px;
        display: inline-block;
        vertical-align: middle;
      }
      [id^="checkbox-"] + label:active {
        box-shadow: 0 1px 2px rgba(0,0,0,0.05), inset 0px 1px 3px rgba(0,0,0,0.1);
      }
      [id^="checkbox-"]:checked + label {
        background-color: #4d90fe;
        border: 1px solid #4774DD;
      }

    }


  }
  .alert-pokesniper{
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    padding: 5px 15px;
  }

  .t-content{
    height:30px;
    line-height:30px;
    border-bottom:1px solid #eee;
  }
  .b-content{
    line-height:25px;
    height:25px;
  }
  .flag-wrap{
    height:20px;
    width:35px;
    border:1px solid #eee;
    overflow: hidden;
  }
  .icon-spinner11{
    float:left;
    font-size:16px;
    margin-left:10px;
    &:active{
      color: #e80000;
    }
  }
</style>
