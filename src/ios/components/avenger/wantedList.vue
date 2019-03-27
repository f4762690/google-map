<template>
  <div class="wrap" ref="wantedRef">
    <div>
      <ul class="list-wrap">
        <listItem v-for="(item,index) in wantedList"  :item=item :key=index @goPoint="go(item)"></listItem>
      </ul>
    </div>
    <div v-show="!wantedList.length" class="text-center no-data">
      {{getNoData}}
    </div>
    <loading ref='loadingRef' :visible="isLoading"></loading>
  </div>
</template>

<script>
    import listItem from './wantedListItem'
    import BScroll from 'better-scroll'
    import { mapGetters } from 'vuex';
    import { throttle } from '../../lib/util';
    import loading from '../loading';
    "use strict";
    export default {
        name: "wantedList",
        data(){
          return{
            wantedList:[],
            page:1,
            callInterval:null,
            md5:'',
            isLoading:true,
            firstTime:true
          }
        },

        components:{
          listItem,loading
        },

        created(){
          this.getWantedList();
          this.callInterval = setInterval(()=>{
            this.getWantedList("new");
          },60000)
        },

        computed:{
          getNoData(){
            return this.hasBlackName?this.wantedList.length?'':this.trans.noWantedListInfo:this.trans.noBlackListInfo;
          },
          ...mapGetters('avenger',['hasBlackName']),
          ...mapGetters(['trans','userToken'])
        },

        methods:{
          getScroll(){  //滚动多次触发的问题，记录一下.
            this.$nextTick(()=>{
              if(!this.bScroll){
                this.bScroll = new BScroll(this.$refs.wantedRef,{
                  click:true,
                  probeType:3,
                  scrollbar: true,
                  mouseWheel:true,
                  pullUpLoad:{
                    threshold:-30,
                  }
                })
              }else{
                this.bScroll.refresh();
              }
              let vm = this;
              vm.bScroll.on('pullingUp',vm.getData);
            })
          },

          getData:throttle(function(){
            this.page++;
            this.getWantedList("more");
            this.bScroll.finishPullUp();
          },5000,5000),


           async getWantedList(type = 'new'){
            let page = type == 'new'?1:this.page;
            await this.$http.get('//vlocapitest.thinkskysoft.com/api/v1/blacklist/wantedman',{params:{
                token:this.userToken,
                page:page,
                limit:50,
              }}).then((res)=>{
              if(res.data.status == true&&this.md5 != res.data.md5){
                if(!this.firstTime) this.$store.commit('avenger/avengerNews',true);
                this.firstTime = false;
                res.data.data.map((item)=>{
                  item['ifClick'] = false;
                  item['test'] = item['updated_at'];
                  item['lastTime'] = parseInt( Date.now()/1000 - item['last_modified']);
                });

                let result = {
                  'new':[...res.data.data,...this.wantedList],
                  'more':[...this.wantedList,...res.data.data],
                };

                let noRepeat = new Map();
                result[type].forEach((item)=>{
                  noRepeat.set(item._id,item);
                })
                this.wantedList = [...noRepeat.values()];
              }
              this.isLoading = false;
            }).catch(e=>{
              this.isLoading = false;
            });

            this.getScroll();
          },

          go(item){
            item['ifClick'] = true;
            this.$parent.jumpPoint(item);
            console.log(this.wantedList);
          }
        },

        mounted(){
          this.$nextTick(()=>{
            this.$refs.wantedRef.style.height = this.$parent.wrapHeight - 100 +"px";
          })
      },
    }
</script>

<style scoped lang="less">
  @import "../../assets/less/util";
  .wrap{
    padding:5px 10px 0 10px;
    height:100%;
    overflow:hidden;
    position:relative;
    .no-data{
      font-size: 10px;
      position: absolute;
      width: 150px;
      height: 200px;
      top: 50%;
      left: 50%;
      margin-top: -150px;
      margin-left: -75px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
