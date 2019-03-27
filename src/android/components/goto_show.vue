<template>
  <div v-if="goto_msg_show" class="message-mask">
    <div class="message-box" style="height:230px">
      <div class="title">{{title}}</div>
      <div class="message">{{message}}</div>
      <div class="btn-group"><button class="controls btn btn-default" @click="$parent.goto_msg_show=false">ok</button></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'goto_show',
  props:['goto_msg_show'],
  data(){
    return {
        title:window.gotoPointTitle,
        message:window.gotoPointMsg
    }
  }
}
</script>

<style scoped>
  .message-mask {
    position: absolute;
    width: 100%;
    height:100%;
    background:rgba(0,0,0,0.5);
    left:0;
    right:0;
  }
  .btn-group {text-align: center; margin-top:0;}
</style>
