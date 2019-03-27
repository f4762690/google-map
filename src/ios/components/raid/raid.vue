<template>
  <div class="raid-wrap">
    <p class="font-10 mb-10">{{trans.lastUpdated}}: {{lastUpdateTime|timeFormat}} (UTC)</p>
    <div>
      <ul class="nest-content"  v-show="!ifFilter">
        <div class="mb-10 search-content">
          <input class="title-input" type="text" :placeholder="trans.nestsplaceholder" v-model="searchText" @input="$store.commit('raid/setSearchText',searchText)">
          <span class="icon-search"></span>
          <span class="icon-filter" @click.stop.prevent="startFilter"></span>
        </div>
        <div  class="pet-title" v-show="raidFilterData.length>0">
          <span class="f-w-55"></span>
          <span>{{trans.raidText}}</span>
          <span>{{trans.sourceText}}</span>
          <span>{{trans.time}}</span>
          <span class="button-container"></span>
        </div>
        <div class="scroll-wrap" ref="scrollRef">
          <ul class="pet-table">
            <div v-show="netWorkError" @click="()=>{setRaidData('new')}" class="error-info-class">Failed to load. Please try it again</div>
            <raid-item v-for="(item,index) in raidFilterData" :item="item" :key="index" @goPoint="go"></raid-item>
            <div class="bottom-loading" v-show="bottomLoading">
              <mt-spinner :size="36" color="#4d90fe" type="fading-circle"></mt-spinner>
            </div>
            <div class="end-info" v-show="bottomEnd">
              No More Data
            </div>
          </ul>
          <div class="text-center" v-show="!raidFilterData.length">
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
          <span @click.stop.prevent="aIndex = 0" class="default-btn" :class="{'active':aIndex == 0}">Raid</span>
          <span @click.stop.prevent="aIndex = 1" class="default-btn text-overflow" :class="{'active':aIndex == 1}">{{trans.level}}</span>
          <span @click.stop.prevent="aIndex = 2" class="default-btn" :class="{'active':aIndex == 2}">{{trans.country}}</span>
        </div>

        <div class="check-wrap" v-show="aIndex ==0">
          <ul class="box-content" ref="raidNamesRef">
            <div class="box-content-option">
              <li v-for="(item,index) in raidOptions" :key="index" class="mb-10">
                <input :id="'checkbox-'+index+'p'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'raidName')" v-show="false">
                <label :for="'checkbox-'+index+'p'"></label>
                <span>{{item.value}}</span>
              </li>
            </div>
          </ul>
        </div>

        <div class="check-wrap" v-show="aIndex ==1">
          <ul class="box-content" ref="levelsRef">
            <div class="box-content-option">
              <li v-for="(item,index) in raidLevel" :key="index" class="mb-10">
                <input :id="'checkbox-'+index+'l'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'level')" v-show="false">
                <label :for="'checkbox-'+index+'l'"></label>
                <span>{{item.key}}</span>
              </li>
            </div>
          </ul>
        </div>

        <div class="check-wrap" v-show="aIndex ==2">
          <ul class="box-content" ref="countriesRef">
            <div class="box-content-option">
              <li v-for="(item,index) in countryList" :key="index" class="mb-10">
                <input :id="'checkbox-'+index+'c'" type="checkbox" :checked="item['checked']" @click="changeOption(item,'country')" v-show="false">
                <label :for="'checkbox-'+index+'c'"></label>
                <span>{{item.countryName}}</span>
              </li>
            </div>
          </ul>
        </div>

        <button class="btn h-center" @click.stop.prevent="cancel">{{trans.no}}</button>
        <button class="btn h-center" @click.stop.prevent="filterOption">{{trans.confirmContent}}</button>

        <div class="inline v-m" v-show="aIndex == 0">
          <input id="checkbox-all-pet" type="checkbox" :checked="raidAll" @click="choseAll(0)" v-show="false">
          <label for="checkbox-all-pet"></label>
          <span>{{trans.selectAll}}</span>
        </div>

        <div class="inline v-m" v-show="aIndex == 1">
          <input id="checkbox-all-raidLevel" type="checkbox" :checked="allLevel" @click="choseAll(1)" v-show="false">
          <label for="checkbox-all-raidLevel"></label>
          <span>{{trans.selectAll}}</span>
        </div>

        <div class="inline v-m" v-show="aIndex == 2">
          <input id="checkbox-all-country" type="checkbox" :checked="allCountry" @click="choseAll(2)" v-show="false">
          <label for="checkbox-all-country"></label>
          <span>{{trans.selectAll}}</span>
        </div>
      </div>

    </div>
    <loading ref='loadingRef' :visible="isLoading"></loading>
  </div>
