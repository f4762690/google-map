<template>
    <div class="gym-wrap">
      <p class="font-10 mb-10 text-center">{{trans.lastUpdated}}: {{lastUpdated|timeFormat}}(UTC)</p>
      <div v-show="!ifFilter">
        <div class="mb-10 search-content">
          <input class="title-input" type="text" :placeholder="trans.nestsplaceholder" v-model="searchText" @input="()=>{$store.commit('gym/setGymName',searchText)}">
          <span class="icon-search" @click.stop.prevent="searchGym"></span>
          <span class="icon-filter" @click.stop.prevent="startFilter"></span>
        </div>
        <div class="pet-title">
          <span>{{trans.sourceText}}</span>
          <span>{{trans.defense}}</span>
        </div>
        <ul class="scroll-wrap" ref="gymDataWrap">
            <div>
                <li v-show="netWorkError" @click="getData('new')" class="error-info-class">Failed to load. Please try it again</li>
                <gym-item :item="item" v-for="(item,index) in gymFilterData" :key="index" @goPoint="go"></gym-item>
                <div class="bottom-loading" v-show="bottomLoading">
                  <mt-spinner :size="36" color="#4d90fe" type="fading-circle"></mt-spinner>
                </div>
            </div>
            <div class="text-center" v-show="!gymFilterData.length">
              {{trans.nodata}}
            </div>
          </ul>

        <ul class="filter-options-content">
          <li><span class="left">{{trans.showOnMap}}</span><mt-switch class="inline right" :value.sync="displayOnMap" @change="showOnMap"></mt-switch></li>
        </ul>
      </div>
      <div v-show="ifFilter">
        <div class="filter-wrap">
          <div class="filter-header">
            <!--<span @click.stop.prevent="()=>{aIndex = 0}" class="default-btn" :class="{'active':aIndex == 0}">city</span>-->
            <span @click.stop.prevent="()=>{aIndex = 1}" class="default-btn" :class="{'active':aIndex == 1}">{{trans.country}}</span>
            <span @click.stop.prevent="()=>{aIndex = 2}" class="default-btn" :class="{'active':aIndex == 2}">{{trans.team}}</span>
            <span @click.stop.prevent="()=>{aIndex = 3}" class="default-btn" :class="{'active':aIndex == 3}">{{trans.vacancy}}</span>
          </div>
          <div class="check-wrap" v-show="aIndex ==0">
            <ul class="box-content" ref="cityRef">
              <li v-for="(item,index) in cities" :key="index" class="mb-10">
                <input :id="'checkbox-'+index+'ct'" type="checkbox" :checked="item['checked']" @click="item.checked = !item.checked" v-show="false">
                <label :for="'checkbox-'+index+'ct'"></label>
                <span>{{item.name}}</span>
              </li>
            </ul>
          </div>

          <div class="check-wrap" v-show="aIndex ==1">
            <ul class="box-content" ref="countryRef">
                <li v-for="(item,index) in countries" :key="index" class="mb-10">
                  <input :id="'checkbox-'+index+'c'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'country')" v-show="false">
                  <label :for="'checkbox-'+index+'c'"></label>
                  <span>{{item.name}}</span>
                </li>
            </ul>
          </div>

          <div class="check-wrap" v-show="aIndex ==2">
            <ul class="box-content" ref="campRef">
                <li v-for="(item,index) in camps" :key="index" class="mb-10">
                  <input :id="'checkbox-'+index+'ca'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'camp')" v-show="false">
                  <label :for="'checkbox-'+index+'ca'"></label>
                  <span>{{item.name}}</span>
                </li>
            </ul>
          </div>

          <div class="check-wrap" v-show="aIndex ==3">
            <ul class="box-content" ref="remainRef">
              <li v-for="(item,index) in remains" :key="index" class="mb-10">
                <input :id="'checkbox-'+index+'r'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'remain')" v-show="false">
                <label :for="'checkbox-'+index+'r'"></label>
                <span>{{item.value}}</span>
              </li>
            </ul>
          </div>

          <button class="btn h-center" @click.stop.prevent="cancel">{{trans.no}}</button>
          <button class="btn h-center" @click.stop.prevent="searchGym">{{trans.confirmContent}}</button>

          <div class="inline v-m" v-show="aIndex == 0">
            <input id="checkbox-all-city" type="checkbox" :checked="allCity" @click="choseAll(0)" v-show="false">
            <label for="checkbox-all-city"></label>
            <span>{{trans.selectAll}}</span>
          </div>
          <div class="inline v-m" v-show="aIndex == 1">
            <input id="checkbox-all-country" type="checkbox" :checked="allCountry" @click="choseAll(1)" v-show="false">
            <label for="checkbox-all-country"></label>
            <span>{{trans.selectAll}}</span>
          </div>
          <div class="inline v-m" v-show="aIndex == 2">
            <input id="checkbox-all-camp" type="checkbox" :checked="allCamp" @click="choseAll(2)" v-show="false">
            <label for="checkbox-all-camp"></label>
            <span>{{trans.selectAll}}</span>
          </div>

          <div class="inline v-m" v-show="aIndex == 3">
            <input id="checkbox-all-remain" type="checkbox" :checked="allRemain" @click="choseAll(3)" v-show="false">
            <label for="checkbox-all-remain"></label>
            <span>{{trans.selectAll}}</span>
          </div>
        </div>
      </div>
      <loading ref='loading' :visible="isLoading"></loading>
    </div>
