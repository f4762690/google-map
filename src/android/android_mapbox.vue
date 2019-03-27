<script>
import Vue from 'vue'
import controller from './components/Controller.vue'
import MapBox from './components/MapBox.vue'
import {SyncConfig,ConfigGet,openurl,exportFile,importFile} from './lib/api'
import { mapGetters } from 'vuex'
Vue.prototype.$ConfigGet = ConfigGet
Vue.prototype.$exportFile = exportFile
Vue.prototype.$SyncConfig = SyncConfig
Vue.prototype.$importFile = importFile
Vue.prototype.$openurl = openurl

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
          'content':'<p>1. On walk mode, coords from favorites and search bar will stay walking.</p>'+
              '<p>2. Improve the favorites list</p>'+
              '<p>3. Real-time saving or updating your current coords </p>'+
              '<p>Perfectly Match iTools and Promote the exping efficiency:</p>'+
              '<p><a href="javascript:void(0)" onclick=openurl("https://www.thinkskysoft.com/pokemon-go-plus/")>https://www.thinkskysoft.com/pokemon-go-plus/</a></p>',
          'btns':[this.trans.gotit]
      })
      this.$store.commit('setUpdate');
    }
  }
}
</script>
