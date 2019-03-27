<template>
    <div class="history" v-show="isshow">


        <div class="history-wrap-right">
            <ul class="history-list">
                <li v-for="(item,index) in history"  class="icon-location">
                    <p @click="toHistory(index)">{{item.title}}</p>
                    <span @click="$emit('editHistory',index)" class="icon-pencil"></span>
                    <span @click="$emit('delHistory',index)" class="icon-bin"></span>
                </li>
                <li v-if="history.length <= 0"><p>&nbsp;&nbsp;&nbsp;&nbsp;{{trans.emptyHistoryMessage}}</p></li>
            </ul>

        </div>

    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'history',
    data(){
        return {
            isshow: false,
            leftshow:false,
            his:''
        }
    },
    computed:{
        ...mapGetters(['history', 'trans', 'historyTarget'])
    },
    methods:{
        show:function(){
            this.isshow = true
        },
        hide:function(){
            this.isshow = false
        },
        toHistory:function(index)
        {
            let latlng = this.$parent.latlng(this.history[index].lat,this.history[index].lng)
            this.$parent.go_to_point(latlng)
            this.hide()
        }
    }
}
</script>