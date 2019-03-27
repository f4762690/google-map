/**
 * ===============================================
 *             解析文本为坐标点历史记录
 * ================================================
 */


/**
 *
 * 第一种格式
 &Memorandum   （ '&'后面是文件夹名称，当无此标识时文件夹名称默认为：Memorandum，在检测到下一‘&’符号之前的坐标点都保存到该文件夹中）
 #name          （'#'后面是为坐标点名称，必填，否则会忽略该坐标。下一行是坐标点，必填，否则忽略该坐标）
 31.898355,131.4461
 #name
 31.898355,131.4461
 #name
 31.898355,131.4461
 #name
 31.898355,131.4461
 #name
 31.898355,131.4461

 &test          （第二个文件夹名称）
 #name
 31.898355,131.4461
 #name
 31.898355,131.4461
 * @param {String} res
 */
import gps from './Gps'
const decodeFormat_1 = function(res){
  //分析内容
  let _group_reg = /(&[^&]*)/ig
  let _group = res.match(_group_reg)
  let _his_obj = {}

  if(_group.length > 0){
    _group.map(item => {
      let _target = /&([^\s]*)/.exec(item)

      //如果没有标签则默认为default
      _target = !!_target ? _target[0].replace(/[&|\s]/g,'') : 'Memorandum'
      _target = _target == '' ? 'Memorandum' : _target
      let _his = item.match(/(#[^#]*)/ig)
      let _obj = []
      _his.map(item => {
        let __p_item = item.split(/\s/)
        if(__p_item.length>=2){
          let _gps = gps.strTogps(__p_item[1])
          let _title = __p_item[0].replace(/[#|\s]/g,'')

          if(_gps){
            _obj.push({
              title: _title == '' ? 'notitle' : _title,
              point: __p_item[1],
              target:_target,
              time:(new Date()).getTime(),
              checked:true,
              ..._gps
            })
          }
        }
      })

      if(!!_his_obj[_target]){
        _his_obj[_target].push(..._obj)
      }else{
        _his_obj[_target] = _obj
      }
    })
  }
  return _his_obj
}


/**
 * 第二种格式：导入文件夹Memorandum,当坐标后面没有坐标名称时忽略该坐标点
 * （坐标,t1是坐标点名称）
 31.898355,131.4461,t1
 31.898355,131.4461,t2
 31.898355,131.4461,t3
 */
const decodeFormat_2 = function(res){
  let __arr = res.split(/\s/)
  let _his_obj = {'Memorandum':[]}
  __arr = __arr.filter( res => {
    res = res.replace(/\s/g,'')
    if(res == ''){
      return false
    }

    if(!/[-]{0,1}\d+\.\d+,[-]{0,1}\d+.\d+,.*/.test(res)){
      return false
    }

    return true
  })
  _his_obj.Memorandum = __arr.map(item=>{
    let _arr = item.split(',')
    return {
      title: _arr[2] == "" ? 'notitle' : _arr[2],
      target:'Memorandum',
      time:(new Date()).getTime(),
      point:`${_arr[0]},${_arr[1]}`,
      checked:true,
      lat:_arr[0],
      lng:_arr[1]
    }
  })

  return _his_obj
}


export default function(res){
  if(/&/.test(res)){
    return decodeFormat_1(res)
  }else{
    return decodeFormat_2(res)
  }
}
