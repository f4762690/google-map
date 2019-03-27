<script>
import Vue from 'vue'
import controller from './components/Controller.vue'
import GoogleMap from './components/GoogleMap.vue'
import {SyncConfig,ConfigGet,openurl,arrived,exportFile,importFile,copyText,iosSetTimeout,iosClearInterval,continueRun,setLanguage,openHosting,getCopyText,sendNoti} from './lib/api'
import util from './lib/util'
import { mapGetters } from 'vuex'
import custom_marker from './lib/CustomMarker'
Vue.prototype.$ConfigGet = ConfigGet
Vue.prototype.$exportFile = exportFile
Vue.prototype.$arrived = arrived
Vue.prototype.$SyncConfig = SyncConfig
Vue.prototype.$importFile = importFile
Vue.prototype.$openurl = openurl
Vue.prototype.$copyText = copyText
Vue.prototype.$iosSetTimeout = iosSetTimeout
Vue.prototype.$iosClearInterval = iosClearInterval
Vue.prototype.$continueRun = continueRun
Vue.prototype.$setLanguage = setLanguage
Vue.prototype.$openHosting = openHosting
Vue.prototype.$getCopyText = getCopyText
Vue.prototype.$util = util
Vue.prototype.$sendNoti = sendNoti
Vue.prototype.$custom_marker = custom_marker

window.setLanguage = setLanguage
window.openurl = openurl
window.SyncConfig = SyncConfig
window.ConfigGet = ConfigGet

Vue.component('mymap',GoogleMap)

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
              'title':this.version+' Updated Logs:',
              'content':'<p>1. Hovering the feeds on Map</p>'+
                  '<p>2. Add the Wild Pokemons in NYC</p>',
              'btns':[this.trans.gotit]
          });
          this.$store.commit('setUpdate');
      },
  }
}
</script>
