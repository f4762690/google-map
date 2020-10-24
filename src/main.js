/** 谷歌地图 **/
// require('babel-polyfill')
import Vue from 'vue'
import gps from './lib/Gps'
import config from './config'
import router from './router'
import Router from 'vue-router'
import VueJsonp from 'vue-jsonp'
import store from './store/store'
import btn from './components/btn.vue'
import Range from './ios/components/range'
import VueResource from 'vue-resource'
import touch from './ios/components/touch.vue'
import message from './package/message/main'
import tip from './package/tip/main'
import vprompt from './package/prompt/main'
import map_btn from './components/map_btn.vue'
import {addQuickKey, removeQuickKey} from './lib/QuickKey'
import {getDisance,converPositionToList} from './lib/ConverPoint'
import {copy} from './lib/Clipboard.js'
import VueTouch from 'vue-touch'
import { Button,Switch,Indicator,Spinner,Field } from 'mint-ui'
import FastClick from 'fastclick'
import animate from 'animate.css'
import getCoolTime from './ios/lib/CoolingTime'
import VueLazyload from 'vue-lazyload'
import loadImg from './image/what1 .png'

Vue.use(VueLazyload)

// or with options
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: './image/p_to_p.png',
  loading: loadImg,
  attempt: 1
});

window.addEventListener( "load", function() { FastClick.attach( document.body );}, false );
// FastClick.attach(document.body);
//ios依赖css
require('./ios/assets/style.css')
require('./ios/assets/app.css')
require('./ios/assets/app.less')
require('./ios/assets/mint.css')

Vue.config.productionTip = false

Vue.use(animate)
Vue.use(VueTouch,{name:'v-touch'})
Vue.use(Router)
Vue.use(VueJsonp)
Vue.use(VueResource)
Vue.component('btn',btn)
Vue.component('touch',touch)
Vue.component('map_btn',map_btn)
Vue.component(Range.name,Range)
Vue.component(Button.name,Button)
Vue.component(Switch.name,Switch)
Vue.component(Spinner.name,Spinner)
Vue.component(Field.name,Field)

Vue.filter('timeFormat', function (timestamp) {
  if(timestamp){
    return new Date(timestamp).toLocaleString();
  }
});


Vue.filter('specialTime',function(timestamp){
  let minute = 60,
      hour = 60*60,
      day = 60*60*24,
      month = 60*60*24*30;
  if(timestamp <minute){
    return '1分钟内'
  }else if(timestamp>=minute && timestamp<=hour){
    return parseInt(timestamp/minute) + "分钟前"
  }else if(timestamp>hour && timestamp<=day){
    return parseInt(timestamp/hour) + "小时前"
  }else if(timestamp>day && timestamp<=month){
    return parseInt(timestamp/day) + "天前"
  }else if(timestamp>month){
    return parseInt(timestamp%month) + "月前"
  }
});

Vue.prototype.$gps = gps
Vue.prototype.$tip = tip
Vue.prototype.$alert = message
Vue.prototype.$ClipboardCopy = copy
Vue.prototype.$getDisance = getDisance
Vue.prototype.$addQuickKey = addQuickKey
Vue.prototype.$removeQuickKey = removeQuickKey
Vue.prototype.$ConverPoint = converPositionToList
Vue.prototype.$Indicator = Indicator
Vue.prototype.$getCoolTime = getCoolTime
Vue.prototype.$prompt = vprompt


new Vue({
    el: '#app',
    store,
    router,
    created:function(){
      window.storeCommit = this.$store.commit
    },
    template: '<router-view></router-view>'
})
//请求错误处理
Vue.http.interceptors.push(function(request,next){
  if(window.location.href.indexOf('vlocation-test.thinkskysoft.com')>=0 || 'development' === process.env.NODE_ENV){  //测试环境修改url
    request.url = request.url.replace("vlocapi.thinkskysoft.com","vlocapitest.thinkskysoft.com");
  }
});
