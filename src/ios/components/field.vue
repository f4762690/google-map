<template>
  <div class="field-wrap">
    <p class="font-10 mb-10">{{trans.lastUpdated}}: {{lastUpdateTime|timeFormat}} (UTC)</p>
    <div>
      <ul class="nest-content"  v-show="!ifFilter">
        <div class="mb-10 search-content">
          <input class="title-input" type="text" :placeholder="trans.nestsplaceholder" v-model="searchText" @input="()=>{$store.commit('field/setSearchword',searchText)}">
          <span class="icon-search"></span>
          <span class="icon-filter" @click.stop.prevent="startFilter"></span>
        </div>
        <div  class="pet-title" v-show="fieldFilterData.length>0">
          <span class="f-w-35 mr-10"></span>
          <span>{{trans.bouns}}</span>
          <span class="f-w-35 mr-10">{{trans.sourceText}}</span>
          <span style="flex:1.5;text-align:center">{{trans.researchTasks}}</span>
          <span class="button-container"></span>
        </div>
        <div v-show="netWorkError" @click="setFieldData('new')" class="error-info-class">Failed to load. Please try it again</div>
        <div class="scroll-wrap" ref="scrollRef">
          <ul class="pet-table">
            <transition  name="info-classes-transition" enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp">
              <div class="end-info" v-show="topEnd">
                已经最新的内容了<!--顶部加载完 -->
              </div>
            </transition>
            <div class="bottom-loading" v-show="topLoading">
              <mt-spinner :size="36" color="#4d90fe" type="fading-circle"></mt-spinner> <!--下拉加载动画 -->
            </div>
            <field-item v-for="(item,index) in fieldFilterData" :item="item" :key="index" @goPoint="go"></field-item>
            <transition  name="info-classes-transition" enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">
              <div class="end-info" v-show="bottomEnd">
                No More Data
              </div>
            </transition>
            <div class="bottom-loading" v-show="bottomLoading">
              <mt-spinner :size="36" color="#4d90fe" type="fading-circle"></mt-spinner>
            </div>
          </ul>
          <div class="text-center" v-show="!fieldFilterData.length">
            {{trans.nodata}}
          </div>
        </div>
        <ul class="filter-options-content">
          <li><span class="left">{{trans.showOnMap}}</span><mt-switch class="inline right" :value.sync="displayOnMap" @change="showOnMap"></mt-switch></li>
        </ul>
      </ul>
    </div>
    <div v-show="ifFilter">
      <div class="filter-wrap">
        <div class="filter-header">
          <span @click.stop.prevent="aIndex = 0" class="default-btn" :class="{'active':aIndex == 0}">Bonus</span>
          <span @click.stop.prevent="aIndex = 1" class="default-btn" :class="{'active':aIndex == 1}">{{trans.country}}</span>
        </div>
        <div class="check-wrap" v-show="aIndex == 0">
          <ul class="box-content" ref="bOptionWrap">
              <li v-for="(item,index) in bonusOptions" :key="index" class="mb-10">
                <input :id="'checkbox-'+index+'p'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'bonus')" v-show="false">
                <label :for="'checkbox-'+index+'p'"></label>
                <span>{{item.name}}</span>
              </li>
          </ul>
        </div>
        <div class="check-wrap" v-show="aIndex == 1">
          <ul class="box-content" ref="cOptionWrap">
              <li v-for="(item,index) in countries" :key="index" class="mb-10">
                <input :id="'checkbox-'+index+'c'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'country')" v-show="false">
                <label :for="'checkbox-'+index+'c'"></label>
                <span>{{item.countryName}}</span>
              </li>
          </ul>
        </div>
        <button class="btn h-center" @click.stop.prevent="cancel">{{trans.no}}</button>
        <button class="btn h-center" @click.stop.prevent="confirmFilter">{{trans.confirmContent}}</button>
        <div class="inline v-m" v-show="aIndex == 0">
          <input id="checkbox-all-pet" type="checkbox" :checked="checkAllBonus" @click="choseAll(0)" v-show="false">
          <label for="checkbox-all-pet"></label>
          <span>{{trans.selectAll}}</span>
        </div>
        <div class="inline v-m" v-show="aIndex == 1">
          <input id="checkbox-all-country" type="checkbox" :checked="checkAllCountry" @click="choseAll(1)" v-show="false">
          <label for="checkbox-all-country"></label>
          <span>{{trans.selectAll}}</span>
        </div>
      </div>
    </div>
    <loading ref='loadingRef' :visible="isLoading"></loading>
  </div>
</template>

