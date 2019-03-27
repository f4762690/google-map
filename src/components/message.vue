<template>
  <div v-show="isshow" :class="ismask ? 'less-message-wrap less-message-wrap-mask' : 'less-message-wrap'">

    <div class="less-message-box">

      <div :class="title == '' ? 'less-message-box-title noborder' : 'less-message-box-title'">
        <span v-if="!isclose" class="icon-close" @click="$emit('hide')"></span>
        <p v-if="title!=''">{{title}}</p>
      </div>

      <slot name="content"></slot>
      <slot name="button"></slot>
    </div>


  </div>
</template>


<script>
export default {
  name: 'goto_show',
  props:['title', 'ismask', 'styles', 'isclose'],
  data(){
    return {
      isshow:false
    }
  },
  methods: {
    show: function()
    {
      this.isshow = true
    },
    hide: function()
    {
      this.isshow = false
    }
  }
}
</script>
