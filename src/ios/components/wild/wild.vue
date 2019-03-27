<template>
  <div class="wild-wrap">
    <p class="font-10 mb-10">{{trans.lastUpdated}}:{{lastTime|timeFormat}}  (UTC)</p>
    <div>
      <ul class="nest-content"  v-show="currentIndex == 0">
        <div class="mb-10 search-content">
          <input class="title-input" type="text" :placeholder="trans.nestsplaceholder" v-model="searchText" @input="()=>{$store.commit('wild/setSearchText',searchText)}">
          <span class="icon-search" @click.stop.prevent="confirm"></span>
          <span class="icon-filter" @click.stop.prevent="setCurrentIndex(1)"></span>
        </div>
        <div  class="pet-title" v-show="wildFilterData.length>0">
          <span class="petname-title-wrap">Pokémon</span>
          <span class="o-h">{{trans.region}}</span>
          <span class="o-h">{{trans.time}}</span>
          <span class="go-wrap"></span>
        </div>
        <ul ref="petsDataRef" class="scroll-wrap">
          <div>
            <li v-show="netWorkError" @click="getData('new')" class="error-info-class">Failed to load. Please try it again</li>
            <wild-item v-for="(item,index) in wildFilterData" :key="index" :item="item" :index="index"  @goPoint="goPoint"></wild-item>
            <div class="bottom-loading" v-show="bottomLoading">
            <mt-spinner :size="36" color="#4d90fe" type="fading-circle"></mt-spinner>
            </div>
          </div>
          <div class="text-center" v-show="!wildFilterData.length">
            {{trans.nodata}}
          </div>
        </ul>

        <ul class="filter-options-content">
          <li><span class="left">{{trans.shiny_check}}</span><mt-switch class="inline right" :value.sync="wildShiny" @change="shinyChange"></mt-switch></li>
          <li><span class="left">{{trans.showOnMap}}</span><mt-switch class="inline right" :value.sync="displayOnMap" @change="showOnMap"></mt-switch></li>
        </ul>
      </ul>
    </div>
    <div v-show = false>
      <div ref="alertRef">
      <section class="alert-content">
        <div><img :src="nestImgPrefix+parseInt(currentItem.pokemon_id)+'.png'" style="width:35px;height:30px"/><br/><strong>{{getPetName(currentItem.pokemon_id)}}</strong></div>
        <div>
          <strong>STA:{{currentItem.individual_stamina}}</strong>
          <strong>ATK:{{currentItem.individual_attack}}</strong>
        </div>
        <div>
          <strong>CP:{{currentItem.cp}}</strong>
          <strong>DEF:{{currentItem.individual_defense}}</strong>
        </div>
      </section>
      <section class="alert-table-wrap">
        <section class="alert-table-content" v-for="(item,index) in currentItem.opt" :key="index">
          <div class="alert-table-left">
            <p class="title-text" style="text-align:left">
              <img style="width:20px;display:inline-block;vertical-align:middle" :src="getCpImg(item.cp)"><span>{{getTitleName(index)}}</span>
            </p>
            <p class="img-text"><strong>{{getLevel(item.cp)}}<span>&nbsp;|&nbsp;LV:{{item.pokemonLevel}}</span></strong>
            </p>
            <triangle :data="item" class="wild-triangle"></triangle>
          </div>
          <div class="alert-table-right">
            <div class="alert-table-right-content">
             <span>{{trans.power}}:&nbsp</span><span>{{parseInt(item.my_power)}}/{{parseInt(item.power)}}</span>
              <strong>{{trans.optRate}}</strong>
            </div>
            <h2 class="percent-text">{{item.power_per}}%</h2>
          </div>
        </section>
      </section>
      </div>
    </div>
    <div v-show="currentIndex == 1">
      <div class="filter-wrap">
        <div class="filter-header">
          <span @click.stop.prevent="aIndex = 0" class="default-btn" :class="{'active':aIndex == 0}">Pokemon</span>
          <span @click.stop.prevent="aIndex = 1" class="default-btn" :class="{'active':aIndex == 1}">{{trans.country}}</span>
          <span @click.stop.prevent="aIndex = 2" class="default-btn" :class="{'active':aIndex == 2}">Type</span>
        </div>
      </div>
      <div class="check-wrap" v-show="aIndex ==0">
        <ul class="box-content" ref="pOptionWrap">
            <li v-for="(item,index) in allPokemons" :key="index" class="mb-10">
              <input :id="'checkbox-'+index+'p'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'pokemon')" v-show="false">
              <label :for="'checkbox-'+index+'p'"></label>
              <span>{{item.name}}</span>
            </li>
        </ul>
      </div>
      <div class="check-wrap" v-show="aIndex ==1">
        <ul class="box-content" ref="cOptionWrap">
            <li v-for="(item,index) in allCountries" :key="index" class="mb-10">
              <input :id="'checkbox-'+index+'c'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'country')" v-show="false">
              <label :for="'checkbox-'+index+'c'"></label>
              <span>{{item.name}}</span>
            </li>
        </ul>
      </div>
      <div class="check-wrap" v-show="aIndex ==2">
        <ul class="box-content" ref="tOptionWrap">
            <li v-for="(item,index) in allTypes" :key="index" class="mb-10">
              <input :id="'checkbox-'+index+'t'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'type')" v-show="false">
              <label :for="'checkbox-'+index+'t'"></label>
              <span>{{item.name}}</span>
            </li>
        </ul>
      </div>
      <button class="btn h-center" @click.stop.prevent="cancel">{{trans.no}}</button>
      <button class="btn h-center" @click.stop.prevent="confirm">{{trans.confirmContent}}</button>

      <div class="inline v-m" v-show="aIndex == 0">
        <input id="checkbox-all-pet" type="checkbox" :checked="allPokemon" @click="choseAll(0)" v-show="false">
        <label for="checkbox-all-pet"></label>
        <span>{{trans.selectAll}}</span>
      </div>

      <div class="inline v-m" v-show="aIndex == 1">
        <input id="checkbox-all-country" type="checkbox" :checked="allCountry" @click="choseAll(1)" v-show="false">
        <label for="checkbox-all-country"></label>
        <span>{{trans.selectAll}}</span>
      </div>

      <div class="inline v-m" v-show="aIndex == 2">
        <input id="checkbox-all-Type" type="checkbox" :checked="allType" @click="choseAll(2)" v-show="false">
        <label for="checkbox-all-Type"></label>
        <span>{{trans.selectAll}}</span>
      </div>

    </div>
    <loading ref='loadingRef' :visible="isLoading"></loading>
  </div>
