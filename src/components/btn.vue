<template>
    <button class="mb-10" onfocus="this.blur();" v-on:mouseover="show=true" v-on:click.prevent.stop="action" v-on:mouseleave="show=false" :class="type != 'icon' ? 'btn-style' : 'btn-wrap'">
        <div :class="'btn-msg btn-msg-'+pos" v-if="show&&msg" v-html="msg"></div>
        <slot></slot>
    </button>
</template>

<script>
export default {
    name: "map-btn",
    props: ['msg', 'action', 'pos', 'type'],
    data(){
        return {
            show:false
        }
    }
}
</script>

<style>
  .mb-10{
    margin-bottom:10px;
  }
.btn-wrap {
    border:none;
    background-color:#fff;
    font-size: 18px;
    position: relative;
    cursor: pointer;
    display:inline-block;
}
.btn-wrap:hover {
    color:#4d90fe;
}
.btn-style {
    border-radius: 2px 2px 2px 2px;
    box-sizing: border-box;
    border:none;
    -moz-box-sizing: border-box;
    outline: none;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
    display: inline-block;
    vertical-align: top;
    height:30px;
    text-align: center;
    cursor: pointer;
    background:#4d90fe;
    position: relative;
    color:#fff;
    padding:0 1em;
}
.btn-msg {
    position: absolute;
    z-index: 99;
    display: block;
    right:0px;
    line-height: 1.2em;
    background: rgba(0,0,0,.6);
    border-radius: 3px;
    padding:3px;
    color:#fff;
    top:35px;
    font-size: 12px;
    width:max-content;
    -webkit-max-width:180px;
    -webkit-max-height: 3.6em;
    display: block;
}

.btn-msg::after {
    content: " ";
    position: absolute;
    right: 15px;
    top:-10px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent rgba(0,0,0,.6) transparent;
}

.btn-msg-left {
    top:0;
    right:32px;
}

.btn-msg-top {
    top:-100%;
}

.btn-msg-top::after {
    top:auto;
    bottom:-10px !important;
    border-color: rgba(0,0,0,.6) transparent transparent transparent;
}
.btn-msg-left::after {
    top:5px;
    right:-10px;
    border-color: transparent transparent transparent rgba(0,0,0,.6);
}
</style>
