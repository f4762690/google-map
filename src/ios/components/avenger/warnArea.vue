<template>
  <div class="wrap">
    <dl class="chose-city" @click.stop.prevent="()=>{showCity = !showCity}">
      <dd>{{choseCityText}}<i class="icon-plus right"></i></dd>
    </dl>

    <div  class="add-item" @click.stop.prevent="showAddWin">
      {{trans.addWarnArea}}<i class="icon-plus right"></i>
    </div>

    <ul class="area-container" ref="containerRef">
      <li v-for="(item,index) in areaList" :key="index" class="area-item">
        {{item.name}}
        <i class="icon-bin right" @click.stop.prevent="deleteAreaWin(item.md5)"></i>
        <i class="icon-pencil right" @click.stop.prevent="showEditWin(item)"></i>
      </li>
    </ul>

    <transition name="el-message-fade">
      <div class="less-message-wrap" :class="areaWin?'areaWin-show':'areaWin-hide'">
        <div class="less-message-box">
          <div class="less-message-box-title">
            <p>{{winType == 'add'?trans.addWarnArea:trans.editWarnArea}}</p><i class="icon-close" @click="close"></i>
          </div>
          <div class="less-message-box-content">
              <p class="error-info" v-show="nameError">{{nameErrorInfo}}</p>
            <input id="areaNameId" type="text" :placeholder="trans.towerNameInput" v-model="inputName" class="area-win-input" @input="checkName">
              <p class="error-info" v-show="pointError">{{pointErrorInfo}}</p>
            <input type="text" :placeholder="trans.towerPointInput" v-model="inputPoint" class="area-win-input" @input="checkPoint">
            <div class="text-center">
              <button @click.stop.prevent="getCurPoint" class="btn btn-default">
                {{trans.currentPoint}}
              </button>
              <button @click.stop.prevent="fromClipboard" class="btn btn-default">
                {{trans.FromClipBoard}}
              </button>
            </div>
          </div>
          <div class="less-message-box-btn-group" >
            <button  @click.stop.prevent="confirm" class="btn btn-default">{{trans.yes}}</button>
          </div>
        </div>
      </div>
    </transition>
    <transition  name="info-classes-transition" enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown">
      <ul class="city-wrap" v-show="showCity">
        <li v-for="(item,key) in cities" class="city-item" @click.stop.prevent="addCityArea(item)" :class="{'active':item.checked}">{{item.name}}</li>
      </ul>
    </transition>
    <transition name="bg-class-transition" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <div class="city-wrap-bg" v-show="showCity" @click="showCity = false"></div>
    </transition>

    <loading ref='loadingRef' :visible="isLoading"></loading>
  </div>
    
</template>

