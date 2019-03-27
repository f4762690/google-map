<template>
    <div class="round_svg" 
    @click="clickEventHandler"
    :style="{width:sizePX,height:sizePX}">
        <svg v-if="!active" :width="sizePX" :height="sizePX" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle :cx="size/2" :cy="size/2" r="10" stroke="#00aeff" opacity="0.4" stroke-width="1" fill="#009cff" />
        </svg>
        <svg :width="sizePX" v-if="active" :height="sizePX" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle :cx="size/2" :cy="size/2" :r="size/2" stroke="#00aeff" opacity="0.2" stroke-width="1" fill="#009cff" />
            <circle :cx="size/2" :cy="size/2" :r="size" stroke="#00aeff" opacity="0.2" stroke-width="1" fill="#009cff">
                <animate attributeName="r" begin="0s" dur="2s" from="1" :to="size/2" repeatCount="indefinite"/>
                <animate attributeName="opacity" begin="0s" dur="2s" from="0.4" to="0" repeatCount="indefinite"/>
            </circle>
        </svg>
    </div>
</template>


<script>
export default {
    name: 'round_svg',
    data(){
        return {
            active: false,
            size: 30
        }
    },

    computed: {
        sizePX: function(){
            return this.size + 'px'
        },
        x: function(){
            return this.mapcenterXY.x - this.size/2 + 'px'
        },
        y: function(){
            return this.mapcenterXY.y - this.size/2 + 'px'
        }
    },

    methods: {
        clickEventHandler: function(e){
            console.log(this.$el.parentElement.click())
        },

        setActive: function(bool){
            this.active = !!bool
        },

        setSize: function(number){
            this.size = number
        }
    }
}
</script>
<style lang="less" scoped>
  .round_svg {
    position:absolute;
    pointer-events:none;
  }
</style>
