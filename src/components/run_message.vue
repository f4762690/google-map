<template>

  <touch class="run-message-box"  draggable="false" ref="touch">

    <div class="run-wrap"
     draggable="false"
    ondragstart='return false;'
      @mousedown="touchstart"
      @mouseup="touchend"
      @mousemove="touchmove"
      @mouseleave="touchend">
      <span draggable="false" class="icon-close" @click="$parent.close_run_message"></span>

      <btn style="float:right;margin-right:10px;" :pos="'left'" :action="()=>{this.$emit('save')}" :type="'icon'">
        <em draggable="false" class="icon-download2"></em>
      </btn>

      <btn v-if="uploadGpxUser" style="float:right;margin-right:10px;font-size:1.4em;margin-top:-2px;" :pos="'left'" :action="()=>{this.upload()}" :type="'icon'">
        <em draggable="false" class="icon-cloud-storage"></em>
      </btn>

      <btn v-if="!isFavorite" style="float:right;margin-right:10px;" :pos="'left'" :action="()=>{this.$emit('addFavorite')}" :type="'icon'">
        <em draggable="false" class="icon-star-empty"></em>
      </btn>

      <btn v-if="isFavorite" style="float:right;margin-right:10px;" :pos="'left'" :action="()=>{this.$emit('unFavorite')}" :type="'icon'">
        <em draggable="false" class="icon-star-full"></em>
      </btn>

      <div class="content"  draggable="false" >

        <div draggable="false" class="progress-bar">
          <b draggable="false" :style="'padding-left:'+percentage+'%'">
            <img draggable="false" ondragstart='return false;' v-if="wake && !runPause" src="../image/wake.gif" />
            <img draggable="false" ondragstart='return false;' v-if="wake && runPause" src="../image/stop_walk.png" />

            <img draggable="false" ondragstart='return false;' v-if="run && !runPause" src="../image/run.gif" />
            <img draggable="false" ondragstart='return false;' v-if="run && runPause" src="../image/stop_run.png" />

            <img draggable="false" ondragstart='return false;' v-if="car && !runPause" src="../image/car.gif" />
            <img draggable="false" ondragstart='return false;' v-if="car && runPause" src="../image/stop_vehicle.png" />
          </b>
          <div draggable="false" class="bar"><span :style="'width:'+percentage+'%'"></span></div>
        </div>
      </div>
      <div class="tit-group" style="text-align:center">
        <p class="tit">{{trans.Distances}}: <span>{{__distance}}</span>/<span v-html="__line"></span></p>
        <p class="tit">{{trans.TimeLeft}}: <span>{{f_time}}</span></p>
      </div>
    </div>

    <loop ></loop>
    <div style="text-align:center;padding-bottom:10px;">
      <btn v-show="!runPause" :action="pauseHandler"><span class="icon-pause"></span> {{trans.pause}}</btn>
      <btn v-show="runPause" :action="runHandler"><span class="icon-play"></span> {{trans.run}}</btn>
    </div>
  </touch>

</template>

