<template>
    <div class="less-message-wrap"  draggable="false"  @drop="nothing" @dragover="nothing" @dragenter="nothing">
      <div class="less-message-box">
        
        <div class="less-message-box-title" :style="title=='' ? 'border:none':''" v-if="title">
          <p>{{title}}</p><i v-if="!noclose" class="icon-close" @click="close"></i>
        </div>

        <div class="less-message-box-content" v-html="content"></div>

        <div class="less-message-box-btn-group">
          <button :key="index" v-for="(item,index) in btns" @click.stop.prevent="btnCall(item.call)" class="btn btn-default">{{item.tit}}</button>
        </div>

      </div>
    </div>
</template>

<script>
export default {
    name: 'alert_frame',
    data(){
      return {}
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