</template>

<script>
    import { mapState,mapGetters,mapMutations,mapActions} from 'vuex'
    import Bscroll from 'better-scroll'
    import loading from '../loading';
    import gymItem from './gymItem'
    import  { throttle }  from '../../lib/util'
    export default {
      name: "gym",
      components: { gymItem,loading },
      data(){
          return {
            count:0,
            aIndex:1,
            updateTime:'',
            searchText:'',
            ifFirstFilter:true
          }
        },

        created(){
        },

        mounted(){
          this.setLoading(true);
          this.$nextTick(()=>{
            this.$refs.gymDataWrap.style.height = this.$parent.wrapHeight - 240 +'px';

            this.$refs.countryRef.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$refs.campRef.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$refs.remainRef.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$store.commit('gym/setCallBack',this.getDataScroll);

            window.ConfigGet("gymSaveOptions",(res)=>{
              let data = res == ''?{}:JSON.parse(res);

              this.setSavedCountry(data['countryOption']||[]);
              this.getCountries();

              this.setSavedTeam(data['teamOption']||[]);
              this.setCamps([{
                name:this.trans.valor,
                value:1,
                checked:this.savedTeam.indexOf(1)>-1,
              },{
                name:this.trans.mystic,
                value:2,
                checked:this.savedTeam.indexOf(2)>-1,
              },{
                name:this.trans.instinct,
                value:3,
                checked:this.savedTeam.indexOf(3)>-1,
              }]);

              this.$store.commit('gym/setAllCamp',this.camps.every(item=>item.checked == true))

              this.setSavedVacancy(data['capacityOption']||[]);

              this.setRemains([{
                value:1,
                checked:this.savedVacancy.indexOf(1)>-1,
              },{
                value:2,
                checked:this.savedVacancy.indexOf(2)>-1,
              },{
                value:3,
                checked:this.savedVacancy.indexOf(3)>-1,
              },{
                value:4,
                checked:this.savedVacancy.indexOf(4)>-1,
              },{
                value:5,
                checked:this.savedVacancy.indexOf(5)>-1,
              },{
                value:6,
                checked:this.savedVacancy.indexOf(6)>-1,
              }]);

              this.$store.commit('gym/setAllRemain',this.remains.every(item=>item.checked == true))

              this.getData('new');

              setInterval(()=>{
                this.getData('new');
              },60000)
            });
          })

        },
        computed:{
          ...mapGetters(['trans']),
          ...mapGetters('gym',['gymFilterData','savedTeam','savedVacancy','ifFilter','gymData','isLoading','camps','lastUpdated','netWorkError','gymName','bottomLoading','displayOnMap','remains','countries','cities','allCountry','allCity','allCamp','allRemain'])
        },
        methods:{
          changeOption(item,type){
            item.checked = !item.checked;
            let allCheck = false;
            switch (type) {
              case 'country':
                 allCheck = this.countries.every((item)=>{
                  return item.checked == true;
                });
                break;
              case 'camp':
                 allCheck = this.camps.every((item)=>{
                  return item.checked == true;
                });
                break;
              case 'remain':
                 allCheck = this.remains.every((item)=>{
                  return item.checked == true;
                });
                break;
            }
            this.$store.commit('gym/isAllChecked',{
              option:type,
              check:allCheck
            })
          },

           filterOption(){
             this.getData('filter');
          },

          startFilter(){
            this.setFilter(true);
          },

          cancel(){
            window.ConfigGet("gymSaveOptions",(res)=> {
              let data = res == '' ? {} : JSON.parse(res),
                  historyCountry = data['countryOption'] || [],
                  historyTeam = data['teamOption'] || [],
                  historyCapacity = data['capacityOption'] || [];

              this.countries.forEach((item)=>{
                item.checked = historyCountry.indexOf(item.name)>-1?true:false
              })
              this.$store.commit('gym/setAllCountry',this.countries.every(item => item.checked === true));

              this.camps.forEach((item)=>{
                item.checked = historyTeam.indexOf(item.value)>-1?true:false
              })
              this.$store.commit('gym/setAllCamp',this.camps.every(item=>item.checked == true))

              this.remains.forEach((item)=>{
                item.checked = historyCapacity.indexOf(item.value)>-1?true:false
              })
              this.$store.commit('gym/setAllRemain',this.remains.every(item=>item.checked == true))
              this.setFilter(false);
            })
          },

          searchGym(){
            this.setFilter(false);
            this.setFilterOptions();
          },

          choseAll(type){
            switch(type){
              case 0:
                this.$store.commit('gym/changeCityStatus',!this.allCity)
                break;
              case 1:
                this.$store.commit('gym/changeCountryStatus',!this.allCountry)
                break;
              case 2:
                this.$store.commit('gym/changeCampStatus',!this.allCamp)
                break;
              case 3:
                this.$store.commit('gym/changeRemainStatus',!this.allRemain)
                break;
              default:
                console.log("没有该类型");
            }
          },

          go(obj){
            this.$parent.goPoint(obj);
            this.$store.commit('setCurrentType','gym');
          },

          async getDataScroll(){
            let _this = this;
            _this.$nextTick(()=>{
              if(!_this.gymScroll){
                _this.gymScroll = new Bscroll(_this.$refs.gymDataWrap,{
                  bounce:true,
                  bounceTime:700,
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
                _this.gymScroll.refresh();
              }
              _this.gymScroll.on('pullingUp',this.uploadData);
            })
          },

          uploadData:throttle(function(){
              this.$store.commit('gym/setBottomLoading',true);
              this.$store.commit('gym/addPage');
              this.getData('more');
              this.gymScroll.finishPullUp();
              this.$store.commit('gym/setBottomLoading',false);
          },5000,5000),

          showOnMap(){
              this.$store.commit('gym/setDisplay',!this.displayOnMap);
              this.$store.dispatch('pokestop/refresh');
          },
          ...mapActions('gym',['getData','getCountries']),
          ...mapMutations('gym',['setFilterOptions','setLoading','setRemains','setFilter','setCamps','setSavedCountry','setSavedTeam','setSavedVacancy']),
        }
    }
</script>

<style scoped lang="less">
  .gym-wrap{
    padding:10px;
    .search-content{
      position:relative;
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
    }

    .pet-title{
      display:flex;
      text-align:center;
      font-weight:700;
      font-size:10px;
      span:nth-child(1){
        width:60px!important;
      }
      span:nth-child(2){
        flex:1;
        overflow:hidden;
        display:inline-block;
      }
      span:nth-child(3){
        width:80px!important;
      }
    }

    .filter-options-content{
      font-size:10px;
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
    }

    .mr-10{
      margin-right:10px;
    }

  }

  .filter-wrap {
    text-align:center;
    .filter-header {
      margin-bottom:10px;
      display: flex;
      text-align:center;
      .default-btn {
        flex: 1;
        height: 30px;
        line-height: 30px;
        font-size: 20px;
        font-weight: 200;
        border: 1px solid #eee;
        overflow:hidden;
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

  .h-center{
    margin:0 auto;
  }

  .v-m{
    vertical-align: middle;
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
  .bottom-loading{
    transform: translate(50%,0);
  }
  .font-10{
    font-size:10px;
  }
</style>
