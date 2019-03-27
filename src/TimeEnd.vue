<!--
    时长结束后页面
-->
<template>
    <div class="timeend">
        <p v-if="msgshow">{{trans.restartForNormal}}</p>
    </div>
</template>

<script>
  if(!window.hasOwnProperty('openurl')){
    window.openurl = function(url){
      if(!(url instanceof String) && !/^http.*$/.test(url)){
        console.error('[mac api:openurl] the params must be url string')
      }
      try{
        if(window.osType == 'mac'){
          window.external.NewWindow(url)
        }else{
          window.NewWindow(url)
        }
      }catch(e){
        console.error(e)
      }
    }
  }


  import { mapGetters } from 'vuex'
export default {
    name:'timeend',
    data(){
        return {
            msgshow:false,
            messageID:null
        }
    },
    computed:{
        ...mapGetters(['trans','TrialTime'])
    },
    watch:{
        TrialTime:function(val)
        {
            if(val > 0)
            {
                this.$router.push({path:'/'})
                if(this.messageID != null)
                {
                    this.$alert.close(this.messageID)
                }
            }
        },
    },
    mounted:function(){

        this.messageID = this.$alert({
                'title':'Notice',
                'content':'<p>Sorry, your free trial-time has been used up.</p>'+
                          '<p>Please browse the subscrption page:</p>'+
                          '<p><a href="https://www.thinkskysoft.com/itools-store">https://www.thinkskysoft.com/itools-store</a></p>'+
                          '<p>and subsribe the right one for you.</p>'+
                          '<p>If you have any question, contact us via:</p>'+
                          '<p><a href="https://www.thinkskysoft.com/submit-request/">https://www.thinkskysoft.com/submit-request/</a></p>',
                'btns':['Quit']},
                ()=>{
                    this.$gps.NativeStopSimulation()
                    this.msgshow=true
                })
        if(this.TrialTime > 0)
        {
            this.$router.push({path:'/'})
            if(this.messageID != null){
                this.$alert.close(this.messageID)
            }
        }
    }
}
</script>

<style>
.timeend { height: 100%; display: flex; align-items: center;  justify-content:center;}
.timeend p { text-align: center;  padding:10%; color:#999;}
</style>
