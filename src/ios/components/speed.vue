<template>
    <div draggable="false" class="speed-wrap" @wheel="wheelHandler">
        <!--<div draggable="false" class="speed-bar" ref='bar'>-->
            <!--<div draggable="false" ondragstart='return false;' class="bar" :style="'width:'+Math.round(speed/maxSpeed*100)+'%'"></div>-->
            <!--<img draggable="false" ondragstart='return false;' @mousedown="startDrag=true"  class="control" :style="'left:'+Math.round((speed/maxSpeed)*193+3)+'px'" src="../image/icon(1).png" />-->
        <!--</div>-->

        <!--<mt-range v-model="loopData" :min="minRange" :max="maxRange">-->
        <!--</mt-range>-->
        <p draggable="false" class="speed-content">{{trans.speed}}: <span>{{(speed*2/100).toFixed(2)}}m/s {{speed_km}}km/h</span></p>
        <div class="plr-20">
      <v-touch id="deleteSpeedId" class="button-style" @tap="deleteCycleModel" @press="pressDelete"  @pressup="clearDeleteTimeout" @blur="clearDeleteTimeout">-</v-touch>
      <v-touch id="addSpeedId" class="button-style" @tap="addCycleModel" @press="pressAdd"  @pressup="clearaddTimeout" @blur="clearaddTimeout">+</v-touch>
      <!--<mt-range v-model="loopData" :min="0" :max="999">-->
      <!--<div slot="start">0</div>-->
      <!--<div slot="end">999</div>-->
      <!--</mt-range>-->
    </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'speed',
    data(){
        return {
            minRange:1,
            maxRange:100,
            startDrag:false,
            frequency:100,
        }
    },
    computed:{
        cur:function()
        {
            return Math.round(((1000-this.speed)/9))
        },
        speed_m:function()
        {
            return (1000/this.speed*1.4).toFixed(2)
        },
        speed_km:function()
        {
          return (this.speed/100*2*3.6).toFixed(2)
        },
        ...mapGetters(['trans','cycleModel','speed','maxSpeed','rangeData'])
    },
    mounted:function()
    {
      let deleteElement = document.getElementById("deleteSpeedId"),
        addElement = document.getElementById("addSpeedId"),
        vm = this;
      deleteElement.addEventListener("touchend",()=>{
        vm.clearDeleteTimeout();
      })
      addElement.addEventListener("touchend",()=>{
        vm.clearaddTimeout();
      })
    },
    methods:{
        pressDelete(){
          this.deleteAction = ()=>{
            this.deleteCycleModel();
            this.deleteTimeoutId = setTimeout(()=>{
              this.deleteAction();
            },this.frequency)
          }
          this.deleteAction();
        },
        pressAdd(){
          this.addAction = ()=>{
            this.addCycleModel();
            this.addTimeoutId = setTimeout(()=>{
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
          this.$store.commit('setRangeData',this.rangeData>this.minRange?this.rangeData-1:this.minRange);
          this.$store.commit('setSpeed',this.maxSpeed*(this.rangeData/this.maxRange));
          this.syncSpeed();
          console.log("设置后的速度值:"+this.speed);
        },
        addCycleModel(){
          this.$store.commit('setRangeData',this.rangeData<this.maxRange?this.rangeData+1:this.maxRange);
          this.$store.commit('setSpeed',this.maxSpeed*(this.rangeData/this.maxRange));
          this.syncSpeed();
          console.log("设置后的速度值:"+this.speed);
        },
        move:function(ev)
        {
            let __left = ev.pageX - this.$refs.bar.offsetLeft - this.$refs.bar.offsetParent.offsetLeft;
            let __ls = 0;
            if(__left > 210)
            {
                __ls = 1;
            }else{
                if(__left>0){
                    __ls = __left/210;
                }
            }
            if(__left<0)
            {
                __ls = 0;
            }
            let _p = Math.round(this.maxSpeed*__ls);




            this.$store.commit('setSpeed',_p);

        },
        wheelHandler:function(ev)
        {
            if(ev.deltaY > 0)
            {
              this.$store.commit('setSpeed',this.speed < this.maxSpeed ? this.speed + 1 : this.maxSpeed);
            }else{
              this.$store.commit('setSpeed',this.speed > 0 ? this.speed - 1 : 0);
            }
            this.syncSpeed()
        },

        //保存已经设置的速度值
        syncSpeed:function()
        {
            switch(this.$parent.simulationType){
                case 0:
                    if(!this.startDrag)
                    {
                        this.$store.commit('setRockerSpeed')
                    }
                break;

                case 1:
                    if(!this.startDrag)
                    {
                        this.$store.commit('setWakeSpeed')
                    }
                break;

                case 2:
                    if(!this.startDrag)
                    {
                        this.$store.commit('setMorePointSpeed')
                    }
                break;
            }
        },
    }
}
</script>

<style scoped>
.speed-wrap {
    padding:10px 10px 0 10px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
    text-align:center;
    z-index:300;
}
.speed-content {font-size: 12px; line-height: 200%; text-align: center;}
.speed-content span { color:#1f6eff; }
.speed-bar {margin:auto; position: relative;}
.speed-bar,
.bar { width:210px; height: 35px; background:url(../image/speed_default.png); }
.bar { background: url(../image/speed.png); }
.control {position: absolute; bottom:2px;}
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
