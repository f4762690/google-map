<!--图标，100iv、巢穴、团战、田野-->
<template>
  <div class="pokemongo-marker" @touchstart.stop @touchend.stop @movestart.stop>

    <!--100iv-->
    <div @touchstart.stop.prevent="showPop" class="petiv marker" v-if="genre == 'iv100'"  @click.stop @touchend.stop @movestart.stop>
      <img :src="'//assets.thinkskysoft.com/vlocapi/official_spirit/'+parseInt(pet_id)+'-00.png'" class="icon" />
    </div>

    <!--巢穴-->
    <div @touchstart.stop.prevent="showPop"  @touchstart.stop @click.stop @movestart.stop class="nests marker" v-if="genre == 'nest'">
      <img class="icon" :src="'//assets.thinkskysoft.com/vlocapi/official_spirit/'+parseInt(pet_id)+'-00.png'" />
      <img class="pokemon-tip" src="../image/cave1.png" />
    </div>

    <div @touchstart.stop.prevent @click.stop @touchend.stop @movestart.stop class="pop" :style="{height:(genre == 'gyminfo'?'160px':'140px'),top:(genre == 'gyminfo'?'-170px':'-150px')}" v-show="popshow&&(genre == 'gym' ? showTime : true)" style="z-index:100">
      <!--100iv-->
      <div  v-if="genre == 'iv100'">
        <div class="title text-center"><b>{{trans.pokesniper}}</b><span @touchstart.stop.prevent="popshow=false"  @click.stop @touchend.stop @movestart.stop class="icon icon-close"></span></div>
        <div class="info">
          <!--Boss图标-->
          <img class="icon" :src="'//assets.thinkskysoft.com/vlocapi/official_spirit/'+parseInt(pet_id)+'-00.png'" />
          <div>
            <p>{{ petiv_list[parseInt(pet_id)] ? petiv_list[parseInt(pet_id)].title : '?' }}</p>
            <p>{{trans.lastUpdated}}:<span>{{confirmed}} {{trans.minute}}</span></p>
            <p>{{trans.coord}}:<span>{{gps_str}}</span></p>
            <p>{{trans.Distances2}}:<span>{{distances_str}}</span></p>
            <p>{{trans.cooldown}}:<span>{{cool_time}} {{trans.minute}}</span></p>
          </div>
        </div>
      </div>

      <!--巢穴-->
      <div  v-if="genre == 'nest'">
        <div class="title text-center"><b>{{trans.nests}}</b><span @touchstart.stop.prevent="popshow=false"  @click.stop @touchend.stop @movestart.stop class="icon icon-close"></span></div>
        <div class="info">
          <img class="icon" :src="'//assets.thinkskysoft.com/vlocapi/official_spirit/'+parseInt(pet_id)+'-00.png'" />
          <div>
            <p>{{ petiv_list[parseInt(pet_id)] ? petiv_list[parseInt(pet_id)].title : '?' }}</p>
            <p>{{trans.yield}}:<span>{{count_str}}</span></p>
            <p>{{trans.coord}}:<span>{{gps_str}}</span></p>
            <p>{{trans.Distances2}}:<span>{{distances_str}}</span></p>
            <p>{{trans.cooldown}}:<span>{{cool_time}} {{trans.minute}}</span></p>
          </div>
        </div>
      </div>

      <!--团战-->
      <div v-if="genre == 'gym' && showTime">
        <div class="title text-center"><b>{{trans.raidText}}</b><span @touchstart.stop.prevent="popshow=false"  @click.stop @touchend.stop @movestart.stop class="icon icon-close"></span></div>
        <div class="info">
          <img class="icon" :src="raid_img" />
          <div>
            <p>{{ pokemongos_list[pet_id] ? pokemongos_list[pet_id].title : `Raid(${num1})` }}</p>
            <p>{{ fh ? 'end' : 'hatch' }}:<span>{{duration_str}}</span></p>
            <p>{{trans.coord}}:<span>{{gps_str}}</span></p>
            <p>{{trans.Distances2}}:<span>{{distances_str}}</span></p>
            <p>{{trans.cooldown}}:<span>{{cool_time}} {{trans.minute}}</span></p>
          </div>
        </div>
      </div>

      <!--田野-->
      <div  v-if="genre == 'pokestop'">
        <div class="title text-center"><b>{{trans.filedResrearch}}</b><span @touchstart.stop.prevent="popshow=false"   @click.stop @touchend.stop @movestart.stop class="icon icon-close"></span></div>
        <div class="info">
          <img class="icon" :src="'//assets.thinkskysoft.com/vlocapi/pokemon_list_img/'+pet_id+'.png'" />
          <div>
            <p>{{ pokemongos_list[pet_id] ? pokemongos_list[pet_id].title : '?' }}</p>
            <p>{{trans.lastUpdated}}:<span>{{updated_at}}</span></p>
            <p>{{trans.coord}}:<span>{{gps_str}}</span></p>
            <p>{{trans.Distances2}}:<span>{{distances_str}}</span></p>
            <p>{{trans.cooldown}}:<span>{{cool_time}} {{trans.minute}}</span></p>
          </div>
        </div>
      </div>

      <!--野怪-->
      <div  v-if="genre == 'wild'">
        <div class="title text-center"><b>{{trans.pokesniper}}</b><span @touchstart.stop.prevent="popshow=false" @click.stop @touchend.stop @movestart.stop class="icon icon-close"></span></div>
        <div class="info">
          <!--Boss图标-->
          <img class="icon" :src="'//assets.thinkskysoft.com/vlocapi/official_spirit/'+parseInt(pokemon_id)+'-00.png'" />
          <div>
            <p>{{ petiv_list[parseInt(pokemon_id)] ? petiv_list[parseInt(pokemon_id)].title : '?' }}</p>
            <p>{{trans.lastUpdated}}:<span> {{updated_at}}{{trans.minute}}</span></p>
            <p>{{trans.coord}}:<span>{{gps_str}}</span></p>
            <p>{{trans.Distances2}}:<span>{{distances_str}}</span></p>
            <p>{{trans.cooldown}}:<span>{{cool_time}} {{trans.minute}}</span></p>
          </div>
        </div>
      </div>

      <!--道场-->
      <div  v-if="genre == 'gyminfo'">
        <div class="title text-center"><b>{{trans.gyms}}</b><span @touchstart.stop.prevent="popshow=false" @click.stop @touchend.stop @movestart.stop class="icon icon-close"></span></div>
        <div class="info">
          <!--Boss图标-->
          <img class="icon" :src="iconImg" />
          <div>
            <p>{{trans.own}}:<span>{{getTeam}}</span></p>
            <ul class="pets-info-wrap">
              <li v-for="(item,index) in getDetails" :key="index" class="pets-info-item-wrap">
                <img :src="item.imgIcon" class="pets-img-wrap"/><br>
                <div class="detail-progress-wrap">
                  <div class="detail-progress-percent" :style="{width:currentPercent(item.pokemon_cp,item.max_cp)}">
                  </div>
                  {{currentPercent(item.pokemon_cp,item.max_cp)}}
                </div>
              </li>
            </ul>
            <p>{{trans.Distances2}}:<span>{{distances_str}}</span></p>
            <p>{{trans.cooldown}}:<span>{{cool_time}} {{trans.minute}}</span></p>
          </div>
        </div>
      </div>

      <div class="poke-btn-group">
        <a href="javascript:void(0)" class="btn btn-default btn-xs" @touchstart.stop.prevent = "gotop"  @click.stop @touchend.stop @movestart.stop>{{trans.moveHere}}</a>
        <a href="javascript:void(0)" class="btn btn-white btn-xs" @touchstart.stop.prevent = "copy"  @click.stop @touchend.stop @movestart.stop>{{trans.copyed}}</a>
      </div>
    </div>

    <!--团战-->
    <div style="z-index:10" @touchstart.stop.prevent="showPop" class="raid marker" v-if="genre == 'gym' && showTime"  @click.stop @touchend.stop @movestart.stop>
      <div v-if="showTime" :class="['time',{'time-fh':!fh, 'time-end':fh}]">{{duration_str}}</div>
      <!--Boss图标-->
      <img class="icon" :src="raid_img" />

      <!--vip-->
      <img class="pokemon-tip" v-if="is_vip==1" src="../image/vip.png" />

      <!--ex-->
      <img class="pokemon-tip" v-if="is_vip==2" src="../image/ex.png" />
    </div>

    <!--田野-->
    <div @touchstart.stop.prevent="showPop" class="field marker" v-if="genre == 'pokestop'"  @click.stop @touchend.stop @movestart.stop>
      <img class="icon" :src="'//assets.thinkskysoft.com/vlocapi/pokemon_list_img/'+pet_id+'.png'" />
      <img class="pokemon-tip" src="../image/telescope1.png" />
    </div>

    <!--野怪-->
    <div @touchstart.stop="showPop" class="field marker" v-if="genre == 'wild'" @click.stop @touchend.stop @movestart.stop>
      <img class="icon" :src="'//assets.thinkskysoft.com/vlocapi/pokemon_list_img/'+pokemon_id+'.png'" />
      <img class="pokemon-tip" :src="'./static/images/grass.png'" />
    </div>

    <!--补给站-->
    <div class="field marker" v-if="genre == 'chatico'" @click.stop @touchend.stop @movestart.stop>
      <img class="icon" :src="iconImg" />
    </div>

    <!--道场-->
    <div @touchstart.stop="showPop" class="field marker" v-if="genre == 'gyminfo'" @click.stop @touchend.stop @movestart.stop>
      <img class="icon" :src="iconImg" />
    </div>

  </div>
