<template>
    <div v-show="isshow" class="tip">
        <div :class="'tip-content tip-' + dir">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name:'tip',
    props:['text','dir'],
    data(){
        return {
            isshow:true
        }
    },
    methods: {
        show: function(){
            this.isshow = true
        },
        hide: function(){
            this.isshow = false
        }
    }
}
</script>

<style scoped lang="less">
.tip {
    display: block;
    position: absolute;
    z-index: 99;
}
.tip-content {
    background: rgba(0,0,0,0.7);
    color:#fff;
    font-size: 12px;
    border-radius: 5px;
    padding:10px;
    position: relative;
    margin:10px;
    min-height: 20px;
}
.tip-left-top:before {
    content:' ';
    /*background: rgba(0,0,0,0.7);*/
    display: block;
    width:0;
    height: 0;
    overflow:hidden;
    border-width: 10px;
    border-style: solid;
    position: absolute;
    left:-20px;
    border-color:transparent rgba(0,0,0,0.7) transparent transparent;
}
</style>
