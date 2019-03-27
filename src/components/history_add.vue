<template>
    <div class="message-box history-add" v-show="isshow">
        <div v-if="!subError">
            <p class="history-add-item"><input type="text" class="title-input" v-model="title" :placeholder="trans.historyAddPlaceholder" /><span @click="hide" class="icon-close"></span></p>
            <p class="history-add-item position-input">
                <label>X:</label><input v-model="lat" type="text" />
                <label class="bl">Y:</label><input v-model="lng" type="text" />
            </p>
            <div class="history-add-item position-input" style="border-top:none" @mouseleave="optionShow=false">
                <span class="label">{{trans.group}}:</span>
                <div class="input-box">
                    <input type="text" v-model="target" @click="optionShow=true"  />
                    <ul class="history-target-option" v-if="optionShow">
                        <li @click="target = index; optionShow = false" :key="index" v-for="(item,index) in history">{{index}}</li>
                    </ul>
                </div>
            </div>
            <p class="history-add-item position-from">
                <span :class="type == 1 ? 'icon-radio-checked' : 'icon-radio-unchecked'" @click="setPositionFromOrigin">{{trans.FromOrigin}}</span>

                <span v-if="$parent.clipboardText" ref="f_c_b" :class="type == 2 ? 'icon-radio-checked' : 'icon-radio-unchecked'" @click="setPositionFromClipBoard">{{trans.FromClipBoard}}</span>
                <span v-if="!$parent.clipboardText" ref="f_c_b" class="icon-radio-unchecked" style="color:#999">{{trans.FromClipBoard}}</span>
            </p>
            <p v-if="title=='' || lng=='' || lat=='' || target==''" class="history-add-item"><button style="background:#ccc;" class="controls history-add-save-btn">{{trans.confirmContent}}</button></p>
            <p v-if="title!='' && lng!='' && lat!='' && target!=''" class="history-add-item"><button class="controls history-add-save-btn" @click="save">{{trans.confirmContent}}</button></p>
        </div>

        <div v-if="subError">
            <p class="history-add-item"><label class="history-add-error-title">{{trans.historySaveErrorTitle}}</label><span @click="hide" class="icon-close"></span></p>
            <p class="history-add-error-message">{{trans.historySaveErrorMessage}}</p>
            <p class="history-add-item"><button class="controls history-add-save-btn" @click="subError=false">{{trans.confirmContent}}</button></p>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'history-add',
    data(){
        return {
            isshow:false,
            subError:false,
            title:"",
            lat:"",
            lng:"",
            target:"",
            isedit:false,
            optionShow:false,
            type:0
        }
    },
    computed: mapGetters(['history', 'trans']),
    methods: {
        show: function()
        {
            let _cur_position    = this.$parent.map.getCurMarket()
            let _input           = this.$parent.clipboardText
            this.isshow = true
            if(_input!="" && /^-*\d+\.\d+\,-*\d+\.\d+$/.test(_input))
            {
                _input = _input.replace(/\s/g,'')
                this.lat = _input.split(',')[0]
                this.lng = _input.split(',')[1]
                this.type = 2
            }else{
                this.lat = _cur_position.lat.toFixed(6)
                this.lng = _cur_position.lng.toFixed(6)
                this.type = 1
             }
        },
        hide: function()
        {
            this.subError = false
            this.isshow = false
            this.isedit = false
            this.title = ""
            this.lat = ""
            this.lng = ""
            this.type = 0
            this.target = ""
        },
        save: function()
        {
            const reg = /^-*\d+\.\d+$/
            if(!reg.test(this.lat) || !reg.test(this.lng) || '' == this.title || '' == this.target)
            {
                this.subError = true
            }else{
                if(false === this.isedit)
                {
                    //新增
                    this.$store.commit('addHistory',{
                        title:this.title,
                        target:this.target,
                        lat:this.lat,
                        lng:this.lng,
                        time:(new Date()).getTime()
                    })
                }else{
                    //编辑
                    this.$store.commit('editHistory',{
                        index:this.isedit,
                        title:this.title,
                        target:this.target,
                        oldTarget:this.oldTarget,
                        lat:this.lat,
                        lng:this.lng,
                        time:(new Date()).getTime()
                    })
                }
                this.hide()
            }
        },
        edit: function(obj)
        {
            this.title     = this.history[obj.target][obj.index].title
            this.lat       = this.history[obj.target][obj.index].lat
            this.lng       = this.history[obj.target][obj.index].lng
            this.oldTarget = obj.target
            this.target    = obj.target
            this.isshow    = true
            this.isedit    = obj.index
        },
        setPositionFromOrigin:function()
        {
            let _latlng = this.$parent.map.getCurMarket()
            this.lat = _latlng.lat.toFixed(6)
            this.lng = _latlng.lng.toFixed(6)
            this.type = 1
        },
        setPositionFromClipBoard:function()
        {
            if(this.$parent.clipboardText == '' || !/^[\.|,|\d|\-]+$/.test(this.$parent.clipboardText))
            {
                this.type=0
                return
            }else{
                let _pos = this.$parent.clipboardText.split(',')
                this.lat = parseFloat(_pos[0].trim()).toFixed(6)
                this.lng = parseFloat(_pos[1].trim()).toFixed(6)
                this.type = 2

            }
        }
    }
}
</script>