</template>

<script>
    import { mapState,mapGetters,mapMutations,mapActions } from 'vuex'
    import Bscroll from 'better-scroll'
    import loading from '../loading.vue'
    import triangle from '../triangle.vue'
    import wildItem from './wildItem'
    import  { throttle }  from '../../lib/util'
    export default {
        name: "wild",
        data(){
          return {
            searchText:'',
            aIndex:0,
            currentItem:{}, //用来修改视图
            count:0,
            firstCountry:true,
            firstType:true,
          }
        },
        components:{ loading,triangle,wildItem },
        computed:{
          ...mapState('googlemap',['curPosition']),
          ...mapState('wild',['netWorkError','lastTime','bottomLoading','currentIndex','wildShiny','displayOnMap','isLoading','petsData','allPokemons','allCountries','allTypes']),
          ...mapGetters('wild',['wildFilterData','allPokemon','allCountry','allType']),
          ...mapGetters(['trans','flags','nestImgPrefix','titleLang','flagPrefix','titlesName'])
        },
        created(){
          window.ConfigGet("wildSaveOptions",async (res)=>{
            let data = res == ''?{}:JSON.parse(res);
            this.$store.commit('wild/setSavedPet',data['petsOption']||[])
            await this.getPokemons();

            this.$store.commit('wild/setSavedCountry',data['countryOption']||[])
            await this.getCountries();

            this.$store.commit('wild/setSavedType',data['typeOption']||[])
            await this.getTypes();

            this.getData("new");
            this.refreshData();
            setInterval(()=>{
              this.getData('new');
            },10000)
          })
        },

        mounted(){
          this.$nextTick(()=>{
            this.$refs.petsDataRef.style.height = this.$parent.wrapHeight - 270 +'px';

            this.$refs.pOptionWrap.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$refs.cOptionWrap.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$refs.tOptionWrap.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$store.commit('wild/setCallBack',this.getDataScroll);
          })
        },

        methods:{
          cancel(){
            window.ConfigGet("wildSaveOptions",async (res)=>{
                let data = res == ''?{}:JSON.parse(res),
                     historyPet = data['petsOption']||[],
                     historyCountry = data['countryOption']||[],
                     historyType = data['typeOption']||[];

              this.allPokemons.forEach((item)=>{
                item.checked = historyPet.indexOf(item.id)>-1?true:false
              });

              this.$store.commit('wild/setAllPokemon',this.allPokemons.every(item=> item.checked === true))

              this.allCountries.forEach((item)=>{
                item.checked = historyCountry.indexOf(item.name)>-1?true:false
              });

              this.$store.commit('wild/setAllCountry',this.allCountries.every(item=> item.checked === true))

              this.allTypes.forEach((item)=>{
                item.checked = historyType.indexOf(item.key)>-1?true:false
              });

              this.$store.commit('wild/setAllType',this.allTypes.every(item=> item.checked === true))

              this.setCurrentIndex(0);
            })


          },
          confirm(){
            this.setFilterOptions();
            this.setCurrentIndex(0);
            this.getDataScroll();
          },
          changeOption(item,type){
            item.checked = !item.checked;
            let allCheck = false;
            switch(type){
              case 'pokemon':
                allCheck = this.allPokemons.every((item)=>{
                  return item.checked == true;
                });
                break;
              case 'country':
                allCheck = this.allCountries.every((item)=>{
                  return item.checked == true;
                })
                break;
              case 'type':
                allCheck = this.allTypes.every((item)=>{
                  return item.checked == true;
                })
                break;
            }
            this.$store.commit('wild/isAllChecked',{
                option:type,
                check:allCheck
            });
          },

          getLevel(value){
              if(value<1500||value == 1500){
                return 1500
              }else if(value>1500&&value<=2500){
                return 2500
              }else if(value>2500){
                return 'Unlimited'
              }
            },

          getTitleName(index){
            let result = {
              0:this.trans.greatleague,
              1:this.trans.ultraleague,
              2:this.trans.greatleague
            }
            return result[index]
          },

          getCpImg(value){
            if(value<1500||value ==1500){
              return './static/images/go_icon/GreatLeague.png'
            }else if(value>1500&&value<=2500){
              return './static/images/go_icon/UltraLeague.png'
            }else if(value>2500){
              return './static/images/go_icon/MasterLeague.png'
            }
          },

          async getDataScroll(){
            let _this = this;
            _this.$nextTick(()=>{
              if(!_this.wildScroll){
                _this.wildScroll = new Bscroll(_this.$refs.petsDataRef,{
                  click:true,
                  probeType:3,
                  scrollbar: true,
                  mouseWheel:true,
                  scrollY: true,
                  pullDownRefresh:{   //下拉50px触发条件
                    threshold:50,
                    stop:10
                  },
                  pullUpLoad:{
                    threshold:-50, //上拉50px触发条件
                  }
                })
              }else{
                _this.wildScroll.refresh();
              }

              _this.wildScroll.on('pullingUp',_this.uploadData);
            })
          },
          uploadData:throttle(function(){
            this.$store.commit('wild/addPage');
            this.getData("more")
            this.wildScroll.finishPullUp();
          },5000,5000),

          // getDetail(item){
          //   this.currentItem = item;
          //   this.$nextTick(()=>{  //防止视图不更新？
          //     this.$alert({
          //       'title':`${this.trans.battleInformation}`,
          //       'content':this.$refs.alertRef.outerHTML,
          //     });
          //   })
          // },

          shinyChange(){
            this.$store.commit('wild/setWildShiny',!this.wildShiny);
          },

          showOnMap(){
            this.$store.commit('wild/setDisplay',!this.displayOnMap);
            this.$store.dispatch('pokestop/refresh');
          },

          getBscroll(refObj){
            return new Bscroll(refObj,{
              click:true,
              probeType:3,
              scrollbar: true,
              mouseWheel:true,
            })
          },

          goPoint({item,index}){
            this.$store.commit('wild/setClick',{item,index});
            this.$parent.goPoint(item);
            this.$store.commit('setCurrentType','wild')
          },

          getPetName(id){
            if(this.titlesName[id+'']) return this.titlesName[id+''][this.titleLang];
          },

          choseAll(type){
            if(type == 0){
              this.$store.commit('wild/changePokemonsStatus',!this.allPokemon)
            }else if(type == 1){
              this.$store.commit('wild/changeCountriesStatus',!this.allCountry)
            }else{
              this.$store.commit('wild/changeTypesStatus',!this.allType)
            }
          },
          ...mapActions('wild',['webSocketTest','getData','getPokemons','getTypes','getCountries']),
          ...mapMutations('wild',['setFilterOptions','setCurrentIndex','refreshData'])
        }
    }
