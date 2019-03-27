<template>
<transition name="el-message-fade">
    <div id="subscribe" v-show="isshow">
        <div class="less-message-box">
            <div class="less-message-box-title"><p>{{trans.subscribe_tit}}</p><span @click="hide" class="icon-close"></span></div>
            <p class="subscribe-des">{{trans.subscribe_message}}</p>
            <p><label>Key1</label></p>
            <p class="input-wrap"><input type="text" v-model="key1" :placeholder="trans.subscribe_input_msg" /></p>
            <p><label>key2</label></p>
            <p class="input-wrap"><textarea v-model="key2"></textarea></p>
            <p class="input-wrap text-center"><a href="#">{{trans.subscribe_link}}</a></p>
            <p class="input-wrap subscribe-btn-group">
                <button @click="subscribe" class="btn btn-default">{{trans.subscribe_subscribe}}</button>
                <button @click="activate" :style="verify ? '' : 'background-color:#ccc'" class="btn btn-default">{{trans.subscribe_active}}</button>
            </p>
        </div>
    </div>
</transition>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
    name: 'subscribe',
    data(){
        return {
            isshow:false,
            key1:'',
            key2:'',
            verify:false
        }
    },
    watch:{
        key1:function(val){
            if(val == '' || this.key2 == '')
            {
                this.verify = false
            }else{
                this.verify = true
            }
        },
        key2:function(val){
            if(val == '' || this.key1 == '')
            {
                this.verify = false
            }else{
                this.verify = true
            }
        }
    },
    computed:{
        ...mapGetters(['pc_uid', 'shellVersion', 'pc_host', 'sub_product_url', 'trans'])
    },
    methods: {
        show:function(){
            this.isshow = true
        },
        hide:function(){
            this.isshow = false
        },
        subscribe:function(){
            openurl(this.sub_product_url)
        },
        /**
         * ### 1. 注册码验证
[POST] http://127.0.0.1:8081/register/verify  
Post data为json格式 json内需要有以下内容
```
{
    "p": 35,    # PlatformId
    "l": l,     # LangId
    "v": 4410,  # VersionId
    "i": "XXXXX",   # Machine Unique Id
    "key1": "XXX-YYY-ZZZ"   # Key1
    "key2": "jYHE4oFx4ySzWoW..."    # Key2
    "prodname": "itools4win"    # 必须有，并且不同产品不能混用，测试产品该值可设置为"tstestprod"
    "host": "电脑名",
}
```
返回值：
```
{
    "verified": 1,   # -1 授权失败，1 授权有效
    "err": "失败的原因提示字符串"
    "time": 服务器时间戳
    "info": {  # verified为1时返回的license信息
        "upgrade_url": 升级的url,当用户的license可以升级时返回这个 
         "email":   用户email
         "license":  license类型,如Premium
         "verified_pc": 已经绑定的PC数
         "expires_at": 过期时间,永久则为null 时间戳
         "validates_at": 生效时间, 永久为null 时间戳
    }
}
         */
        activate:function(){
            if(!this.verify)
            {
                return 
            }

            this.$http.post('https://api-test.thinkskysoft.com/register/verify',{
                "p": 35,//    # PlatformId
                "l": 'l',//     # LangId
                "v": this.shellVersion,//  # VersionId
                "i": this.pc_uid,//   # Machine Unique Id
                "key1": this.key1,//   # Key1
                "key2": this.key2,//    # Key2
                "prodname": "itoolswinvl",//    # 必须有，并且不同产品不能混用，测试产品该值可设置为"tstestprod"
                "host": this.pc_host,
            }).then((response)=>{
                if(response.data.verified == 1){
                    this.$alert({
                        'title':this.trans.subscribe_success,
                        'content':this.trans.subscribe_success_content,
                        'btns':[trans.gotit]
                    },()=>{
                        window.location.reload()
                    })
                }else{
                    this.$alert({
                    'title':'fail',
                    'content':response.data.err,
                    'btns':[trans.gotit]
                })
                }
            }).catch(error=>{
                this.$alert({
                    'title':this.trans.subscribe_fail,
                    'content':this.trans.subscribe_fail_content,
                    'btns':[trans.gotit]
                })
            })
        }
    }
}
</script>