<script>
    import { mapState,mapGetters } from 'vuex';
    import loading from '../loading';
    "use strict";
    export default {
        name: "warnArea",
        data(){
          return {
            choseCityText:'',
            showCity:false,
            cities:[],
            areaWin:false,
            inputName:'',
            inputPoint:'',
            areaList:[],
            nameError:false,
            pointError:false,
            winType:'add',
            editItem:'',
            nameErrorInfo:'',
            pointErrorInfo:'',
            type:0,                 //警戒区域类型 1-防守塔 2-城市
            checkedOption:{},
            isLoading:true,
            deleteMd5:'',   //每次添加区域需要删除上次添加成功的区域的md5值
          }
        },

        components:{ loading },

        computed:{
          ...mapState('googlemap',['curPosition']),
          ...mapGetters(['trans','userToken','choseCity'])
        },

        created(){
          this.choseCityText = this.trans.choseCity;
          this.getCities();
          this.getAreaList();
        },

        mounted(){
          this.$nextTick(()=>{
            this.$refs.containerRef.style.height = this.$parent.wrapHeight - 160 +'px';
          })
        },

        methods:{
          close(){
            this.nameError = false;
            this.pointError = false;
            this.nameErrorInfo = '';
            this.pointErrorInfo = '';
            this.areaWin = false;
          },

          showEditWin(item){
            this.areaWin = true;
            this.winType = 'edit';
            this.inputName = item.name;
            this.inputPoint = item.lat+","+item.lng;
            this.editItem = item;
            document.getElementById("areaNameId").focus();
          },

          showAddWin(){
            this.type = 1;
            this.areaWin = true;
            this.winType = 'add';
            this.inputName = '';
            this.inputPoint = '';
            document.getElementById("areaNameId").focus();
          },

          confirm(){
            this.checkName();
            this.checkPoint();
            if(this.nameError||this.pointError) return;
            if(this.winType == 'add'){
              if(this.areaList.length>19){
                this.$alert({
                  'title':this.trans.prompt,
                  'content':`${this.trans.warnAreaLengthError}!`,
                  'btns':[this.trans.gotit]
                })
                return
              }

            }else if(this.winType == 'edit'){
            }
            this.editArea();
          },

          addCityArea(item){
            this.cities.forEach((itemList)=>{   //清空其它选项
              if(itemList.md5 != item.md5) itemList.checked = false;
            });
            item.checked = !item.checked;
            this.winType = 'add';
            this.checkedOption = item;
            this.showCity = false;
            this.type = 2;
            if(item.checked){
              this.$store.commit("setChoseCity",item.md5);
              this.choseCityText = item.name;
              this.editArea()
            }else{
              this.$store.commit("setChoseCity",'');
              this.choseCityText = this.trans.choseCity;
              this.deleteArea();
            }
          },

          getCities(){
            this.$http.get('//vlocapitest.thinkskysoft.com/api/v1/warnarea/city').then((res)=>{
              if(res.data.status == true){
                for(let key in res.data.data){
                  let ifCheck = false;

                  if(res.data.data[key].md5 == this.choseCity){
                    ifCheck = true;
                    this.choseCityText = key;
                  }

                  this.cities.push({
                    name:key,
                    lat:res.data.data[key].lat,
                    lng:res.data.data[key].lng,
                    md5:res.data.data[key].md5,
                    checked:ifCheck,
                  })
                }
              }
            })
          },

          checkName(){
            if(this.inputName.length>20){
              this.nameError = true;
              this.nameErrorInfo = this.trans.areaNameError;
            }else{
              this.nameError = false;
            }
          },

          checkPoint(){
            if(this.inputPoint == ''||!/^-*\d+\.\d+,-*\d+\.\d+$/.test(this.inputPoint)){
              this.pointError = true;
              this.pointErrorInfo = this.trans.pointError;
            }else{
              // 经度范围：-90.0000~90.0000
              // 纬度范围：-180.0000~180.0000;
              let lat = this.inputPoint.split(",")[0],
                  lng = this.inputPoint.split(",")[1];
              if(lat<-90||lat>90||lng<-180||lng>180){
                this.pointError = true;
                this.pointErrorInfo = this.trans.pointRange;
              }else{
                this.pointError = false;
              }
            }
          },

          getAreaList(){
            this.$http.get('https://vlocapitest.thinkskysoft.com/api/v1/warnarea/index',{params:{"token":this.userToken}}).then((res)=>{
              if(res.data.status){
                this.areaList = res.data.data;
              }
              this.isLoading = false;
            }).catch(e =>{
              this.isLoading = false;
            })
          },

          getCurPoint(){
            this.inputPoint = this.curPosition.lat+","+this.curPosition.lng;
            this.checkPoint();
          },

          fromClipboard(){
            this.$getCopyText((res)=>{
              if(res){                        //可能第一次没有数据
                res = res.replace(/\s/g, "");
                if(/\.\d{9}$/.test(res.split(",")[0]) && /\.\d{9}$/.test(res.split(",")[1])){
                  res = this.$gps.decryptPoint(res.split(",")[0],res.split(",")[1],'string')
                }
              }

              let copyText = res;

              if(copyText!="" && /^-*\d+\.\d+\,-*\d+\.\d+$/.test(copyText))
              {
                copyText = copyText.replace(/\s/g,'')

                this.inputPoint =  copyText.split(',')[0]+","+copyText.split(',')[1];
              }else{
                this.inputPoint = '';
              }
              this.checkPoint();
            })
          },

          deleteAreaWin(md5){
            this.$alert({
              'title':this.trans.prompt,
              'content':`${this.trans.deleteWarnArea}?`,
              'btns':[this.trans.yes,this.trans.no]
            },()=>{
              this.deleteArea(md5);
            });
          },

          deleteArea(md5){ //删除区域
            let params = {token:this.userToken,type:this.type};
            params = md5?Object.assign({},params,{md5:md5,type:1}):Object.assign({},params,{type:2});
            this.$http.get('https://vlocapitest.thinkskysoft.com/api/v1/warnarea/del',{params:params}).then((res)=>{
              if(res.data.status){
                this.$tip({
                  content:"删除成功",
                });
                this.getAreaList();
              }else{
                this.$tip({
                  content:"删除失败",
                })
              }
            })
          },

          editArea(){
            let name = '',
                lng = '',
                lat = '',
                successInfo = '',
                failInfo = '',
                params = {},
                url = '';

            if(this.winType == 'add'){
              if(this.type ==1){
                url = 'https://vlocapitest.thinkskysoft.com/api/v1/warnarea/add';
                name = this.inputName||'警戒区域'+(this.areaList.length+1);
                lat = this.inputPoint.split(",")[0];
                lng = this.inputPoint.split(",")[1];
              }else if(this.type ==2){
                url = 'https://vlocapitest.thinkskysoft.com/api/v1/warnarea/add_city';
                name =this.checkedOption.name;
                lng = this.checkedOption.lng;
                lat = this.checkedOption.lat;
              }
              successInfo = '添加成功';
              failInfo = '添加失败';
              params = {
                "token":this.userToken,
                "name":name,
                "type":this.type,
                "lat":lat,
                "lng":lng,
              };
            }else if(this.winType == 'edit'){
              url = 'https://vlocapitest.thinkskysoft.com/api/v1/warnarea/add';
              name = this.inputName||this.trans.warnArea+(this.areaList.length+1);
              lat = this.inputPoint.split(",")[0];
              lng = this.inputPoint.split(",")[1];
              successInfo = '修改成功';
              failInfo = '修改失败';
              params = {
                "token":this.userToken,
                "md5":this.editItem.md5,
                "name":name,
                "lng":lng,
                "lat":lat,
              };
            }

            this.$http.get(url,{params:params}).then((res)=>{
              if(res.data.status){
                this.$tip({
                  content:successInfo,
                })
                this.getAreaList();
              }else{
                this.$tip({
                  content:res.data.errors,
                })
              }
            })
            this.nameError = false;
            this.pointError = false;
            this.areaWin = false;
          },
        }
    }
