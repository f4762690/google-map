<template>
    <div class="wrap">
      <div class="add-item" @click.stop.prevent="showAddWin">{{trans.addBlackName}}<i class="icon-plus right"></i></div>
      <ul class="list-wrap" ref="wrapRef">
        <li v-for="(item,index) in blackList" :key="index" class="list-item">
          {{item.name}}
          <i class="icon-bin right" @click="deleteBlackName(item.name)"></i>
          <i class="icon-pencil right" @click="updateBlackName(item)"></i>
        </li>
      </ul>

      <transition name="el-message-fade">
        <div class="less-message-wrap"  :class="addWin?'addWin-show':'addWin-hide'">
          <div class="less-message-box">
            <div class="less-message-box-title">
              <p>{{winType == 'add'?trans.addBlackName:trans.editBlackName}}</p><i class="icon-close" @click="closeWin"></i>
            </div>
            <div class="less-message-box-content">
              <p v-show="nameError" class="error-info">{{errorInfo}}</p>
              <input type="text" :placeholder="trans.blackInputInfo" v-model="blackName" class="add-win-input" @input="checkName" id="blackNameId">
            </div>
            <div class="less-message-box-btn-group" >
              <button  @click.stop.prevent="confirm" class="btn btn-default">{{trans.yes}}</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
</template>

<script>
    import { mapGetters,mapMutations } from 'vuex';
    import loading from '../loading';
    "use strict";
    export default {
        name: "blackList",
        data(){
          return {
            errorInfo:'',
            blackName:'',
            nameError:false,
            addWin:false,
            winType:'add',
            editItem:'',
          }
        },
        components:{ loading },
        computed:{
          ...mapGetters('avenger',['blackList']),
          ...mapGetters(['trans','userToken'])
        },
        mounted(){
          this.$refs.wrapRef.style.height = this.$parent.wrapHeight - 120 +'px';
        },
        methods:{
          closeWin(){
            this.addWin = false;
            this.nameError = false;
          },
          showAddWin(){
            this.addWin = true;
            this.winType = 'add';
            this.blackName = '';
            document.getElementById("blackNameId").focus();
          },

          checkName(){
            if(this.blackName == ''||this.blackName.length>50){
              this.nameError = true;
              this.errorInfo = this.trans.blackNameError;
            }else{
              this.nameError = false;
            }
          },

          getBlackList(){
            this.$http.get('https://vlocapitest.thinkskysoft.com/api/v1/blacklist/index',{params:{
              token:this.userToken
            }}).then((res)=>{
              if(res.data.status){
                this.setBlackList(res.data.data);
              }
              this.setHasBlackName(!!this.blackList.length);
            }).catch(e=>{
            })
          },

          deleteBlackName(name){
            this.$alert({
              'title':this.trans.prompt,
              'content':`${this.trans.deleteBlackName}?`,
              'btns':[this.trans.yes,this.trans.no]
            },()=>{
              this.$http.get('https://vlocapitest.thinkskysoft.com/api/v1/blacklist/del',{params:{"token":this.userToken,name:name}}).then((res)=>{
                if(res.data.status){
                 this.$tip({
                   content:"删除成功",
                 })
                 this.getBlackList();
                }else{
                  this.$tip({
                    content:"删除失败",
                  })
                }
              })
            });
          },

          updateBlackName(item){
            this.editItem = item;
            this.blackName = item.name;
            this.winType = 'edit';
            this.addWin = true;
          },

          confirm(){
            this.checkName();
            if(this.nameError) return;
            if(this.winType == 'add'){
              if(this.blackList.length >11){
                this.$alert({
                  'title':this.trans.prompt,
                  'content':`${this.trans.blackNameLengthError}!`,
                  'btns':[this.trans.gotit]
                })
                return
              }
            }else if(this.winType == 'edit'){
              //判断是否修改了名称
              if(this.blackName == this.editItem.name){
                this.nameError = true;
                this.errorInfo = this.trans.blackNameNoChange;
                return;
              }
            }
            this.editName();
          },

          editName(){
            let params = {
              token:this.userToken,
              name: this.blackName
            };
            if(this.winType == 'edit')params = Object.assign({},params,{id:this.editItem._id});
            this.$http.get('https://vlocapitest.thinkskysoft.com/api/v1/blacklist/add',{params:params
            }).then((res)=>{
              if(res.data.status == true){
                this.$tip({
                  content:"操作成功",
                });
                this.getBlackList();
              }else{
                this.$tip({
                  content:res.data.errors,
                })
              }
              this.blackName = '';
              this.addWin = false;
            })
          },
          ...mapMutations('avenger',['setHasBlackName','setBlackList'])
        }
    }
</script>

<style scoped lang="less">
  @import '../../assets/less/util';
  .wrap{
    padding:5px 10px 0 10px;
    .add-item{
      .border-1px(#eee);
      padding-bottom:5px;
      .right{
        float:right;
      }
    }

    .list-wrap{
      overflow:scroll;
      -webkit-overflow-scrolling: touch;
      .list-item{
        padding:5px 0;
        .border-1px(#eee);
        .right{
          float:right;
        }
        i{
          padding-left:20px;
        }
      }

      .no-list-container{
        font-size:10px;
      }
    }
  }

  .add-win-input{
    -webkit-appearance: none;
    outline:none;
    padding:10px 0;
    width:100%;
    font-size:14px;
    border:1px solid #ccc;
  }

  .error-info{
    background-color:red;
    color:#fff;
    padding:2px 5px;
    display:inline-block;
    margin-bottom:5px;
    font-size:10px;
  }

  .addWin-show{
    opacity:1;
  }

  .addWin-hide{
    opacity:0;
    z-index:-9999;
  }
</style>