</template>


<script>
  import { mapState, mapMutations, mapGetters } from 'vuex'
  import getCoolTime from '../lib/CoolingTime'
  import { getDisance } from '../lib/ConverPoint'
  export default {
    name: 'pokemongo-marker',
    data(){
      return {
        now:new Date().getTime()/1000,
        showTime:true,
        popshow:false,
        confirmed:0,
      }
    },
    mounted: function(){
      this.getConfirmed();
      if(this.genre == 'gym'){
        this.setTime()
       }
    },
    methods: {
      currentPercent(num,maxVal){
        let percent = Math.round(num/maxVal*100);
        if(percent){
          return percent+'%';
        }else{
          return 0;
        }
      },
      getConfirmed(){
        let _confirmed = Math.ceil(new Date().getTime()/1000) - this.start_time
        if(_confirmed < 60){
          this.confirmed = '<1'
        }else{
          this.confirmed = Math.ceil(_confirmed/60)
        }
      },
      setTime: function(){
        this.timeoutID = setTimeout(()=>{
          this.setTime();
        },1000);
        this.now = Math.floor(new Date().getTime()/1000);
        if(this._duration - this.duration*60 > 0){
          this.showTime = false;
          clearTimeout(this.timeoutID);
        }
      },

      copy:function(){
        window.__copy__(this.gps_str)
      },

      gotop:function(){
        let _latlng = {
          lat:this.lat,
          lng:this.lng
        }
        window.__go_to_point__(_latlng)
        this.popshow = false
      },

      showPop:function(){
        window.__closeAllMarker();
        this.popshow = true
      }
    },

    destroyed:function(){
      if(!!this.timeoutID){
        clearTimeout(this.timeoutID)
      }
    },

    computed: {
      getDetails:function(){
        let arr = new Array(6);
        for(let i=0;i<arr.length;i++) {
          let currentItem = this.details[i];
          if (!currentItem) {
            arr[i] = {
              imgIcon: './static/images/stops/unfind.png',
              pokemon_cp:0,
              max_cp:0,
            }
          } else {
            arr[i] = {
              imgIcon: this.nestImgPrefix + parseInt(currentItem.pokemon_id) + '.png',
              pokemon_cp: currentItem.pokemon_cp,
              max_cp: currentItem.max_cp,
            }
          }
        }
        console.log(`看看以下:${arr.length}`);
       return arr;
      },
      iconImg:function(){
        switch(this.team){
          case 0:
            return './static/images/stops/0.png'
          case 1:
            return './static/images/stops/1.png'                  //-3-黄色 instinct   1--蓝色Valor  2--红色Mystic   0---灰色阵营
          case 2:
            return './static/images/stops/2.png'
          case 3:
            return './static/images/stops/3.png'
          default:
            return './static/images/stops/0.png'
        }
      },
      getTeam:function(){
        switch(this.team){
          case 0:
            return 'Empty ';
          case 1:
            return this.trans.valor;
          case 2:
            return this.trans.mystic;
          case 3:
            return this.trans.instinct;
          default:
            return 'Empty'
        }
      },
      cool_time:function(){
        return getCoolTime(this.distances)
      },

      distances_str:function(){
        let _distances = this.distances
        if(_distances > 1000)
        {
          _distances = _distances/1000;
          _distances = _distances.toFixed(2)+'km'
        }else{
          _distances = _distances.toFixed(2)+'m'
        }
        return _distances
      },

      distances:function(){
        return getDisance(this.curPosition.lat,this.curPosition.lng,this.lat,this.lng)
      },

      gps_str:function(){
        if(this.genre == 'iv100'){
          let latlng = {
            lat:this.lat.toFixed(6),
            lng:this.lng.toFixed(6)
          }
          latlng = this.$gps.secretPoint(latlng.lat,latlng.lng,'object')
          return `${latlng.lat},${latlng.lng}`
        }else{
          return this.lat.toFixed(6) + ',' + this.lng.toFixed(6)
        }
      },

      fh:function(){
        return this._duration > 0
      },

      raid_img:function(){
        //Boss图标
        if(this.pet_id != 0 && this.fh) {
          return '//assets.thinkskysoft.com/vlocapi/pokemon_list_img/'+this.pet_id+'.png'
        }

        //未知
        if(this.pet_id == 0 && this.fh){
          return "./static/images/raid_icon/un"+this.num1+".png"
        }

        //蛋图标
        if(!this.fh){
          return "./static/images/raid_icon/egg"+this.num1+".png"
        }
      },

      _duration: function(){
        return this.now - this.start
      },

      duration_str:function(){
        let _duration = this._duration > 0 ? this.duration*60 - this._duration : Math.abs(this._duration)
        let _h = Math.abs(Math.floor(_duration/3600))
        let __m = Math.abs(Math.floor(_duration%3600/60))
        let __s = Math.abs(Math.floor(_duration%3600%60))
        return `${_h > 0 ? _h + ':' : '00:'}${__m <= 0 ? '00' : __m < 10 ? '0'+__m : __m}:${__s <= 0 ? '00' : __s < 10 ? '0'+__s : __s}`
      },

      ...mapGetters(['trans','nestImgPrefix']),
      ...mapGetters('pokemongos',['pokemongos_list','reward_list','task_list']),
      ...mapGetters(['isMarkergymnewShow']),
      ...mapState('pokemongos',['petiv_list']),
      ...mapState('googlemap',['curPosition'])
    }
  }
