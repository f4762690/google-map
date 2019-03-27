<template>
    <div class="history" v-show="isshow">
        <transition name="history">
        <div class="history-wrap-left" v-if="leftshow">
            <ul id="fileNameId">
                <li :key="index" v-for="(item,index) in history">
                    <span @click="cur_his = item;cur_key=index; leftshow=false" class="his-type">{{index}}</span>
                    <span @click="deleteTarget(index)" class="icon-bin"></span>
                </li>
                <li :class="{'hideInput':!showAddFile}">
                  <input id="fileInputId" type="text" autofocus="autofocus" v-model="fileName"><mt-button class="text-center" size="small" @click="confirm">{{trans.confirmed}}</mt-button>
                </li>
            </ul>
            <div class="add-button-wrap">
              <mt-button class="icon-plus text-center add-btn" @click="showAddInput"></mt-button>
            </div>
        </div>
        </transition>

        <div class="history-wrap-right">
            <div class="history-header">
                <span class="icon-menu3" @click="leftshow = leftshow ? false : true ">{{cur_key}}</span>
                <span @click="charDesc" v-if="c_asc" class="icon-sort-alpha-asc"></span>
                <span @click="charAsc" v-if="c_desc" class="icon-sort-alpha-desc"></span>
                <span @click="timeDesc" v-if="t_asc" class="icon-tasc"></span>
                <span @click="timeAsc" v-if="t_desc" class="icon-tdesc"></span>
            </div>

            <ul class="history-list">
                <li :key="index" v-for="(item,index) in cur_his" class="icon-location">
                    <p @click="toHistory(item)">{{item.title}}</p>
                    <span @click="$emit('editHistory',{index:index,target:cur_key})" class="icon-pencil"></span>
                    <span @click="deleteItem({index:index,target:cur_key})" class="icon-bin"></span>
                </li>
                <li v-if="cur_his.length <= 0"><p>&nbsp;&nbsp;&nbsp;&nbsp;{{trans.emptyHistoryMessage}}</p></li>
            </ul>

            <div class="history-footer">
                <button class="btn btn-default" @click="choseImport">{{trans.import}}</button>
                <button class="btn btn-white" @click="exportHistory">{{trans.export}}</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'history',
    data(){
        return {
            fileName:'',
            showAddFile:false,
            showImport:false,
            isshow: false,
            leftshow:false,
            cur_his:[],
            cur_key:'',
            c_asc:true,
            c_desc:false,
            t_asc:true,
            t_desc:false
        }
    },
    computed:{
        ...mapGetters(['history', 'trans'])
    },
    mounted(){
      window.importJson = (data) =>{
        this.$parent.history_show();
        this.leftshow = true;
        let res = JSON.parse(data);
        let _json = JSON.parse(res.content.replace(/\'/g, "\""));
        this.$store.commit('mergeHistory',_json);
        this.updated()
      }
    },
    methods:{
        choseImport(){
          this.$alert({
            'title':this.trans.importToList,
            'content':this.trans.choseImport,
            'btns':[this.trans.jsonFile,this.trans.textType]
          },()=>{
            this.importHistory();
          },()=>{
            this.$alert.close;
            this.$parent.$refs.textRef.show();
          })
        },
        confirm(){        //添加文件夹
          let __obj = {}
          __obj[this.fileName] = []
          this.$store.commit('mergeHistory',__obj)
          this.fileName = '';
          this.showAddFile = false;
        },
        showAddInput(){
          this.showAddFile = true;
          setTimeout(()=>{
            let fileEle = document.getElementById("fileNameId");
            fileEle.scrollTop = fileEle.scrollHeight;           //最底部未显示，需要等待一段时间。滚动到最底部
          },300)
          document.getElementById("fileInputId").focus();
        },
        deleteItem:function(obj)
        {
            this.$alert({
                'title':'',
                'content':this.trans.historyDelMessage,
                'btns':[this.trans.yes,this.trans.no]
            },()=>{
                this.$store.commit('delHistory',obj)
            })
        },
        deleteTarget:function(target)
        {
            this.$alert({
                'title':'',
                'content':this.trans.historyDelMessage,
                'btns':[this.trans.yes,this.trans.no]
            },()=>{
                this.$store.commit('delHistory',{index:false,target:target})
            })
            this.hide()
            this.cur_key = ""
            this.cur_his = []
        },
        updated:function()
        {
            //初始选择一个分类
            if(this.cur_key == "")
            {
                for(let i in this.history)
                {
                    this.cur_key = i
                    this.cur_his = this.history[i]
                    break;
                }
            }else{
                this.cur_his = this.history[this.cur_key]
            }
        },
        show:function(){
            this.isshow = true
            this.updated()
        },
        hide:function(){
            this.isshow = false
            this.leftshow = false
        },
        toHistory:function(obj)
        {
            this.$parent.go_to_point(obj)
            this.hide()
        },
        charDesc:function(){
            this.cur_his.sort((a,b)=>{
                return String(a.title) > String(b.title) ? 1 : -1
            })
            this.c_desc = true
            this.c_asc = false
        },
        charAsc:function(){
            this.cur_his.sort((a,b)=>{
                return String(a.title) < String(b.title) ? 1 : -1
            })
            this.c_asc = true
            this.c_desc = false
        },
        timeDesc:function(){
            this.cur_his.sort((a,b)=>{
                return a.time > b.time ? 1 : -1
            })
            this.t_desc = true
            this.t_asc = false
        },
        timeAsc:function(){
            this.cur_his.sort((a,b)=>{
                return a.time < b.time ? 1 : -1
            })
            this.t_asc = true
            this.t_desc = false
        },
        //导入文件
        importHistory:function(){
          this.showImport = false;
          this.$importFile('json',(res)=>{
              try{
                  console.log("res.content:"+res.content);
                  let _json = JSON.parse(res.content.replace(/\'/g, "\""));
                  this.$store.commit('mergeHistory',_json);
                  this.updated()
              }catch(error){
              }
          },()=>{
              console.log("error");
          })
        },
        saveText(jsonObj){
          this.$store.commit('mergeHistory',jsonObj);
          this.updated()
        },
        //导出文件
        exportHistory:function(){
            let _jsonStr = JSON.stringify(this.history)
            let date = new Date()
            let month = date.getMonth()+1 > 9 ? date.getMonth()+1 : '0'+(date.getMonth()+1)
            let _file_name = "FavoriteLists_iTools_"+date.getFullYear()+month+date.getDate()+date.getHours()+date.getMinutes()+date.getSeconds()+'.json'
            this.$exportFile(_jsonStr,_file_name)
        },
    }
}
</script>
<style lang="less" scoped>
  .add-button-wrap{
    text-align:center;
    .add-btn{
      width:60px;
      height:30px;
    }
  }
  .mint-button--default{
    background-color:#4d90fe;
    color:#fff;
  }
  .icon-plus{
    font-size:14px;
    font-weight:700;
  }
  .focus-btn{
    display:none;
    visibility: hidden;
    height:20px;
    width:20px;
    z-index:0;
  }
  #fileInputId{
    -webkit-user-select: auto
  }
  .hideInput{
    top:-1000px;
    position:absolute;
  }
</style>
