<template>
    <div ref="camera">
        <div @touchstart="startDrag=true" @touchend="startDrag=false"><camera :style="'transform:rotate('+(angle+45)+'deg)'"></camera></div>
        <!--<tip style="left:120px;top:0px;width:200px;" :dir="'left-top'" ref="tip" :text="'test'" v-if="!rockerTip">-->
            <!--<p>{{trans.rockerMessage}}</p>-->
        <!--</tip>-->
        <div style="text-align:center;margin-top:10px">
            <btn :style="ishold ? 'background:#d00' : ''" :action="holder">{{holder_txt}}</btn>
        </div>
    </div>
</template>

<script>
import btn from './btn.vue'
import tip from './tip.vue'
import camera from './camera.vue'
import { mapGetters } from 'vuex'


export default {
    name: 'ui-rocker',
    props:[ 'move' ],
    components: { camera, tip, btn },
    data(){
        return {
            angle:30,
            offsetWidth:120,
            startDrag:false,
            // step:0.000014,
            moveing:false,
            key_left:false,
            key_right:false,
            key_down:false,
            key_up:false,
            pointMoveIntervalId:null,
            hold:0,
            holdIntervalId:null,
            ishold:false,
            autoIntervalId:null,
            angleChange:true
        }
    },
    mounted:function()
    {
        this.$addQuickKey(['ctrl','h'],this.holder)
    },
    computed: {
        holder_txt:function()
        {
            if(this.ishold)
            {
                return this.trans.holdoff
            }else{
                return this.trans.holdon
            }
        },
      //摇杆的步长
      step:function(){
        let step = this.speed*2/10000000
        return step
      },
      ...mapGetters(['speed', 'trans', 'rockerTip'])
    },
    methods:{
        holdOff:function()
        {
            this.ishold = false
        },
        holdOpen(){

            this.ishold = true
        },
        holder:function()
        {
            if(this.$parent.simulationType == 0)
            {
                this.ishold = this.ishold ? false : true
            }
        },
        init:function()
        {
            window.document.addEventListener('touchmove',(ev)=>{
                if(this.startDrag)
                {
                    this.movePoint(ev);
                }
            });
        },
        movePoint:function(ev)
        {
            if(this.startDrag)
            {
                this.rocker_x = this.$refs.camera.offsetLeft + this.offsetWidth/2;
                this.rocker_y = this.$refs.camera.offsetTop + this.offsetWidth/2;
                this.angle = this.getAngle(this.rocker_x,this.rocker_y,ev.pageX||ev.touches[0].pageX,ev.pageY||ev.touches[0].pageY);
            }
        },
        getAngle:function(px,py,mx,my){//获得人物中心和鼠标坐标连线，与y轴正半轴之间的夹角
            var x = Math.abs(px-mx);
            var y = Math.abs(py-my);
            var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
            var cos = y/z;
            var radina = Math.acos(cos);//用反三角函数求弧度
            var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

            if(mx>px&&my>py){//鼠标在第四象限
                angle = 180 - angle;
            }

            if(mx==px&&my>py){//鼠标在y轴负方向上
                angle = 180;
            }

            if(mx>px&&my==py){//鼠标在x轴正方向上
                angle = 90;
            }

            if(mx<px&&my>py){//鼠标在第三象限
                angle = 180+angle;
            }

            if(mx<px&&my==py){//鼠标在x轴负方向
                angle = 270;
            }

            if(mx<px&&my<py){//鼠标在第二象限
                angle = 360 - angle;
            }
            return angle;
        },
        moveUp:function()
        {
            let __j = this.angle * (2*Math.PI/360);
            this.move(Math.sin(__j)*this.step,Math.cos(__j)*this.step);
        },
        moveDown:function()
        {
            let __j = this.angle * (2*Math.PI/360);
            this.move(Math.sin(__j)*-this.step,Math.cos(__j)*-this.step);
        },
        moveLeft:function()
        {
            let _angle = this.angle - 5;
            if(_angle < 0)
            {
                this.angle = 360;
            }else{
                this.angle = _angle;
            }
        },
        moveRight:function()
        {
            let _angle = this.angle + 5;
            if(_angle > 360)
            {
                this.angle = 0
            }else{

                this.angle = _angle;
            }
        },
        // checkKey:function()
        // {
        //     if(this.key_up && !this.key_down)
        //     {
        //         this.moveUp()
        //         return
        //     }
        //
        //     if(this.key_down && !this.key_up)
        //     {
        //         this.moveDown()
        //         return
        //     }
        //
        // },
        checkR:function()
        {
            if(this.key_left && !this.key_right)
            {
                this.moveLeft()
            }

            if(this.key_right && !this.key_left)
            {
                this.moveRight()
            }
        },
        //读取给ios用
        getStepX:function(){
          let __j = this.angle * (2*Math.PI/360)
          let stepX = Math.sin(__j)*this.step
          return stepX
        },
        getStepY:function(){
          let __j = this.angle * (2*Math.PI/360)
          let stepY = Math.cos(__j)*this.step
          return stepY
        },
    },
    watch:{
        //判断hold不hold得住
        ishold:function(val)
        {

            /*如果hold住了，开启自动行走*/
            if(true == val)
            {
                let player = ()=>{
                    let __j = this.angle * (2*Math.PI/360),
                        __t = this.$parent.apiFrequency();
                    this.moveing = true
                    this.move(Math.sin(__j)*this.step,Math.cos(__j)*this.step)
                    this.autoIntervalId=setTimeout(player,__t)
                }
                player()
            }

            /*如果没hold住,停止自动行走*/
            if(false == val)
            {
                clearInterval(this.autoIntervalId)
                this.autoIntervalId=null
                this.moveing = false
            }
        },

        startDrag:function(val)
        {
            if(!val)
            {
                clearInterval(this.pointMoveIntervalId)
                this.pointMoveIntervalId = null
                this.moveing=false;
            }else{
                if(this.pointMoveIntervalId == null)
                {

                    this.pointMoveIntervalId = setInterval(()=>{
                        let __j = this.angle * (2*Math.PI/360);
                        this.moveing=true;
                        this.move(Math.sin(__j)*this.step,Math.cos(__j)*this.step);
                    },this.$parent.apiFrequency())
                }
            }
        }
    },
    created:function()
    {
        this.$store.commit('setValue',{
            key:'rockerTip',
            val:'yes'
        })

        window.document.addEventListener('mouseup',()=>{
            this.startDrag = false;
        });

        this.init();
    }
}
</script>
