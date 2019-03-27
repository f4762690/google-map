<template>
    <div class="less-location-select">
        <button v-if="!options" class="btn btn-white">Loading...</button>
        <button v-if="options" class="btn btn-white" @click="show = show ? false : true">{{ chooseText=='' ? 'Choose Author' : chooseText }}<span class="icon-chevron-down"></span></button>
        <ul v-if="show" @mouseleave="show=false" >
            <li v-if="options != false">
                <span @click="choose(item)" v-for="(item,index) in options" :key="index">
                    <b>{{item}}</b>
                </span>
            </li>
        </ul>
    </div>
</template>


<script>
export default {
    name: 'location',
    data(){
        return {
            options:false,
            top:false,
            secend:false,
            last:false,
            show:false,
            chooseText:''
        }
    },
    mounted:function(){
        this.$http.get('http://vlocapi.thinkskysoft.com/api/v1/player/maker').then((response)=>{
            if(response.data.status == true)
            {
                this.options = ['itools',...response.data.data]
            }else{
                this.options = ['itools']
            }
        }).catch((error)=>{
            this.options = ['itools']
        })
    },
    methods:{
        choose:function(item){
            this.show = this.show ? false : true
            this.chooseText = item
        }
    }
}
</script>
