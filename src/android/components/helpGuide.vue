<template>
      <transition name="left-page">
        <div class="wrap" v-show="ifShow">
          <div class="back" @click="action">
            back
          </div>
          <div>
            这是内容
          </div>
        </div>
      </transition>
</template>

<script>
    export default {
        name: 'help-guide',
        props:['ifShow','action']
    }
</script>

<style scoped lang="less">
  .wrap{
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background-color:#ffff;
    z-index:1000;
  }
  .back{
    padding:20px;
    background-color:blue;
  }
  .left-page-enter-active,.left-page-leave-active{
    transition:0.5s ease;
    transform: translate3d(0,0,0);
  }

  .left-page-enter,.left-page-leave-to{
    transform: translate3d(100%,0,0);
  }

</style>
