<template>
  <transition name="info-classes-transition" enter-active-class="animated zoomIn" leave-active-class="animated zoomOut">
    <div v-show="openRadar" class="radar-wrap">
      <header>
        <span>{{getTitle()}}</span>
        <i class="icon-close" @click.stop.prevent="setOpenRadar(false)"></i>
        <i class="icon-minus" @click.stop.prevent="minimize" ></i>
      </header>
      <ul>
        <li @click="setTitle('sniper')" class="icon-aim" :class="{'active':currentComponent == 'sniper'}">
        </li>
        <li @click="setTitle('nest')" class="icon-cave" :class="{'active':currentComponent == 'nest'}">
        </li>
        <li @click="setTitle('raid')" class="icon-egg" :class="{'active':currentComponent == 'raid'}">
        </li>
        <li @click="setTitle('field')" class="icon-tele" :class="{'active':currentComponent == 'field'}">
        </li>
        <li @click="setTitle('wild')" class="icon-uniE921" :class="{'active':currentComponent == 'wild'}">
        </li>
        <li @click="setTitle('gym')" class="gym-icon" :class="{'active':currentComponent == 'gym'}">
        </li>
      </ul>
      <keep-alive>
        <component :is="currentComponent" :point="point" :ref="currentComponent+'Ref'"></component>
      </keep-alive>
    </div>
  </transition>
</template>

<script>
    import sniper from './sniper'
    import nest from './nest'
    import raid from './raid/raid'
    import field from './field'
    import wild from './wild/wild'
    import gym from './gym/gym'
    import { mapState,mapGetters,mapMutations } from 'vuex'
    export default {
        name: "radarResource",
        components:{ sniper,nest,raid,field,wild,gym},
        props:['point'],
        data(){
          return {
            currentComponent:'',
            wrapHeight:'',
            firstField:true,
            firstRaid:true,
            firstWild:true,
            firstGym:true,
          }
        },
        mounted(){
          this.$store.commit('field/setTaskName');
        },
        computed:{
          ...mapGetters(['trans','openRadar']),
        },
        methods:{
          minimize(){
            this.$store.commit('setCurrentType',this.currentComponent);
            this.setOpenRadar(false)
            this.$parent.showPointSelect();
          },
          setTitle(title){
            this.currentComponent = title;
            switch(title){
              case 'sniper':
                this.$store.commit('sniper/setFilter',false);
                break;
              case 'nest':
                this.$store.commit('nests/setFilter',false);
                break;
              case 'raid':
                this.$store.commit('raid/setFilter',false);
                this.firstRaid ? this.firstRaid = false : this.$store.dispatch('raid/setRaidData','new');
                break;
              case 'field':
                this.$store.commit('field/setFilter',false);
                this.firstField ? this.firstField = false : this.$store.dispatch('field/setFieldData','new');
                break;
              case 'wild':
                this.$store.commit('wild/setCurrentIndex',0);
                this.firstWild ? this.firstWild = false : this.$store.dispatch('wild/getData','new');
                break;
              case 'gym':
                this.$store.commit('gym/setFilter',false);
                this.firstGym ? this.firstGym = false : this.$store.dispatch('gym/getData','new');
                break;
            }
          },
          getTitle(){
            let title = {
              'sniper':this.trans.pokesniper,
              'nest':this.trans.nests,
              'raid':this.trans.raidText,
              'field':this.trans.filedResrearch,
              'wild':this.trans.wildLife,
              'gym':this.trans.gyms,
            };
            return title[this.currentComponent];
          },
          goPoint(obj,ifSecret){
            this.$parent.go_to_point(obj,ifSecret);
            this.$parent.showPointSelect();
            this.$parent.simulationType = 0;
            this.setOpenRadar(false)
          },
          show(){
            if(this.currentComponent == '') this.currentComponent = 'sniper';
            this.setOpenRadar(true)
            this.$nextTick(()=>{
              this.wrapHeight = document.getElementsByClassName("radar-wrap")[0].clientHeight; //用来判断滚动区域应该的高度.
              console.log(`计算出的高度是:${this.wrapHeight}`)
            })
          },
          ...mapMutations(['setOpenRadar']),
          ...mapMutations('sniper',['setHasNew','setLoading','runCallBack']),
          ...mapMutations('raid',['setLoading','resetRaidData','setLoading','runCallBack']),
          ...mapMutations('field',['setTaskName','refreshFieldData','setLoading','resetFieldData','setLoading','runCallBack']),
        }
    }
</script>

<style scoped lang="less">
  .radar-wrap{
    position:fixed;
    top:0;
    left:0;
    right:0;
    bottom:0;
    margin:auto;
    width:90%;
    height:95%;
    background-color:#fff;
    z-index:300;
    box-shadow:1px 1px 1px rgba(0,0,0,0.3);
    header{
      padding:10px;
      text-align:center;
      position:relative;
      i{
        position:absolute;
        margin-left:10px;
      }
      .icon-minus{
        right:40px;
      }
      .icon-close{
        right:10px;
      }
    }
    ul{
      text-align:center;
      font-size:0;
      display:flex;
      padding:0 10px 5px 10px;
      li{
        display: inline-block;
        border-top:1px solid #eee;
        border-left:1px solid #eee;
        border-bottom:1px solid #eee;
        font-size:20px;
        padding:5px 0;
        flex:1;
        color:#4d90fe;
      }
      li:last-child{
        border-right:1px solid #eee;
      }
      .icon-uniE921{
        color:#4bb24b;
      }
      .active{
        color:red!important;
      }
    }
    .gym-icon{
      background:url('../../../static/images/stops/1.png') no-repeat center center;
      background-size:24px 24px;
    }
    .gym-icon.active{
      background:url('../../../static/images/stops/2.png') no-repeat center center;
      background-size:24px 24px;
    }
  }
</style>
