<template>
    <div class="nest-wrap">
      <p class="font-10 mb-10">{{trans.lastUpdated}}: {{lastDate|timeFormat}} (UTC)</p>
        <ul class="nest-content"  v-show="!ifFilter">
          <div class="mb-10 search-content">
            <input class="title-input" type="text" :placeholder="trans.nestsplaceholder" v-model="searchText">
            <span class="icon-filter" @click.stop.prevent="setFilter(true)"></span>
          </div>
          <div  class="pet-title" v-show="getPetData.length>0">
            <span class="f-w-35 mr-10"></span>
            <span>Pokémon</span>
            <span>ID</span>
            <span>{{trans.region}}</span>
            <span>{{trans.yield}}</span>
            <span></span>
          </div>

          <div v-show="netWorkError" @click="getNewsData" class="error-info-class">Failed to load. Please try it again</div>
          <div class="pets-content" ref="scrollRef">
            <ul class="pet-table">
              <nest-item v-for="(item,index) in getPetData" :item="item" :key="index" @goPoint="go"></nest-item>
            </ul>
            <div class="text-center" v-show="!getPetData.length">
              {{trans.nodata}}
            </div>
          </div>
          <ul class="filter-options-content">
            <li><span class="left">{{trans.showOnMap}}</span><mt-switch class="inline right" :value.sync="displayOnMap" @change="showOnMap"></mt-switch></li>
          </ul>
        </ul>
      <div v-show="ifFilter">
        <div class="filter-wrap">
          <div class="filter-header">
            <span @click.stop.prevent="aIndex = 0" class="default-btn" :class="{'active':aIndex == 0}">Pokémon</span>
            <span @click.stop.prevent="aIndex = 1" class="default-btn" :class="{'active':aIndex == 1}">{{trans.country}}</span>
          </div>

            <div class="check-wrap" v-show="aIndex ==0">
              <ul class="box-content" ref="pOptionWrap">
                <div>
                  <li v-for="(item,index) in titleList" :key="index" class="mb-10">
                    <input :id="'checkbox-'+index+'p'" type="checkbox" :checked="item['checked']" @click="choseTitle(item)" v-show="false">
                    <label :for="'checkbox-'+index+'p'"></label>
                    <span>{{item.title}}</span>
                  </li>
                </div>
              </ul>
            </div>

            <div class="check-wrap" v-show="aIndex ==1">
              <ul class="box-content" ref="cOptionWrap">
                <div>
                  <li v-for="(item,index) in countryList" :key="index" class="mb-10">
                    <input :id="'checkbox-'+index+'c'" type="checkbox" :checked="item['checked']" @click="choseCountry(item)" v-show="false">
                    <label :for="'checkbox-'+index+'c'"></label>
                    <span>{{item.countryName}}</span>
                  </li>
                </div>
              </ul>
            </div>
          <button class="btn h-center" @click.stop.prevent="cancel">{{trans.no}}</button>
          <button class="btn h-center" @click.stop.prevent="searchPets">{{trans.confirmContent}}</button>

          <div class="inline v-m" v-show="aIndex == 0">
            <input id="checkbox-all-pet" type="checkbox" :checked="allPets" @click="choseAll(0)" v-show="false">
            <label for="checkbox-all-pet"></label>
            <span>{{trans.selectAll}}</span>
          </div>

          <div class="inline v-m" v-show="aIndex == 1">
            <input id="checkbox-all-country" type="checkbox" :checked="allCountries" @click="choseAll(1)" v-show="false">
            <label for="checkbox-all-country"></label>
            <span>{{trans.selectAll}}</span>
          </div>

        </div>
      </div>
      <loading ref='loadingRef' :visible="isLoading"></loading>
    </div>
</template>