</script>


<style lang="less" scoped>
  @import '../assets/less/util';
  .pokemongo-marker {
    position: absolute;
    text-align: center;
    width:30px;
    height:30px;
    font-size:0;
    line-height: 0;
    cursor: pointer;
    .marker {
      position: relative;
      margin:auto;
      .icon {
        font-size:0;
        line-height: 0;
        height:30px;
        width:30px;
      }
      .pokemon-tip {
        width:15px;
        height: 15px;
        position: absolute;
        left:7px;
        top:23px;
      }
    }

    .raid {
      .time {
        position:absolute;
        white-space: nowrap;
        font-size:12px;
        text-align: center;
        top:-18px;
        left: -14px;
        width:60px;
        color:#333;
        line-height: 18px;
        height:18px;
        border-radius: 5px;
        z-index: 90;
      }

      .time-fh {
        background:#ff98cd;
      }
      .time-end {
        background:#fc9c62;
      }
    }

    .pop {
      padding-right:5px;
      position: absolute;
      left:0px;
      width:auto;
      /*height:140px;*/
      border-radius: 2px;
      box-sizing: border-box;
      outline: none;
      box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
      background:#fff;
      border-radius: 5px;
      z-index: 5;
      left:-115px;
      margin:auto;
      text-align: left;
      cursor: default;
      font-size:12px;
      line-height: 1.2;
      .title {
        line-height: 2;
        font-size: 14px;
      }
      span {
        color:#999;
      }
      .icon-close {
        position: absolute;
        right:8px;
        top:8px;
        cursor: pointer;
        &:hover {
          color:#1890f1;
        }
      }

      .info {
        display: flex;
        img {
          width:50px;
          height:50px;
          margin:0 5px;
        }
        p {
          line-height: 1.4;
          white-space: nowrap;
        }
      }

      .poke-btn-group {
        padding-top:5px;
        text-align: center;
        button {
          line-height: 1;
          font-size:12px;
          padding:3px;
        }
        .btn {
          line-height: 1 !important;
          font-size:12px;
          padding:3px;
          text-decoration: none;
        }
        .btn-default:active{
          background-color:#187BD8;
        }
        .btn-white:active{
          background-color:#E9E9E9;
        }
      }

      &:before {
        content: ' ';
        display:block;
        position: absolute;
        bottom:-20px;
        left:120px;
        font-size:0px;
        border:10px solid #fff;
        line-height: 0px;
        border-left-color:transparent;
        border-right-color:transparent;
        border-bottom-color:transparent;
      }
    }
  }

  .detail-progress-wrap{
    text-align:center;
    font-size:6px;
    border:1px solid #eee;
    background-color:#fff;
    height:12px;
    line-height:12px;
    width:100%;
    position:relative;
    .detail-progress-percent{
      position:absolute;
      height:12px;
      background-color:rgba(7,250,255,.5);
      left:0;
    }
  }
  .pets-info-wrap{
    text-align:center;
    width:220px;
    margin:5px 0;
    .pets-info-item-wrap{
      text-align:left;
      display:inline-block;
      margin-right:5px;
      width:30px;
      .pets-img-wrap{
        height:25px!important;
        width:25px!important;
      }
    }
  }

</style>
