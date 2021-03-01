import XLSX from 'xlsx'/** * 1、 String.fromCharCode(65 + i) + 1 :             A1,B1,C1.... * 2、 String.fromCharCode(65 + j) + (i + 2)         A2,B2,C2... *                                                   A3,B3,C3... * 测试： *  const headers = [{ key: 'date', title: '日期' }, { key: 'name', title: '名称' }] *  const  data = [{ date: '2019-05-31', name: 'megen.huang' }, { date: '2019-06-20', name: '小明' }] *  console.log(exportJsonToExcel(headers, data)) * 使用xlsx插件将json数据导出到Excel中----针对表格数据 * @param {Array} headers 表头:[{key: 'date', title: '日期'}, {key: 'name', title: '名称'}] * @param {Array} data 表体数据:[{date: '2019-05-31', name: 'megen.huang'}, {date: '2019-06-20', name: '小明'}] * @param {String} fileName 导出的文件名称 :'export.xlsx' */export function exportJsonToExcel (headers = [], data = [], fileName = 'export.xlsx') {// 先处理数据  data = handleCSV(data);  const _headers = headers    .map((item, i) => Object.assign({}, { key: item.key, title: item.title, position: String.fromCharCode(65 + i) + 1 }))    .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { key: next.key, v: next.title }}), {});  const _data = data  // 二维数组    .map((item, i) => headers.map((key, j) => Object.assign({}, { content: item[key.key], position: String.fromCharCode(65 + j) + (i + 2) })))    // 二维转一维    .reduce((prev, next) =>  prev.concat(next))    // 转成worksheet需要的数据结构    .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.content }}), {});  // 合并 headers 和 data  const output = Object.assign({}, _headers, _data);  console.log('output', output);  // 获取所有单元格的位置  const outputPos = Object.keys(output);  // 计算出范围 ,["A1",..., "H2"]  const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;  console.log('ref', ref);  // 构建 workbook 对象  const wb = {    SheetNames: ['mySheet'],    Sheets: {      mySheet: Object.assign(        {},        output,        {          '!ref': ref,          '!cols': headers.map(item => ({ wpx: 120 }))// width in screen pixels        }      )    }  };  // 导出 Excel  XLSX.writeFile(wb, fileName)}// 防止CSV注入处理export function handleCSV (arr) {  const reg = new RegExp('(^=|^-)');  if (Array.isArray(arr) && arr.length > 0) {    for (const item of arr) {      Object.keys(item).forEach(key => {        if (item[key] && reg.test(item[key])) {          item[key] = '\'' + item[key]        }      })    }  }  return arr}/** * 日期格式转换 * `第一个参数为传入的以毫秒为单位的时间戳，第二个参数为格式，具体说明见代码; * 不传参则返回当前日期，则为“'yyyy年MM月dd日'”格式显示.` * @param {object} _date 日期 * @param {string} _format 转换后的日期格式 * @return {string} * @return {string} */export function FormatDate (_date, _format) {  if (_format && !_date) {    return ''  }  var date = _date || new Date();  var format = _format || 'yyyy/MM/dd';  date = new Date(_date);  var map = {    M: date.getMonth() + 1, // 月份    d: date.getDate(), // 日    h: date.getHours(), // 小时    m: date.getMinutes(), // 分    s: date.getSeconds(), // 秒    q: Math.floor((date.getMonth() + 3) / 3), // 季度    S: date.getMilliseconds() // 毫秒  };  format = format.replace(/([yMdhmsqS])+/g, function (all, t) {    var v = map[t];    if (v !== undefined) {      if (all.length > 1) {        v = '0' + v;        v = v.substr(v.length - 2)      }      return v    } else if (t === 'y') {      return (date.getFullYear() + '').substr(4 - all.length)    }    return all  });  return format}