<script>
import speedBar from './speed.vue';
import loop from './loop.vue';
import btn from './btn.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'run_message',
  props:['time', 'distance', 'progress', 'lineDistance' ],
  components:{ speedBar, loop, btn },
  data(){
    return {
      f_time:0,
      run:false,
      wake:false,
      car:false,
      uped:false
    }
  },
  destroyed:function()
  {
    this.f_time = 0;
    this.$removeQuickKey(['ctrl','s'],this.quickKeyCall)
  },

  computed:{
    __line:function()
    {
      let _n = (this.lineDistance / 1000).toFixed(2)
      if(this.lineDistance > 1000)
      {
        this.$store.commit('setRepeatModel',true)
      }else{
        this.$store.commit('setRepeatModel',false)
      }
      return this.lineDistance > 1000 ? "<span style='color:red'>"+_n+"km</span>" : "<span style='color:green'>"+_n+"km</span>"
    },
    __distance:function()
    {
        return  (this.distance/1000).toFixed(2)+"km";
    },
    percentage:function()
    {
      let p = Math.floor(this.progress/this.time*100);
      return p > 100 ? 100 : p;
    },
    ...mapGetters(['trans','runPause','speed', 'isCustomRun', 'isFavorite', 'uploadGpxUser'])
  },
  methods:{
    upload:function(){
      if(!this.uped){
        this.$emit('upload')
        this.uped = true
      }
    },
    quickKeyCall:function()
    {
      let _status = this.runPause ? false : true
      this.$store.commit('setRunPause',_status)
    },
    touchstart:()=>{},
    touchend:()=>{},
    touchmove:()=>{},
    touchend:()=>{},
    pauseHandler:function()
    {
      this.$store.commit('setRunPause',true)
    },
    runHandler:function()
    {
      this.$store.commit('setRunPause',false)
    },
    converTime:function()
    {
      let _t = Math.floor((this.time*1000*(this.speed/1000)-this.progress*this.speed)/1000);
      // console.log('time:%s val:%s',this.time,val);
      let _h = Math.floor(_t/(60*60));
      let _i = Math.floor((_t-(_h*60*60))/60);
      let _s = Math.floor((_t-(_h*60*60)-(_i*60)));
      this.f_time = (_h >= 10 ? _h : '0'+_h) + ":" + (_i >= 10 ? _i : '0'+_i) + ":" + (_s >= 10 ? _s : '0'+_s);
    }
  },
  mounted:function(){
    this.wake = this.speed > 600 ? true : false;
    this.run = this.speed > 300 && this.speed <= 600 ? true : false;
    this.car = this.speed < 300 ? true : false;
    this.touchstart = this.$refs.touch.touchstart
    this.touchend = this.$refs.touch.touchend
    this.touchmove = this.$refs.touch.touchmove
    this.touchend = this.$refs.touch.touchend
    this.converTime()
    this.$addQuickKey(['ctrl','s'],this.quickKeyCall)

  },

  watch:{
    speed:function(val){
      if(val >= 600)
      {
        this.run = false;
        this.wake = true;
      }
      if(val > 300 && val <= 600)
      {
        this.wake = false;
        this.car = false;
        this.run = true;
      }
      if(val < 300 )
      {
        this.run = false;
        this.wake = false;
        this.car = true;
      }
    },
    progress:function(val)
    {
      this.converTime()
    }
  }
}
</script>

<style scoped>
.icon-close,
.icon-download2 {
  float:right;
  cursor: pointer;
}
.icon-close:hover,
.icon-download2:hover {
  color:#3a97ef;
}

.tit-group {
  padding-top:5px;
  /*display: flex;*/
}

.run-wrap {
  padding:10px;
  padding-bottom: 0;
}

.run-btn-group {
  display: flex;
  margin:0 -20px;
  margin-top:10px;
  border-top: 1px solid #ccc;
  padding:0 20px;
}

.btn-control {
  text-decoration: none;
  display: block;
  text-align: center;
  font-size: 14px;
  color:#666;
  background: #3a97ef;
  color:#fff;
  line-height: 35px;
}
.run-btn-group span {
  font-size: 20px;
  vertical-align:middle;
}

.run-message-box {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    border:1px solid #ccc;
    background:#fff;
    /* display: inline-block; */
    /* width:auto; */
    width:346px;
    height:auto;
    box-sizing: border-box;
}

.content {
    cursor: move;
    -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
.tit span {
    color:#3a97e5;
}
.tit {
  font-size: 12px;
}

.content .time {
  font-size: 14px;
  margin-bottom: 5px;
}
.content .close {
  position: absolute;
  right:10px;
  top:0px;
  color:#999;
  font-size: 24px;
  cursor: pointer;
}
.content .close:hover {
  color:#3a97e5;
}
.progress-bar {
  margin-top:20px;
}
.bar {
  background: #eee;
  position: relative;
  width: 100%;
  white-space: nowrap;
  font-size: 0;
  height: 4px;
  line-height: 0;
  overflow:hidden;
}
.bar span {
  display: block;
  height: 4px;
  background: #4385f5;
  overflow: hidden;
}
.progress-bar b {
  height:25px;
  display: block;
  overflow: hidden;
  font-size: 0;
  line-height: 0;
  box-sizing: border-box;
}
.progress-bar b img {
  margin-left: -48px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
.content {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
.cycle:before {
  content:' ';
  border:1px solid #666;
  background:#fff;
  display: inline-block;
  width:14px;
  height:14px;
  vertical-align: middle;
  border-radius: 50%;
}
.checked {color:#4385f8 !important;}
.checked:before {background: #4385f8; border-color:#4385f8;}

@media screen and (max-width: 320px){
  .run-message-box {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    border:1px solid #ccc;
    background:#fff;
    /* display: inline-block; */
    /* width:auto; */
    width:280px;
    height:auto;
    box-sizing: border-box;
  }
}
</style>
