import Vue from 'vue'
import msgboxVue from './main.vue'
const MsgboxVueConstructor = Vue.extend(msgboxVue)
let instances={}
let ins=0
const message = function(option,...callback){
  ins++
  let _insID = 'alert_'+ins
  option.insID = _insID
 
  option.noclose = option.hasOwnProperty('noclose') ? option.noclose : false
  let _msg = new MsgboxVueConstructor({
    data:option,
    methods:{
      close:function () {
        message.close(this.insID)
      },
    }
  })
  instances[_insID] = _msg.$mount()
  document.body.appendChild(instances[_insID].$el)
  return _insID
}

message.close = function(id){
  document.body.removeChild(instances[id].$el);
  delete(instances[id])
}
export default message
