<template>
  <div class="triangle-wrap">
    <span class="t">ATK:{{data.attackIV}}</span>
    <span class="l">STA:{{data.staIV}}</span>
    <span class="r">DEF:{{data.defenseIV}}</span>
    <svg :height="height" :width="width" :viewBox="'0 0 '+width+' '+height">

      <g>
        <polygon
          v-for="(item,index) in default_line"
          :key="index"
          class="stroke-poly"
          :points="item.t + ' ' + item.r + ' ' + item.l"></polygon>
      </g>

      <polygon
        class="full-poly"
        :points="point.t + ' ' + point.r + ' ' + point.l"></polygon>

    </svg>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  const width = 100
  const height = 80
  //角度求坐标
  const p2 = function(rt,rr,rl){
    let size = width/2;
    let x_fun = function(angle,r){
      return size+Math.floor(r*Math.cos(angle*Math.PI/180)*100)/100;
    }
    let y_fun = function(angle,r){
      return size+Math.floor(r*Math.sin(angle*Math.PI/180)*100)/100;
    }
    let __point = {
      t:x_fun(-90,rt)+' '+y_fun(-90,rt),
      r:x_fun(30,rr)+' '+y_fun(30,rr),
      l:x_fun(150,rl)+' '+y_fun(150,rl),
    }
    return __point
  }
  //线
  let default_line = []
  for(let i = 0;i<5;i++){
    let _r = width/2 - i*(width/10)
    default_line.push(p2(_r,_r,_r))
  }

  export default {
    name: 'triangle',

    props:['data'],

    data(){
      return {
        default_line:default_line,
        width:width,
        height:height
      }
    },

    computed:{
      l:function(){
        return this.data.staIV/15
      },

      t:function(){
        return this.data.attackIV/15
      },

      r:function(){
        return this.data.defenseIV/15
      },

      point:function(){
        let __point = p2(
          Math.floor(this.t*width/2),
          Math.floor(this.r*width/2),
          Math.floor(this.l*width/2)
        )
        return __point
      },

      ...mapGetters(['trans']),
    }
  }
</script>



<style scoped lang="less">
  .triangle-wrap {
    background: white;
    clear: both;
    display: block;
    margin: 0 auto;
    position: relative;
    padding:22px 10px 10px;
    text-align: center;
    svg {
      margin:auto;
    }
    .stroke-poly {
      fill: #fff;
      stroke: rgba(214, 214, 214, 0.589);
      stroke-width: 1;
    }
    .l {
      bottom: 5px;
      left: 5px;
    }
    .r {
      bottom:5px;
      right:5px;
    }
    .t {
      top:5px;
      left:62px;
      display: block;
    }
    span {
      font-size: 12px;
      position:absolute;
    }
    .full-poly{
      fill:rgba(9, 255, 0, 0.3);
      stroke: rgba(27, 231, 71, 0.8);
      stroke-width: 2;
    }
  }

  .wild-detail-wrap {
    width:300px;
  }

  .wild-header {
    img {
      width:40px;
      height:40px;
      margin-right:10px;
    }
    span {
      display:block;
    }
    display: flex;
    margin-bottom:10px;
    div {
      flex:1;
    }
    color:#999;
    font-size:12px;
    b {
      color:#333;
      font-size:14px;
    }
  }

  .wild-field-wrap {
    display: flex;
    margin-bottom:-1px;
    .wild-field {
      position: relative;
      width:150px;
      border:1px solid #ccc;
      box-sizing: border-box;

      &:last-child {
        border-left: none;
      }

      .icon-tip {
        position:absolute;
        left:10px;
        top:20px;
        // width:40px;
        font-size:12px;
        text-align: center;
        height:40px;
        z-index: 9;

        img {
          width:20px;
          height: 20px;
        }
      }

      .tit {
        font-size:12px;
        text-align: center;
      }

    }
    .wild-field-param {
      display: flex;
      flex-direction: column;
      font-size: 12px;
      text-align: center;
      padding:10px;
      .percent {
        line-height: 1.5;
        font-size:50px;
        color:#333;
      }

      .rank {
        color:#03c;
        text-decoration:underline;
      }
    }
  }
</style>
