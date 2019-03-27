<template>
    <div>
        <div class="update">
            <div>
                <h1>Notice</h1>
                <p class="content">The virtual location has been launched new version that won’t work with versions lower than 4.3.6.8 of iTools. If you want to use the feature , please download the latest version from our official website: <a class="btn" href="javascript:void(0)" @click="open('https://api.thinkskysoft.com/dl/?p=itools4win')">https://www.thinkskysoft.com/itools.</a> Moreover, we encourage you to use our official iTools that protect your privacy and data security.</p>
            </div>

            <div>
                <h1>Updated Logs</h1>
                <ol class="content">
                    <li>100iv Feeds Push</li>
                    <li>Fix the issue of adding new coords in GPX</li>
                </ol>
            </div>
        </div>
        <p class="tc btn-groups"><a class="btn" href="javascript:void(0)" @click="open('https://api.thinkskysoft.com/dl/?p=itools4win')">Upgrade Now</a> <span style="color:#999">or</span> <a class="btn" href="javascript:void(0)" @click="open('https://drive.google.com/file/d/1YaFqIwj0wfFn6yymZ__7kMVWRSaAPSeI/view?usp=sharing')">Google Drive</a></p>
    </div>
</template>

<script>
export default {
    name:'update',
    methods:{
        open:function(url)
        {
            window.NewWindow(url);
        }
    }
}
</script>

<style>
.update {
    display: flex;
}
h1 {color:#3a97e5; text-align: center; margin-bottom: 20px; font-size: 24px;}
ol{list-style-type:none;counter-reset:sectioncounter;}
.content { font-size: 14px; color:#333; line-height: 2; }
ol li:before {
    content:counter(sectioncounter) ". ";
    font-weight: bolder;
    counter-increment:sectioncounter;
 }
 .tc {text-align: center;}
.update div {
    flex:1;
    border:1px solid #ccc;
    margin:20px;
    padding:15px;
}
.update div:last-child {
    margin-left:0;
}
.btn {
    font-family: Roboto;
    font-size: 18px;
    font-weight: 300;
    padding: 0 1.5em;
    height: 35px;
    line-height: 35px;
    border-radius: 3px;
}
.btn-groups a {
    display: inline-block;
    background:#3a97e5;
    color:#fff;
    text-decoration: none;
    margin-top: 10px;
}
.btn-groups a:hover {
    background:#2e88d3;
}
a {
    font-size: 14px;
    color:#3a97e5;
}
</style>