</script>

<style scoped lang="less">
  @import '../../assets/less/util';
  .wrap{
    padding:5px 10px 0 10px;
    .chose-city{
      .border-1px(#eee);
      padding-bottom:5px;
    }
    .add-item{
      .border-1px(#eee);
      padding:5px 0;
    }
    .area-item{
      padding:5px 0;
      .border-1px(#eee);
      i{
        margin-left:20px;
      }
    }

    .area-container{
      overflow:scroll;
      -webkit-overflow-scrolling: touch;
    }

    .area-win-input{
      -webkit-appearance: none;
      outline:none;
      padding:10px 0;
      border:1px solid #ccc;
      width:100%;
      margin-bottom:10px;
    }
  }
  .error-info{
    background-color:red;
    color:#fff;
    padding:2px 5px;
    display:inline-block;
    margin-bottom:5px;
    font-size:10px;
  }

  .areaWin-show{
    opacity:1;
  }

  .areaWin-hide{
    opacity:0;
    z-index:-9999;
  }


  .city-wrap{
    left:0;
    position:fixed;
    height:300px;
    background-color:#fff;
    width:100%;
    bottom:0;
    overflow:scroll;
    z-index:2;
    -webkit-overflow-scrolling: touch;
    .city-item{
      padding:5px;
      .border-1px(#eee);
    }
    .active{
      background-color:#4d90fe;
      color:#fff;
    }
  }

  .city-wrap-bg{
    width:100%;
    height:100%;
    position:fixed;
    left:0;
    top:0;
    background-color:rgba(7,17,27,.6);
    z-index:1;
  }
</style>
