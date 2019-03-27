<template>
  <transition name="el-message-fade">

    <div class="less-message-wrap less-message-wrap-tip"  draggable="false"  @drop="nothing" @dragover="nothing" @dragenter="nothing" @click.stop.prevent="close">
      <div class="less-message-tip">
        <div class="less-message-tip-content" v-html="content"></div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
    name: 'alert_frame',
    data(){
      return {}
    },
    mounted:function(){
      setTimeout(()=>{
        this.close()
      },3000)
    },
    methods:{
      nothing:function(event)
      {
        event.stopPropagation()
        event.preventDefault()
        return
      },
      btnCall:function(call)
      {
        if(call instanceof Function)
        {
          call()
        }
        if(!this.noclose){
          this.close()
        }
      }
    }

}
</script>