<script>
    import { throttle } from '../lib/util'
    import nestItem from './nestItem'
    import { mapState,mapGetters,mapMutations } from 'vuex'
    import loading from './loading.vue'
    const waitTime = 3000;
    export default {
        name: "nest",
        data(){
          return {
            netWorkError:false,
            allPets:true,
            allCountries:true,
            lastDate:'',
            aIndex:0,
            search:'',
            petData:[],
            petsTitle:new Map(),
            titleList:[],
            countryList:[],
            searchText:'',
            petsOption:[],
            countriesOption:[],
          }
        },
        components:{ loading, nestItem },
        watch:{
          getPetData(){
            this.$store.commit('nests/setNestDataList',this.getPetData)
          }
        },
        computed:{
          getPetData(){
            if(this.petData.length<=0){
              return []
            }
            let __reg = new RegExp(this.searchText,'ig');
            return  this.petData.filter((item)=>{
              let _search = true;
              let _country = true;
              let _pet = true;
              if(__reg.test(item.pet_id)||__reg.test(item.petName)){
                _search = true;
              }else{
                _search = false;
              }
              if(this.petsOption.length>0&&this.petsOption){
                _pet = this.petsOption.indexOf(item.pet_id) ==-1?false:true;
              }
              if(this.countriesOption.length>0&&this.countriesOption){
                _country = this.countriesOption.indexOf(item.country) ==-1?false:true;
              }
              return _search&&_pet&&_country;
            })
          },
          ...mapGetters('nests',['displayOnMap','ifFilter','savedPets','savedCountries','isLoading']),
          ...mapGetters(['nestImgPrefix','flags','flagPrefix','currentLanguage','trans','langs','userToken','titleLang','titlesName'])
        },
        methods:{
          cancel(){
            window.ConfigGet('nestSaveOptions',(res)=>{
              let data = res == ""?{}: JSON.parse(res),
                  historyPets = data['savedPets']||[],
                  historyCountry = data['savedCountries']||[];
                  this.titleList.forEach((item)=>{
                    item.checked = historyPets.indexOf(item.pet_id) >-1?true:false;
                  });

                  this.allPets = this.titleList.every(item=> item.checked === true)

                  this.countryList.forEach((item)=>{
                    item.checked = historyCountry.indexOf(item.countryName)>-1?true:false;
                  });

                  this.allCountries = this.countryList.every(item=> item.checked === true)

                  this.setFilter(false)
            })

          },
          choseTitle(item){
            item.checked = !item.checked;
            let allCheck = this.titleList.every((item)=>{
              return item.checked == true
            });
            this.allPets = allCheck?true:false;
          },

          choseCountry(item){
            item.checked = !item.checked;
            this.allCountries = this.countryList.every((item)=>{
              return item.checked == true
            })
          },

          getNewsData:throttle(function(){
            this.getData();
          },5000,5000),

          showOnMap(){
            this.$store.commit('nests/setDisplay',!this.displayOnMap);
            this.$store.dispatch('pokestop/refresh');
          },

          choseAll(type){
            switch (type){
              case 0:
                this.allPets = !this.allPets;
                this.titleList.map((item)=>{
                  item.checked = this.allPets;
                });
                break;
              case 1:
                this.allCountries= !this.allCountries;
                this.countryList.map((item)=>{
                  item.checked = this.allCountries;
                });
                break;
            }
          },

          go(obj){
            obj['ifClick'] = true;
            this.$parent.goPoint(obj);
            this.$store.commit('setCurrentType','nest')
          },

          show(){                                       //    初始化数据
            this.setFilter(false);
            this.searchText = '';
            this.aIndex = 0;
          },

         async  getData(){
            await this.$http.get('http://vlocapi.thinkskysoft.com/api/v1/pet/map_more',{params:{
                lang:this.langs.lanCode[this.currentLanguage],},
                _timeout:30000,//设置超时时间
              },
            ).then((res)=>{
              this.setLoading(false);
              this.petData = res['body']['data'];

              let petsTitle = new Map(),
                  countries = new Map();

              //获取到pokemon和country的过滤条件数据
              this.petData.forEach((item)=>{
                item['ifClick'] = false;
                let titleName = '';

                titleName = this.titlesName[parseInt(item.pet_id)]?
                            this.titlesName[parseInt(item.pet_id)][this.titleLang]?
                            this.titlesName[parseInt(item.pet_id)][this.titleLang]:
                            this.titlesName[parseInt(item.pet_id)]['en_title']:
                            '?';

                item['petName'] = titleName;

                let petChecked = false,
                    countryChecked = false;

                if(this.savedPets.indexOf(item.pet_id)>-1){
                  petChecked = true;
                }

                if(this.savedCountries.indexOf(item.country)>-1){
                  countryChecked = true;
                }

                petsTitle.set(titleName,{
                  pet_id:item.pet_id,
                  title:titleName,
                  checked:petChecked
                });

                countries.set(item.country,{
                  checked:countryChecked,
                  countryName:item.country
                });
              });

              this.titleList = [...petsTitle.values()];

              this.countryList =[...countries.values()];

              this.netWorkError = false;
            }).catch(e=>{
                this.setLoading(false);
                this.netWorkError = true;
            })

           this.searchPets();
          },

          searchPets(){
            this.petsOption = [];
            this.countriesOption = [];

            this.titleList.forEach((item)=>{
              if(item.checked) this.petsOption.push(item.pet_id);
            });

            this.allPets = this.titleList.every(item=>item.checked === true);

            this.countryList.forEach((item)=>{
              if(item.checked) this.countriesOption.push(item.countryName);
            });

            this.allCountries = this.countryList.every(item=>item.checked === true);

            let savedPets = this.petsOption,
                savedCountries = this.countriesOption,
                optionStr = JSON.stringify({savedPets,savedCountries});
            window.SyncConfig('nestSaveOptions',optionStr);  //保存每次的选择

            this.setFilter(false);
          },
          ...mapMutations('nests',['setFilter','setLoading']),
        },
        created(){
          window.ConfigGet('nestSaveOptions',(res)=>{
            let data = res == ""?{}: JSON.parse(res);
            this.$store.commit('nests/setSavedPets',data['savedPets']||[]);
            this.$store.commit('nests/setSavedCountries',data['savedCountries']||[])
            this.getData();
          })
        },

        mounted(){
          this.$nextTick(()=>{
            this.$refs.scrollRef.style.height = this.$parent.wrapHeight - 240 + "px";
            this.$refs.pOptionWrap.style.height = this.$parent.wrapHeight - 220 + "px";
            this.$refs.cOptionWrap.style.height = this.$parent.wrapHeight - 220 + "px";
            this.$http.get('http://vlocapi.thinkskysoft.com/api/v1/pet/update_date').then((res)=>{
              if(!!res.data.status){
                let date = res.data.updated_at.replace(new RegExp(/-/gm),'/')
                this.lastDate = new Date(date);
              }
            }).catch(err=>console.log(err))
          })
        }
    }
</script>

<style scoped lang="less">
   @import '../assets/less/util';
  .nest-wrap{
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
      width:100%;
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
    .flag-wrap{
      border:1px solid #ccc;
      vertical-align:middle;
      width:35px;
      height:20px;
    }
    .pet-title{
      display:flex;
      overflow:hidden;
      .f-w-35{
        flex:0 0 35px;
        width:35px;
      }
      span{
        flex:1;
        max-width:100px;
        display:inline-block;
        font-weight:700;
      }
    }

    .pets-content{
      position: relative;
      margin-bottom:10px;
      overflow:scroll;
      -webkit-overflow-scrolling: touch;
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
</style>
