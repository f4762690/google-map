<template>
    <div>
        <div class="loop-wrap" @wheel="wheelHandler">
            <div v-if="cycleModel<=0" class="icon-radio-unchecked"  @click="setLoop(1)">{{trans.cycle}}</div>
            <div v-if="cycleModel>0" class="icon-radio-checked" @click="setLoop(0)">{{trans.cycle}}</div>

            <!--<div class="loop-bar" ref='bar'>-->
                <!--<div class="bar" :style="'width:'+width+'%'"></div>-->
                <!--<b draggable="false" @touchstart="startDrag=true"  class="control" :style="'left:'+left+'px'"></b>-->
            <!--</div>-->

            <div>
                <span v-if="cycleModel >= 999" :class="cycleModel<=0 ? 'icon-infinite' : 'icon-infinite infinite-active'"></span>
                <input class="input-cur"  v-if="cycleModel < 999" :value="cycleModel" type="text" readonly="readonly" unselectable="on" onfocus="this.blur()"/>
            </div>


            <div style="width:35px">
                <btn
                v-if="repeatModel"
                :pos="'top'"
                :type="'icon'"
                :action="changeRepeatMode"
                >
                <em draggable="false" class="icon-wx"></em>
                </btn>

                <btn
                v-if="!repeatModel"
                :pos="'top'"
                :type="'icon'"
                :action="changeRepeatMode"
                >
                <em draggable="false" class="icon-dx"></em>
                </btn>
            </div>

        </div>
        <div class="plr-20">
          <v-touch id="deleteId" class="button-style" @tap="deleteCycleModel" @press="pressDelete"  @pressup="clearDeleteTimeout" @blur="clearDeleteTimeout">-</v-touch>
          <v-touch id="addId" class="button-style" @tap="addCycleModel" @press="pressAdd"  @pressup="clearaddTimeout" @blur="clearaddTimeout">+</v-touch>
          <!--<mt-range v-model="loopData" :min="0" :max="999">-->
            <!--<div slot="start">0</div>-->
            <!--<div slot="end">999</div>-->
          <!--</mt-range>-->
        </div>
        <!--<p class="des">{{trans.loopMessage}}</p>-->
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import btn from './btn.vue'
import MtRange from "./range/src/index";
export default {
    name: 'loop',
    components:{
      MtRange,
      btn },
    data(){
        return {
            // loopData:0,
            selected:false,
            startDrag:false,
            clientW:0,
            total:999
        }
    },
    // watch:{
    //   loopData(newVal){
    //     this.$store.commit('setCycleModel',newVal);
    //   },
    //
    // },
    computed:{
        left:function()
        {
            return Math.floor(this.cycleModel/this.total*this.clientW)
        },
        width:function()
        {
            return Math.round(this.cycleModel/this.total*100)
        },
        ...mapGetters(['trans','cycleModel', 'repeatModel'])
    },
    mounted:function()
    {
        let deleteElement = document.getElementById("deleteId"),
          addElement = document.getElementById("addId"),
          vm = this;
        deleteElement.addEventListener("touchend",()=>{
          console.log("---");
          vm.clearDeleteTimeout();
        })
        addElement.addEventListener("touchend",()=>{
          console.log("+++");
          vm.clearaddTimeout();
        })
        // this.clientW = this.$refs.bar.offsetWidth;
        // window.document.addEventListener('touchmove',(ev)=>{
        //     if(this.startDrag)
        //     {
        //         ev.preventDefault();
        //         this.move(ev);
        //     }
        // });
        // window.document.addEventListener('touchend',()=>{
        //     this.startDrag = false;
        // });

        this.$addQuickKey(['ctrl','n7'],()=>{
            let _cycleModel = this.cycleModel < 999 ? this.cycleModel + 1 : 999
            this.$store.commit('setCycleModel',_cycleModel)
        })

        this.$addQuickKey(['ctrl','n8'],()=>{
            let _cycleModel = this.cycleModel > 0 ? this.cycleModel - 1 : 0
            this.$store.commit('setCycleModel',_cycleModel)
        })

        this.$addQuickKey(['ctrl','n9'],()=>{
            let _cycleModel = this.cycleModel != 999 ? 999 : 0
            this.$store.commit('setCycleModel',_cycleModel)
        })

        this.$addQuickKey(['ctrl','f'],()=>{
            let _b = this.repeatModel ? false : true
            this.$store.commit('setRepeatModel',_b)
        })
    },
    methods:{
        pressDelete(){
          this.deleteAction = ()=>{
            this.$store.commit('setCycleModel',this.cycleModel > 0 ? this.cycleModel - 1 : 0);
            this.deleteTimeoutId = setTimeout(()=>{
              this.deleteAction();
            },this.frequency)
          }
          this.deleteAction();
        },
        pressAdd(){
          this.addAction = ()=>{
            this.$store.commit('setCycleModel',this.cycleModel < this.total ? this.cycleModel + 1 : this.total);
            this.addTimeoutId = setTimeout(()=>{
              console.log("长按调用");
              this.addAction();
            },this.frequency)
          }
          this.addAction();
        },
        clearDeleteTimeout(){
          clearTimeout(this.deleteTimeoutId)
        },
        clearaddTimeout(){
          clearTimeout(this.addTimeoutId)
        },
        deleteCycleModel(){
          this.$store.commit('setCycleModel',this.cycleModel > 0 ? this.cycleModel - 1 : 0);
        },
        addCycleModel(){
          this.$store.commit('setCycleModel',this.cycleModel < this.total ? this.cycleModel + 1 : this.total);
        },
        changeRepeatMode:function()
        {
            let _b = this.repeatModel ? false : true
            this.$store.commit('setRepeatModel',_b)
        },
        setLoop:function(n)
        {
            this.$store.commit('setCycleModel',n)
        },
        move:function(ev)
        {
            let __left = ev.pageX - this.$refs.bar.offsetLeft - this.$refs.bar.offsetParent.offsetLeft;
            let _n = 0;
            if(__left > this.clientW)
            {
                _n = this.total
            }else{
                if(__left>0){
                    _n = Math.round(__left/this.clientW*this.total)
                }
            }
            this.$store.commit('setCycleModel',_n);
        },
        wheelHandler:function(ev)
        {
            if(ev.wheelDeltaY < 0)
            {
                this.$store.commit('setCycleModel',this.cycleModel > 0 ? this.cycleModel - 1 : 0);
            }else{
                this.$store.commit('setCycleModel',this.cycleModel < this.total ? this.cycleModel + 1 : this.total);
            }
        }
    }
}
</script>

