<template>
    <div draggable="false" class="speed-wrap" @wheel="wheelHandler">
        <div draggable="false" class="speed-bar" ref='bar'>
            <div draggable="false" ondragstart='return false;' class="bar" :style="'width:'+cur+'%'"></div>
            <img draggable="false" ondragstart='return false;' @mousedown="startDrag=true"  class="control" :style="'left:'+(cur/100*193+3)+'px'" src="../image/control.png" />
        </div>
        <p draggable="false" class="speed-content">{{trans.speed}}: <span>{{speed_m}}m/s {{speed_km}}km/h</span></p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'speed',
    data(){
        return {
            startDrag:false
        }
    },
    computed:{
        cur:function()
        {
            return Math.round(((1000-this.speed)/9))
        },
        speed_m:function()
        {
            return (1000/this.speed*1.4).toFixed(2)
        },
        speed_km:function()
        {
            return (1000/this.speed*1.4*3.6).toFixed(2)
        },
        ...mapGetters(['trans','cycleModel','speed'])
    },
    mounted:function()
    {

        window.document.addEventListener('mousemove',(ev)=>{
            if(this.startDrag)
            {
                this.move(ev);
            }
        });
        window.document.addEventListener('mouseup',()=>{
            this.startDrag = false;
            this.syncSpeed()
        });
    },
    methods:{
        move:function(ev)
        {
            let __left = ev.clientX - this.$refs.bar.offsetLeft - this.$refs.bar.offsetParent.offsetLeft;
            let __ls = 0;
            if(__left > 210)
            {
                __ls = 1;
            }else{
                if(__left>0){
                    __ls = __left/210;
                }
            }
            if(__left<0)
            {
                __ls = 0;
            }
            let _p = Math.round((-900*__ls)+1000);
            this.$store.commit('setSpeed',_p);

        },
        wheelHandler:function(ev)
        {
            if(ev.deltaY > 0)
            {
                this.$store.commit('setSpeed',this.speed < 1000 ? this.speed + 10 : 1000);
            }else{
                this.$store.commit('setSpeed',this.speed > 100 ? this.speed - 10 : 100);
            }
            this.syncSpeed()
        },

        //保存已经设置的速度值
        syncSpeed:function()
        {
            switch(this.$parent.simulationType){
                case 0:
                    if(!this.startDrag)
                    {
                        this.$store.commit('setRockerSpeed')
                    }
                break;

                case 1:
                    if(!this.startDrag)
                    {
                        this.$store.commit('setWakeSpeed')
                    }
                break;

                case 2:
                    if(!this.startDrag)
                    {
                        this.$store.commit('setMorePointSpeed')
                    }
                break;
            }
        },
    }
}
</script>

<style scoped>
.speed-wrap {
    padding:10px 10px 0 10px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
}
.speed-content {font-size: 12px; line-height: 200%; text-align: center;}
.speed-content span { color:#1f6eff; }
.speed-bar {margin:auto; position: relative;}
.speed-bar,
.bar { width:210px; height: 35px; background:url(../image/speed_default.png); }
.bar { background: url(../image/speed.png); }
.control {position: absolute; bottom:2px; }

</style>
