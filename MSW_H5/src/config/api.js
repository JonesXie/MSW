// import axios from "axios";
import {
  AjaxPlugin
} from 'vux';
import Vue from 'vue';
import store from './store';

Vue.use(AjaxPlugin);
// AjaxPlugin.$http.defaults.headers.common['wxOpenId'] = localStorage.getItem('wxOpenId');
AjaxPlugin.$http.interceptors.request.use((config) => { // 拦截器，发送请求之前做某件事
  config.headers.wxOpenId = localStorage.getItem('wxOpenId') || store.state.wxOpenId; // 设置极其关键
  config.headers.wxLat = sessionStorage.getItem('wxLat'); // 纬度
  config.headers.wxLng = sessionStorage.getItem('wxLng'); // 经度
  return config;
});

AjaxPlugin.$http.defaults.baseURL = '';
Vue.prototype.host = '';
