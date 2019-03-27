<template>
    <div ref="touch" class="touch-main" :style="pos"><slot></slot></div>
</template>

<script>
export default {
    name: 'touch',
    data(){
        return {
            m:false,
            disX:0,
            disY:0,
            pos:{
                left:0,
                top:0
            }
        }
    },
    mounted:function()
    {
        let __x = (window.document.body.clientWidth - this.$refs.touch.offsetWidth)/2;
        let __y = (window.document.body.clientHeight - this.$refs.touch.offsetHeight)/2;

        this.disX = Math.floor(__x);
        this.disY = Math.floor(__y);
        this.pos.left = this.disX + 'px'
        this.pos.top = this.disY + 'px'
        console.log("this.pos.left"+this.pos.left);
        console.log("this.pos.top"+this.pos.top);
    },
    methods: {
        touchmove: function(target)
        {
            if(this.m)
            {
              this.pos.left = Math.floor(target.touches[0].clientX - this.disX) + 'px';
              this.pos.top = Math.floor(target.touches[0].clientY - this.disY) + 'px';
            }
        },
        touchstart: function(ev)
        {
            this.disX = Math.floor(ev.touches[0].clientX - this.$refs.touch.offsetLeft);
            this.disY = Math.floor(ev.touches[0].clientY - this.$refs.touch.offsetTop);
            this.m=true;
        },
        touchend: function()
        {
            this.m=false;
        }
    }
}
</script>

<style scoped>
    .touch-main {position: absolute;left:10px; right:20px;  }
</style>
