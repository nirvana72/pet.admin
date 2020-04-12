import axios from 'axios'
import store from '@/store'
import { MessageBox } from 'element-ui'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 5000
})

// request interceptor
service.interceptors.request.use(
  config => {
    config.headers['Admin'] = '1' // 后台BasicAuth 以此判断是否 admin加解密
    config.headers['ClientDevice'] = 'admin|0|0'
    if (store.getters.session.uid > 0) {
      config.headers['Authorization'] = 'Bearer ' + store.getters.session.token
      config.headers['ClientUid'] = store.getters.session.uid
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    // 此处统一提示失败信息 * 200状态下的， 非服务端abort 500错误
    if (response.data.ret && response.data.ret < 0) {
      MessageBox.alert(response.data.msg, '', { type: 'error' })
    }
    return response.data
  },
  async(error) => {
    // 非200状态
    // console.log(error.response.data)
    if (error.response.data.ret === -99) {
      // api -99 登录超时
      const refreshResponseResult = await axios.get(`${process.env.VUE_APP_BASE_API}/jwt/refresh`, { params: { refreshToken: store.getters.session.refreshtoken }})
      if (refreshResponseResult.data.ret < 0) {
        MessageBox.alert('登录信息过期,需要重新登录', '', { type: 'error' })
      } else {
        store.commit('setSession', refreshResponseResult.data)
        // console.log('重新登录完成，刷新本地token')
        // eslint-disable-next-line require-atomic-updates
        error.response.config.headers['Authorization'] = 'Bearer ' + store.getters.session.token
        // console.log('重新访问之前的请求')
        const result = await axios.request(error.response.config)
        if (result) {
          // console.log('重新访问之前的请求完成')
          return Promise.resolve(result)
        }
      }
    } else {
      // 统一弹出出错信息
      const err = `${error.response.status}|ret=${error.response.data.ret}:msg=${error.response.data.msg}`
      MessageBox.alert(err, '', { type: 'error' })
    }
    // console.log(error.response.data) // for debug
    return Promise.reject(error)
  }
)

export default service
