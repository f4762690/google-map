<template>
    <button class="mb-10" v-on:mouseover="show=true" v-on:click.stop.prevent="$parent.simulationType = type" v-on:mouseleave="show=false" :class="simulationType==type ? 'button-style-active button-style' : 'button-style'">
        <img :src="icon" />
        <span v-if="show&&msg" :class="'info-'+pos">{{msg}}</span>
    </button>
</template>

<script>
export default {
    name: "map-btn",
    props: ['msg', 'icon', 'active', 'simulationType', 'type','pos'],
    data(){
        return {
            show:false
        }
    }
}
</script>

<style scoped>
  .mb-10{
    margin-bottom:10px;
  }
.m_p_num {
    position:absolute;
    right:0;
    bottom:0;
    background:#d00;
    color:#fff;
    font-size:9px;
    font-weight: 100;
    height:12px;
}
.button-style {
    border-radius: 2px 2px 2px 2px;
    box-sizing: border-box;
    border:none;
    -moz-box-sizing: border-box;
    outline: none;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
    display: inline-block;
    vertical-align: top;
    width:30px;
    height:30px;
    font-size:0;
    text-align: center;
    cursor: pointer;
    background-color:#ccc;
    position: relative;
    margin-left:5px;
}
.info-bottom{
  position: absolute;
  right:0px;
  line-height: 1.2em;
  background: rgba(0,0,0,.6);
  border-radius: 3px;
  padding:3px;
  color:#fff;
  top:35px;
  font-size: 12px;
  width:max-content;
  max-width:180px;
  word-break: break-all;
  white-space: pre-wrap;
  word-wrap:break-word;
}
.info-left{
  position: absolute;
  top:10px;
  right:35px;
  line-height: 1.2em;
  background: rgba(0,0,0,.6);
  border-radius: 3px;
  padding:3px;
  color:#fff;
  font-size: 12px;
  width:max-content;
  max-width:180px;
  word-break: break-all;
  white-space: pre-wrap;
  word-wrap:break-word;
}
.info-bottom:before {
   content: " ";
   position: absolute;
   right: 15px;
   top:-10px;
   border-width: 5px;
   width:0px;
   height:0px;
   overflow:hidden;
   border-style: solid;
   border-color: transparent transparent rgba(0,0,0,.6) transparent;
 }

.info-left:before {
  content: " ";
  position: absolute;
  right: -10px;
  top:5px;
  border-width: 5px;
  width:0px;
  height:0px;
  overflow:hidden;
  border-style: solid;
  border-color: transparent transparent transparent rgba(0,0,0,.6);
}

/*.info-bottom::after {*/
  /*top:auto;*/
  /*bottom:-10px !important;*/
  /*border-color: rgba(0,0,0,.6) transparent transparent transparent;*/
/*}*/

/*.info-left::after {*/
  /*top:5px;*/
  /*right:-10px;*/
  /*border-color: transparent transparent transparent rgba(0,0,0,.6);*/
/*}*/

.button-style img {
    display: block;
    margin:auto;
}

.button-style-active {
    background-color: #4d90fe;
}

</style>