<script>
  import loading from './loading';
  import BScroll from 'better-scroll';
  import { throttle } from '../lib/util';
  import fieldItem from './fieldItem'
  import { mapState,mapGetters,mapMutations,mapActions  } from 'vuex'
  export default {
    name: "field",
    props:['point'],
    data(){
      return {
        aIndex:0,
        searchText:'',
      }
    },
    components:{ loading,fieldItem },
    computed:{
      ...mapGetters(['pokemonImgPrefix','trans','titleLang','petsTitle','flags','flagPrefix']),
      ...mapState('field',['netWorkError','displayOnMap','topEnd','bottomEnd','topLoading','bottomLoading','isLoading']),
      ...mapGetters('field',['fieldFilterData','ifFilter','bonusOptions','bonus','tasksObj','fieldData','countries','checkAllBonus','checkAllCountry','getCheckedCountries','getCheckedBonus','lastUpdateTime'])
    },
    created(){
      window.ConfigGet('fieldSaveOptions',(res)=>{
        let data = res == ''?{}:JSON.parse(res);

        console.log(`返回的数据内容${res}`)

        this.$store.commit('field/setSavedPets',data['petOption']||[]);
        this.$store.commit('field/setSavedCountries',data['countryOption']||[])

        this.getOptions();

        this.setTaskName();

        this.setFieldData('new');

        setInterval(()=>{
          this.setFieldData('new')
        },60000)
      });
    },
    mounted(){
      this.$nextTick(()=>{
        this.$store.commit('field/setCallBack',this.fieldScroll);

        this.$refs.scrollRef.style.height = this.$parent.wrapHeight - 240 +'px';

        this.$refs.bOptionWrap.style.height = this.$parent.wrapHeight - 220 +'px';

        this.$refs.cOptionWrap.style.height = this.$parent.wrapHeight - 220 +'px';
          //定时刷新数据
      })
    },
    methods:{
      cancel(){
        window.ConfigGet('fieldSaveOptions',(res)=>{
            let data = res == ''?{}:JSON.parse(res),
                historyPets = data['petOption']||[],
                historyCountry = data['countryOption']||[];

                this.bonusOptions.forEach((item)=>{
                  item.checked = historyPets.indexOf(item.pet_id)>-1?true:false;
                })
                this.$store.commit('field/setAllBonus',this.bonusOptions.every(item=>item.checked === true));

                this.countries.forEach((item)=>{
                  item.checked = historyCountry.indexOf(item.countryName)>-1?true:false;
                })
                this.$store.commit('field/setAllCountry',this.countries.every(item=>item.checked === true));

                this.setFilter(false);
        })
      },
      changeOption(item,type){
        item.checked = !item.checked;
        let allCheck = false;
        switch(type){
          case 'bonus':
            allCheck = this.bonusOptions.every((item)=>{
              return item.checked == true;
            });
            break;
          case 'country':
            allCheck = this.countries.every((item)=>{
              return item.checked == true;
            })
            break;
        }
        this.$store.commit('field/isAllChecked',{
          option:type,
          check:allCheck
        });


      },

      showOnMap(){
        this.$store.commit('field/setDisplay',!this.displayOnMap);
        this.$store.dispatch('pokestop/refresh');
      },

      confirmFilter(){
        this.setFilterOptions();
        this.setFilter(false);
      },

      fieldScroll(){  //滚动多次触发的问题，记录一下.
        let _this = this;
        _this.$nextTick(()=>{
          if(!_this.fieldBS){
            _this.fieldBS = new BScroll(_this.$refs.scrollRef,{
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
            _this.fieldBS.refresh();
          }
          _this.fieldBS.on('pullingUp',_this.getData);

        })
      },

      getData:throttle(function(){
        this.setBottomLoading(true);
        this.addPage();
        this.setFieldData("more");
        this.fieldBS.finishPullUp();
      },5000,5000),

      go(obj){
        this.$parent.goPoint(obj);
        this.$store.commit('setCurrentType','field')
      },

      startFilter(){
        this.setFilter(true);
      },

      choseAll(type){
        switch (type) {
          case 0:
            this.$store.commit('field/setCheckAllBonus',!this.checkAllBonus);
            break;
          case 1:
            this.$store.commit('field/setAllCountries',!this.checkAllCountry);
            break;
        }
      },

      ...mapActions('field',['setFieldData','getOptions']),

      ...mapMutations('field',['setFilterOptions','setFilter','setTaskName','setCallBack','pullDownFieldData','setTopLoading','setBottomLoading','setLoading','setBonusOption','setCheckedBonus','setCheckedCountries','addPage','setCheckAllBonus','setCountries','setAllCountries'])

    }
  }
</script>

<style scoped lang="less">
  @import '../assets/less/util';
  .field-wrap{
    text-align:center;
    padding:10px;
    .nest-header{
      h3{
        display:inline-block;
        text-align:center;
      }
      height:30px;
      line-height:30px;
      .icon-close{
        font-weight:700;
        font-size:20px;
        float:right;
        cursor: pointer;
      }
    }

    .title-input{
      -web-kit-appearance:none;
      -moz-appearance: none;
      width:88%;
      border:1px solid #C8cccf;
      color:#6a6f77;
      padding:5px 0;
      border-radius:4px;
      height:1.7em;
      font-size:14px;
      text-align:left;
      flex:1;
    }

    .nest-content{
      width:100%;
      height:100%;
      font-size:10px;
      text-align:left;
    }

    .filter-wrap {
      .filter-header {
        margin-bottom:10px;
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
    .check-wrap{
      text-align:left;
    }
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
    .btn{
      margin:0;
      outline:none;
      border:1px solid transparent;
      box-sizing:border-box;
      display:inline-block;
      background-color:#4d90fe;
      color:#fff;
    }
    .h-center{
      margin:0 auto;
    }
    .mb-10{
      margin-bottom:10px;
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
    .v-m{
      vertical-align: middle;
    }
    .pet-title{
      display:flex;
      .f-w-35{
        flex:0 0 35px;
        width:35px;
        overflow:hidden;
      }
      span{
        flex:1;
        display:inline-block;
        font-weight:700;
        overflow:hidden;
      }
    }

    .pet-table{
      .end-info{
        background-color:rgba(77,144,254,0.9);
        padding:5px 0;
        text-align:center;
        color:#fff;
      }
    }
    .scroll-bottom{
      display:flex;
      justify-content:space-between;
      align-items: center;
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
  .bouns-text{
    word-break:normal;
  }
  .font-16{
    font-size:16px;
  }
  .button-container{
    flex:0 0 60px;
  }
</style>
