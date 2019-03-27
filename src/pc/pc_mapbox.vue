<script>
import Vue from 'vue'
import controller from '../components/Controller.vue'
import MapBox from '../components/MapBox.vue'
import {SyncConfig,ConfigGet,openurl,exportFile,importFile,hasIVChecker} from './lib/api'

Vue.prototype.$ConfigGet = ConfigGet
Vue.prototype.$exportFile = exportFile
Vue.prototype.$SyncConfig = SyncConfig
Vue.prototype.$importFile = importFile
Vue.prototype.$openurl = openurl
import { mapGetters } from 'vuex'

window.openurl = openurl
window.SyncConfig = SyncConfig
window.ConfigGet = ConfigGet

Vue.component('mymap',MapBox)
export default {
  name: 'App',
  template: "<controller></controller>",
  components: { controller },
  created:function(){
    this.$store.commit('init')
  },
  computed:{
        ...mapGetters(['updatedLogShow','trans','version'])
  },
  data(){
    return {
      'hasIVChecker':hasIVChecker()
    }
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
