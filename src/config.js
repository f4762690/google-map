/*终端类型 */
window.osType = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1? 'android' :
                /mobile/i.test(window.navigator.userAgent) ? 'ios' :
                (navigator.userAgent.indexOf("AppleWebKit") > -1 && navigator.userAgent.indexOf("Chrome") < 1) ? 'mac' : 'pc'

/*开发环境配置*/
if('development' == process.env.NODE_ENV)
{
    window.google_api_key = "AIzaSyAl9lBC6XNYzMjTcYFS5kpNIZbZwjjYiF8"
    window.mapbox_api_key = "pk.eyJ1Ijoic2VhY2hlbiIsImEiOiJjamplMml1bjYyOWoyM3BwMng4YzFycXZyIn0.Lxr3o5jg7NVkhLoT7AVy1g"
    window.mapType = "google"
    window.TrialTime = 999999999
    window.subinfo.token = 'CDd1AvR9il9cG9nUvtzYGO+cLToWB7zxkRefwAS913tu2Z4OUZ7AkicpAb6e4nQafNV1KZ588n9ilQNtYHW3Pw=='
    window.subinfo.license = ''
}

