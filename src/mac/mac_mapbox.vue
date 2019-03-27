<script>
import Vue from 'vue'
import controller from '../components/Controller.vue'
import MapBox from '../components/MapBox.vue'
import {SyncConfig,ConfigGet,openurl,exportFile,importFile,hasIVChecker,getVersion,regInitFun} from './lib/api'
import { mapGetters } from 'vuex'
Vue.prototype.$ConfigGet = ConfigGet
Vue.prototype.$exportFile = exportFile
Vue.prototype.$SyncConfig = SyncConfig
Vue.prototype.$importFile = importFile
Vue.prototype.$openurl = openurl

window.openurl = openurl
window.SyncConfig = SyncConfig
window.ConfigGet = ConfigGet
window.macgetVersion = getVersion

Vue.component('mymap',MapBox)
export default {
  name: 'App',
  template: "<controller></controller>",
  components: { controller },
  created:function(){
    this.$store.commit('init')
  },
  data(){
    return {
      'hasIVChecker':hasIVChecker()
    }
  },
  computed:{
    ...mapGetters(['updatedLogShow','trans','version'])
  },
  watch:{
    updatedLogShow:function(val)
    {
        if(val == false){
            this.showUpdateLog()
        }
    },
  },
  mounted:function(){
    if(!this.updatedLogShow)
    {
        this.showUpdateLog()
    }
    //是否有多开mac
    const checkmac = ()=>{
        let _version = window.macgetVersion()
        if(_version >= '1.7.9.3')
        {
            this.$store.commit('hasMoreWin',true)
            this.$store.commit('shellVersion',_version)
        }
    }
    regInitFun(checkmac)
    checkmac()
  },
  methods:{
    //更新日志
    showUpdateLog:function()
    {
     this.$alert({
      'title':'Updated logs',
      'content':'<p><img src="static/img/upgrade_banner.jpg" width=100% /></p>'+
                '<p>Modded Pokemon Go Plus Lite Perfectly Works With the feartures <br/>of iTools GPX to get EXP Automatically</p>',
      'btns':['Got it','Learn More']},()=>{},()=>{
          openurl('https://www.thinkskysoft.com/pokemon-go-plus-lite/')
      })
      this.$store.commit('setUpdate');
    }
  }
}
</script>