<style scoped>
.plr-20{
  padding:10px 0;
  text-align:center;
}
.loop-wrap {
    padding:5px 5px 0;
    margin:0 10px;
    background: #fff;
    /*border:1px solid #ccc;*/
    display: flex;
    justify-content: center;
}
.des {font-size: 12px; text-align: center; margin-bottom: 10px; color: #999}
.loop-bar {margin:auto; position: relative;}
.loop-bar,
.loop-bar .bar { flex:1; height: 5px; background:#ccc; }
.loop-bar .bar { background: #1f6eff; }
.loop-bar .control {position: absolute; bottom:-2px; }
.loop-bar b {height: 10px; width: 10px; border-radius: 50%; overflow:hidden; display: inline-block; background: #1f6eff;}
.input-cur {margin:0 10px; border:1px solid #ccc; width: 2.5em; text-align: center; font-size: 12px; height: 2em; line-height: 2em;}
.icon-radio-unchecked,
.icon-radio-checked { line-height: 2em; font-weight: bolder; font-size: 14px; color:#999; padding-right: 15px; white-space: nowrap;}
.icon-radio-checked,
.infinite-active {color:#1f6eff;}
.icon-infinite { margin:0px 10px; display:block; font-size: 28px;}
.icon-wx,
.icon-dx {font-size: 22px; line-height: 26px; height: 26px;}
.button-style{
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #eee;
  padding: 10px;
  -webkit-box-shadow: 1px 1px 1px #eee;
  box-shadow: 1px 1px 1px #eee;
  width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 24px;
  display: inline-block;
  margin:0 10px;
}
</style>