</script>

<style scoped lang="less">
  @import '../../assets/less/util';
  .wild-wrap {
    text-align: center;
    padding:10px;
    .nest-header {
      h3 {
        display: inline-block;
        text-align: center;
      }
      height: 30px;
      line-height: 30px;
      .icon-close {
        font-weight: 700;
        font-size: 20px;
        float: right;
        cursor: pointer;
      }
    }

    .title-input {
      -web-kit-appearance: none;
      -moz-appearance: none;
      width: 88%;
      border: 1px solid #C8cccf;
      color: #6a6f77;
      padding: 5px 0;
      border-radius: 4px;
      height: 1.7em;
      font-size: 14px;
      text-align: left;
      flex: 1;
    }

    .nest-content {
      width: 100%;
      height: 100%;
      font-size: 10px;
      text-align: left;
      box-sizing:border-box;


      .pet-title{
        display:flex;
        font-weight:700;
        span{
          flex:1;
          text-align: center;
          overflow:hidden;
        }
        .petname-title-wrap{
          flex:0 0 65px;
        }
        .go-wrap{
          flex: 0 0 30px;
        }
      }
    }

    .filter-wrap {
      .filter-header {
        margin-bottom: 10px;
        display: flex;
        .default-btn {
          flex: 1;
          height: 30px;
          line-height: 30px;
          font-size: 20px;
          font-weight: 200;
          border: 1px solid #eee;
        }
        .active {
          background-color: #4d90fe;
          color: #fff;
        }
      }
    }
    .check-wrap {
      text-align: left;
    }
    input[type="checkbox"] + label {
      cursor: pointer;
      font-size: 1em;
    }
    [id^="checkbox-"] + label {
      background-color: #ffffff;
      border: 1px solid #666666;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0px -15px 10px -12px rgba(0, 0, 0, 0.05);
      padding: 12px;
      border-radius: 3px;
      display: inline-block;
      vertical-align: middle;
    }
    [id^="checkbox-"] + label:active {
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0px 1px 3px rgba(0, 0, 0, 0.1);
    }
    [id^="checkbox-"]:checked + label {
      background-color: #4d90fe;
      border: 1px solid #4774DD;
    }
    .btn {
      margin: 0;
      outline: none;
      border: 1px solid transparent;
      box-sizing: border-box;
      display: inline-block;
      background-color: #4d90fe;
      color: #fff;
    }
    .h-center {
      margin: 0 auto;
    }
    .mb-10 {
      margin-bottom: 10px;
    }
    .mb-20{
      margin-bottom:20px;
    }
    .inline{
      display:inline-block;
    }
    .block{
      display: block;
    }
    .disable-btn{
      background-color:#ccc!important;
      color:#fff;
    }
    .icon-search{
      position:relative;
      right:35px;
      vertical-align: middle;
      font-size:22px;
      bottom:2px;
    }
    .icon-filter{
      position:absolute;
      right:0;
      bottom:5px;
      vertical-align: middle;
      font-size:22px;
      margin-right:5px;
    }
    .max-60{
      max-width:60px;
    }
    .max-100{
      max-width:100px;
    }
    .font-10{
      font-size:10px;
    }
    .search-content{
      position:relative;
    }
    .mr-10{
      margin-right:10px;
    }
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
  .bottom-loading{
    transform: translate(50%,0);
  }
  .o-h{
    overflow:hidden;
  }
  .text-left{
    text-align:left!important;
  }
</style>