</template>

<script>
    import loading from '../loading';
    import BScroll from 'better-scroll';
    import raidItem from './raidItem';
    import { throttle } from '../../lib/util';
    import { mapState,mapGetters,mapMutations,mapActions  } from 'vuex'
    export default {
        name: "raid",
        props:['point'],
        data(){
          return {
            aIndex:0,
            searchText:'',
            firstPet:true,
            firstLevel:true,
            firstCountry:true,
            firstTime:true,
          }
        },
        components:{ loading,raidItem },
        computed:{
          ...mapGetters(['trans','titleLang','titlesName','flags','flagPrefix']),
          ...mapGetters('raid',['raidFilterData','ifFilter','netWorkError','displayOnMap','bottomEnd','raidLevel','upLoading','bottomLoading','isLoading','raidAll','allLevel','allCountry','raidOptions','lastUpdateTime','showMap','raidData','countryList'])
        },
        created(){
           window.ConfigGet("raidSaveOptions",(res)=>{
             let data = res == ''?{}:JSON.parse(res);
             this.setSavedRaid(data['checkedRaids']||[]);
             this.setSavedLevel(data['checkedLevels']||[]);
             this.setSavedCountry(data['checkedCountries']||[]);
             this.getOptions();
             this.setRaidData('new');
           })
        },
        mounted(){
          this.$nextTick(()=>{
            this.$refs.scrollRef.style.height = this.$parent.wrapHeight - 240 +'px';

            this.$refs.raidNamesRef.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$refs.levelsRef.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$refs.countriesRef.style.height = this.$parent.wrapHeight - 220 +'px';

            this.$store.commit('raid/setCallBack',this.raidScroll);

            setInterval(()=>{
              this.setRaidData('new')
            },60000)        //定时刷新数据
          })
        },
        methods:{
          cancel(){
            window.ConfigGet("raidSaveOptions",(res)=>{
              console.log(`返回的数据额${res}`);
              let data = res == ''?{}:JSON.parse(res),
                  historyRaid = data['checkedRaids']||[],
                  historyLevel = data['checkedLevels']||[],
                  historyCountry = data['checkedCountries']||[];

              this.raidOptions.forEach((item)=>{
                item.checked = historyRaid.indexOf(item.id)>-1?true:false
              });

              this.$store.commit('raid/setRaidAll',this.raidOptions.every(item=>item.checked === true));


              this.raidLevel.forEach((item)=>{
                item.checked = historyLevel.indexOf(item.value)>-1?true:false
              })

              this.$store.commit('raid/setAllLevel',this.raidLevel.every(item=>item.checked === true));

              console.log("结果是什么:"+this.raidLevel.every(item=>item.checked === true));

              this.countryList.forEach((item)=>{
                item.checked = historyCountry.indexOf(item.countryName)>-1?true:false
              })

              this.$store.commit('raid/setAllCountry',this.countryList.every(item=>item.checked === true));

              this.setFilter(false)
            })
          },
          changeOption(item,type){
              item.checked = !item.checked;
              let allCheck = false;
              switch(type){
                case 'raidName':
                  allCheck = this.raidOptions.every((item)=>{
                    return item.checked == true;
                  });
                  break;
                case 'level':
                  allCheck = this.raidLevel.every((item)=>{
                    return item.checked == true;
                  })
                  break;
                case 'country':
                  allCheck = this.countryList.every((item)=>{
                    return item.checked == true
                  });
                  break;
              }
              this.$store.commit('raid/isAllChecked',{
                option:type,
                check:allCheck
              });
          },

          choseAll(type){
            switch (type) {
              case 0:
                this.raidAllChange(!this.raidAll);
                break;
              case 1:
                this.levelChange(!this.allLevel);
                break;
              case 2:
                this.allCountryChange(!this.allCountry);
                break;
            }
          },

          showOnMap(){
            this.setDisplay(!this.displayOnMap)
            this.$store.dispatch('pokestop/refresh');
          },

          getRaidName(id){
            return  this.titlesName[id] ? this.titlesName[id][this.titleLang] : '?';
          },

          fh(item){
            return new Date().getTime() > item.start ?true:false;
          },

          filterOption(){   //设置过滤条件 //要点击了过滤就需要重置数据.
            this.setFilter(false);
            this.setFilterOptions();
            this.raidScroll();
          },

          go(obj){
            obj.ifClick = true;
            this.$parent.goPoint(obj);
            this.$store.commit('setCurrentType','raid')
          },

          startFilter(){
            this.setFilter(true);
          },

          raidScroll(){           //滚动多次触发的问题，记录一下.
            this.$nextTick(()=>{
              if(!this.raidBS){
                this.raidBS = new BScroll(this.$refs.scrollRef,{
                  click:true,
                  probeType:3,
                  scrollbar: true,
                  mouseWheel:true,
                  pullUpLoad:{
                    threshold:-30,
                  }
                })
              }else{
                this.raidBS.refresh();
              }
              let vm = this;
              vm.raidBS.on('pullingUp',vm.getData);
            })
          },

          getData:throttle(function(){
            this.setBottomLoading(true);
            this.addPage();
            this.setRaidData("more");
            this.raidBS.finishPullUp();
          },5000,5000),
          ...mapActions('raid',['setRaidData','getOptions']),
          ...mapMutations('raid',['setFilterOptions','setSavedRaid','setSavedLevel','setSavedCountry','setFilter','setBottomLoading','addPage','setLoading','setDisplay','setRaidAll','setAllLevel','setAllCountry','raidAllChange','levelChange','allCountryChange'])
        }
    }
