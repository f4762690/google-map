<template>
<transition name="mapbar-fade">
    <div class="less-mp-bar-wrap" v-if="isshow">
        <div class="less-mp-bar">
            <i>{{trans.coord}}: {{pos}}</i>
            <span class="icon-undo" @click="$parent.map.undo"></span>
            <span class="icon-play" @click="$parent.map.moveHere"></span>
            <span class="icon-files-empty" @click="$emit('copy',pos)"></span>
            <span class="icon-plus" @click="maximize"></span>
        </div>
    </div>
</transition>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name:'more-point-bar',
    props:['pos'],
    data(){
        return {
            isshow:false
        }
    },
    computed:{
        ...mapGetters(['trans'])
    },
    methods:{
        show:function(){
            this.isshow = true
        },
        hide:function(){
            this.isshow = false
        },
        maximize:function(){
            setTimeout(()=>{
                this.$parent.map.maximize()
            },300)
            this.hide()
        }
    }
}
</script>

<style scoped>
.mapbar-fade-enter-active,
.mapbar-fade-leave-active {
    transition: all .3s;
    transform: scale(1);
    opacity: 1;
}

.mapbar-fade-enter,
.mapbar-fade-leave-to {
    bottom:300px;
    transform: scale(1.5);
    opacity: 0;
}
</style>
