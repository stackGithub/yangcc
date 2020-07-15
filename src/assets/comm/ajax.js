import axios from 'axios'
import setup from './setup.js'
import util from './util.js'
import store from '../../store.js'
import qs from 'qs'
import { Message, Loading } from 'element-ui'
// 在config.js文件中统一存放一些公共常量，方便之后维护
// import { baseURL } from './config.js'
var fullLoading
// var baseURL = 'http://cs-mj.iyuhong.com.cn:4235/mobile/malogin/formLogin.mob?username=18310600096&sms=9999';
// var baseURL = window.location.host || ''
var baseURL = '';
// 添加请求拦截器，在发送请求之前做些什么(**具体查看axios文档**)--------------------------------------------
axios.interceptors.request.use((config) => {
  // 显示loading
  fullLoading = Loading.service()
  util.log(config);
  return config;
}, (error)=> {
  // 请求错误时弹框提示，或做些其他事
  return Promise.reject(error)
})

// 添加响应拦截器(**具体查看axios文档**)----------------------------------------------------------------
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么，允许在数据返回客户端前，修改响应的数据
  util.log(response)
  // 如果只需要返回体中数据，则如下，如果需要全部，则 return response 即可
  return response.data
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})

// 封装数据返回失败提示函数---------------------------------------------------------------------------
function errorState (response) {
  // 隐藏loading
  try {
    fullLoading.close()
  }catch (e) {

  }
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    // 如果不需要除了data之外的数据，可以直接 return response.data
    return response
  } else {
    Message.error('数据获取错误')
  }
}

// 封装数据返回成功提示函数---------------------------------------------------------------------------
function successState (res) {
  // 隐藏loading
  fullLoading.close()
  // 统一判断后端返回的错误码(错误码与后台协商而定)
  // if (res.data.code === '000000') {
  Message({
    message: 'success',
    type: 'success'
  })
  return res
  // }
}

// 封装axios--------------------------------------------------------------------------------------
function apiAxios (method, url, data, headers, success, error) {
  if(!setup.cc.ajax){return;}
  if(!store.state.auth.cc){
    errorState()
    Message.error('权限失效')
    return;
  }
  if(store.state.auth.cc){
    data = Object.assign({'auth':'cc'},data);
  }
  let httpDefault = {
    method: method,
    baseURL: baseURL,
    url: url,
    headers: headers || {},
    // `params` 是即将与请求一起发送的 URL 参数
    // `data` 是作为请求主体被发送的数据
    params: method === 'GET' || method === 'DELETE' ? data : null,
    data: data,
    timeout: 100000
  }

  // 注意**Promise**使用(Promise首字母大写)
  return new Promise((resolve, reject) => {
    axios(httpDefault).then((res) => {
      // 登录是否过期
      successState(res)
      if (success)success(res)
      resolve(res)
    }).catch((response) => {
      errorState(response)
      if (error)error(response)
      reject(response)
    })
  })
}

let ajax = {
  get: (url, data, header, success, error) => {
    if (header instanceof Function) {
      error = success
      success = header
    }
    header = Object.assign({"Content-Type": "application/json"}, header)
    return apiAxios('GET', url, data, header, success, error)
  },
  post: (url, data, header, success, error) => {
    if (header instanceof Function) {
      error = success
      success = header
    }
    header = Object.assign({"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"}, header)
    return apiAxios('POST', url, data, header, success, error)
  },
  postform (url, data, header, success, error) {
    if (header instanceof Function) {
      error = success
      success = header
    }
    header = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, header)
    return apiAxios('POST', url, data, header, success, error)
  }
}

export default { ...ajax }

// 输出函数getAxios、postAxios、putAxios、delectAxios，供其他文件调用-----------------------------
// Vue.js的插件应当有一个公开方法 install。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
// export default {
//   install: function (Vue) {
//     Vue.prototype.getAxios = (url, params) => apiAxios('GET', url, params)
//     Vue.prototype.postAxios = (url, params) => apiAxios('POST', url, params)
//     Vue.prototype.putAxios = (url, params) => apiAxios('PUT', url, params)
//     Vue.prototype.delectAxios = (url, params) => apiAxios('DELECT', url, params)
//   }
// }