</script>

<style scoped lang="less">
  @import '../../assets/less/util';
  .raid-wrap{
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
      flex-wrap: wrap;
      .f-w-35{
        flex:0 0 35px;
        width:35px;
        overflow:hidden;
      }
      .f-w-55{
        flex:0 0 55px;
        width:55px;
        overflow:hidden;
      }
      span{
        flex:1;
        max-width:100px;
        display:inline-block;
        font-weight:700;
        overflow:hidden;
      }
      .button-container{
        flex:0 0 60px!important;
      }
    }

    .pet-table{
      .end-info{
        background-color:rgba(77,144,254,0.9);
        padding:5px 0;
        text-align:center;
        color:#fff;
      }
      .icon-wrap{
        flex:0 0 55px;
        width:55px;
      }
      li{
        font-size:0;
        display:flex;
        flex-wrap: wrap;
        text-align:left;
        padding:10px 0;
        border-bottom:1px solid #ccc;
        vertical-align: middle;
        word-break:break-all;
        align-items:center;
        .icon{
          width:30px;
        }
        .f-w-35{
          flex:0 0 45px;
          width:35px;
        }
        span{
          vertical-align: middle;
          max-width:100px;
          flex:1;
          font-size:10px;
          display:inline-block;
        }
        .tip{
          width:16px;
          height:16px;
        }
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
</style>
