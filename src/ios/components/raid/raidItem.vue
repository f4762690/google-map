<template>
    <li v-if="visible">
              <span class="icon-wrap">
                <img :src="raid_img" class="icon" />
                <!--vip-->
                <img class="tip" v-if="item.is_vip==1" :src="pokemonImgPrefix+'vip.png'"/>

                <!--ex-->
                <img class="tip" v-if="item.is_vip==2" :src="pokemonImgPrefix+'ex.png'"/>
              </span>
    <span>{{item.raidName}}</span>
    <span><img class="flag-wrap" :src="getFlag(item.country)"><br/><span>{{item.city}}</span></span>
    <span>{{fh ? 'end' : 'hatch'}} {{duration_str}}</span>
    <span class="button-container"><button class="btn btn-default font-16" @click.stop.prevent="()=>{$emit('goPoint',item)}">Go</button></span>
  </li>
</template>

<script>
    import { mapGetters,mapMutations } from 'vuex';
    export default {
        name: "raidItem",
        props:['item'],
        data(){
          return {
            timeoutID:null,
            visible:true,
            now:Math.floor(new Date().getTime()/1000),
            time1:0,
            time2:0,
            time3:0,
            time4:0,
            time5:0,
          }
        },
        computed:{
          raid_img:function(){
            //Boss图标
            if(this.item.pet_id != 0 && this.fh) {
              return '//assets.thinkskysoft.com/vlocapi/pokemon_list_img/'+this.item.pet_id+'.png'
            }

            //未知
            if(this.item.pet_id == 0 && this.fh){
              return "./static/images/raid_icon/un"+this.item.num1+".png"
            }

            //蛋图标
            if(!this.fh){
              return "./static/images/raid_icon/egg"+this.item.num1+".png"
            }

          },
          //判断BOSS是否出现公式   $a=当前时间- start 如果a >0 表示BOSS已经出现 结束,a <0 表示BOSS还没出现再孵化中 孵化,
          //孵化倒计时 =当前时间 --start
          //结束倒计时 =start+ duration -当前时间
          fh:function(){
            return this._duration > 0
          },
          _duration: function(){
            return this.now - this.item.start
          },
          duration_str:function(){
            let __m = Math.floor(Math.abs(this._duration)/60);
            let __s = Math.abs(Math.abs(this._duration)%60);
            let __em =  Math.abs(Math.floor(Math.abs(this._duration-this.item.duration*60)/60));
            let __es = Math.abs(Math.abs(this._duration-this.item.duration*60)%60);
            this.time2 = __m;
            this.time3 = __s;
            this.time4 = __em;
            this.time5 = __es;
            if(this.fh){            //结束倒计时
              let es = '';
              if(__es < 0){
                es = '00'
              }else if(__es == 0){
                es = __em == 0?'00':'59';
              }else if(__es >0){
                es = __es < 10 ? '0'+__es : __es
              };
              return `${__em}:${es}`
              }else{
              let s = '';
              if(__s < 0){
                s = '00'
              }else if(__s == 0){
                s = __m ==0?'00':'59';
              }else if(__s >0){
                s = __s < 10 ? '0'+__s : __s
              };
              return `${__m}:${s}`
            }
          },
          ...mapGetters(['flagPrefix','flags','titleLang','pokemonImgPrefix']),
          ...mapGetters('raid',['raidNames']),
        },
        mounted: function(){
          this.setTime()
        },
        destroyed:function(){
          clearTimeout(this.timeoutID)
        },
        methods:{
          getFlag(name){
            return this.flagPrefix + this.flags[name];
          },

          setTime: function(){
            this.timeoutID = setTimeout(()=>{
              this.setTime()
            },1000)

            this.now = Math.floor(new Date().getTime()/1000);
            this.time1 = this._duration - this.item.duration*60;
            if(this._duration - this.item.duration*60 >= 0 ){
              this.visible = false
              clearTimeout(this.timeoutID)
            }
          },
          ...mapMutations('raid',['setRaidNames'])
        }
    }
</script>

<style scoped lang="less">
  .icon-wrap{
    flex:0 0 55px;
    width:55px;
  }
  li{
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
    .f-w-55{
      flex:0 0 55px;
      width:55px;
    }
    span{
      vertical-align: middle;
      max-width:100px;
      flex:1;
      font-size:10px;
      display:inline-block;
    }
    .button-container{
      flex:0 0 60px!important;
    }
    .tip{
      width:16px;
      height:16px;
    }
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
  .flag-wrap{
    border:1px solid #ccc;
    vertical-align:middle;
    width:35px;
    height:20px;
  }
  .font-16{
    font-size:16px;
  }
</style>
