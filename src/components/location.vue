<template>
    <div class="less-location-select">
        <button v-if="!options" class="btn btn-white">Loading...</button>
        <button v-if="options" class="btn btn-white" @click="choose">Choose location<span class="icon-chevron-down"></span></button>
        <ul v-if="show" @mouseleave="show=false" >
            <li v-if="top != false">
                <span @click="setSecend(item)" v-for="(item,index) in top" :key="index">
                    <b>{{index}}</b>
                    <i v-if="undefined == item.lat" class="icon-chevron-right"></i>
                </span>
            </li>
            <li v-if="secend != false">
                <span @click="setLast(index,item)" v-for="(item,index) in secend" :key="index">
                    <b>{{index}}</b>
                    <i v-if="undefined == item.lat" class="icon-chevron-right"></i>
                </span>
            </li>
            <li v-if="last != false">
                <span @click="pushPoint(index,item)" v-for="(item,index) in last" :key="index">
                    <b>{{index}}</b>
                    <i v-if="undefined == item.lat" class="icon-chevron-right"></i>
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
        this.$http.get('http://vlocapi.thinkskysoft.com/api/v1/city/index').then((response)=>{
            console.log("response:"+response.data);
            this.options = response.data
            this.top = this.options
        })
    },
    methods:{
        choose:function(){
            this.show = this.show ? false : true
            this.secend = false
            this.last = false
        },
        setSecend:function(obj)
        {
            this.secend = obj
            this.last = false
        },
        setLast:function(key,val)
        {
            if(val.hasOwnProperty('lat'))
            {
                this.pushPoint(key,val)
            }else{
                this.last = val
            }
        },
        pushPoint:function(key,val)
        {
            this.chooseText = key
            val.city = key
            this.$emit('choose',val)
            this.show = false
        }
    }
}
</script>
