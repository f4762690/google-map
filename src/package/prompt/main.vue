<template>
  <transition name="el-message-fade">

    <div class="less-message-wrap"  draggable="false"  @drop="nothing" @dragover="nothing" @dragenter="nothing">
      <div class="less-message-box">
        <div class="less-message-box-title" :style="title=='' ? 'border:none':''">
          <p>{{title}}</p>
          <i v-if="!noclose" class="icon-close" @click="close"></i>
        </div>

        <div v-if="content" class="less-message-box-content" v-html="content"></div>

        <div class="less-message-box-textarea">
          <textarea v-if="!textinput" v-model="input"></textarea>
          <input v-if="textinput" type="text" v-model="input" />
        </div>

        <div class="less-message-box-btn-group" >
          <button :key="index" v-for="(item,index) in btns" @click.stop.prevent="btnCall(item.call)" class="btn btn-default">{{item.tit}}</button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
    name: 'alert_frame',
    data(){
      return {
        input: '',
        content: ''
      }
    },
    mounted: function(){

      if(this.defaultVaule){
        this.input = this.defaultVaule
      }
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
          call(this.input)
        }
        if(!this.noclose){
          this.close()
        }
      }
    }

}
</script>
<style lang="less" scoped>
  .icon-floppy-disk{
    font-size:20px;
    color:red;
  }

</style>
