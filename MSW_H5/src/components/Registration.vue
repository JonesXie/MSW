<template>
  <div class="myRegister">
    <x-header title="绑定手机号" :left-options="{showBack: false}" class="header"></x-header>
    <group class="register_input">
      <x-input placeholder="请输入手机号" mask="99999999999" v-model="phone" :max=11 is-type="china-mobile"
               ref="mobile" required>
        <p slot="right" style="color: #ff0000;display: inline-block;font-size: 14px">可用于登录</p>
      </x-input>
      <x-input placeholder="请输入验证码" :is-type="verification" v-model="code">
        <x-button slot="right" type="primary" mini @click.native="getCode" :disabled="getCodeState">
          {{getCodeName}}
        </x-button>
      </x-input>
      <selector v-if="userFlag=='newUser'" title="用户类型" direction="rtl" v-model="userType"
                :options="typeList"></selector>
      <x-address v-if="userFlag=='newUser'" title="所在地" v-model="getCity" :list="addressData" placeholder="请选择所在地"
                 @on-shadow-change="addressChoose" :hide-district=true></x-address>
      <x-input placeholder="请输入密码" v-if="userFlag=='newUser'" type="password" v-model="password">
        <!--<img src="@/assets/img/EyeClose.png" slot="right" alt="" @click='changeEye' style="height: 14px; width: auto;"-->
        <!--v-if="eyeShow=='close'">-->
        <!--<img src="@/assets/img/EyeOpen.png" slot="right" alt="" @click='changeEye' style="height: 14px; width: auto;"-->
        <!--v-else>-->
      </x-input>
      <x-input placeholder="再次输入密码" v-if="userFlag=='newUser'" type="password" :is-type="invalidPW" v-model="rePassword"
               ref="rePW"></x-input>
      <x-input placeholder="请输入邀请码" novalidate v-model="shareMem"></x-input>
    </group>
    <x-button type="primary" class="submit_btn" :disabled="subBtn" @click.native="submit">立即绑定</x-button>
  </div>
</template>

<script>
  import {XHeader, XButton, XInput, Group, Selector, XAddress, ChinaAddressV4Data,} from 'vux'
  import qs from 'qs';
  export default {
    name: "Registration",
    data() {
      return {
        phone: '',
        shareMem: '',
        code: '',
        validCode: '',
        province: '',
        city: '',
        getCodeName: '获取验证码',
        getCodeState: false,
        // isValid: false,
        isUser: true,
        userFlag: 'oldUser',
        password: null,
        rePassword: '',
        userType: null,
        subBtn: false,
        // eyeShow: 'close',
        // pwdType: 'password',
        pwValid: false,
        typeList: [],
        getCity: [],
        addressData: ChinaAddressV4Data,
      }
    },
    components: {
      XHeader,
      XButton,
      XInput,
      Group,
      Selector,
      XAddress,
      ChinaAddressV4Data,
    },
    methods: {
      verification(value) {
        let that = this;
        return {
          valid: value == that.validCode,
          msg: '验证码错误'
        }
      },
      invalidPW(value) {
        let that = this;
        return {
          valid: value == that.password,
          msg: '两次密码不一致'
        }
      },
      // changeEye() {
      //   this.pwdType = this.pwdType === 'password' ? 'text' : 'password';
      //   this.eyeShow = this.eyeShow === 'open' ? 'close' : 'open';
      // },
      addressChoose(ids, names) {
        this.province = ids[0];
        this.city = ids[1];
        // this.getData.addressName = names.join('-')
      },
      getCode() {
        let that = this;
        if (this.$refs.mobile.valid) {
          this.getCodeState = true;
          let timer = 60;
          let interval = setInterval(() => {
            timer = timer - 1;
            that.getCodeName = `${timer}秒后重试`;
            if (timer == 0) {
              clearInterval(interval);
              that.getCodeState = false;
              that.getCodeName = '获取验证码'
            }
          }, 1000);
          this.$http.get('/security/sms?phoneNum=' + this.phone).then(
            ({data}) => {
              if (data.code == 200) {
                this.$vux.toast.show({
                  text: '短信发送成功',
                  position: 'center',
                  type: 'success',
                  width: '9em'
                })
                let codeArr = data.data.code.split(',');
                let getCode = '';
                for (let i = 0; i < codeArr.length; i++) {
                  getCode += (codeArr[i].length - 1).toString();
                }
                this.validCode = getCode;
                // this.isValid = true;
                this.userFlag = data.data.userFlag;
                if (data.data.userFlag == 'newUser') {
                  this.isUser = false;
                  this.pwValid = true;
                  this.$http.get('valida/getUserType').then(
                    ({data}) => {
                      if (data.code == 200) {
                        this.typeList = data.data
                      }
                    })
                }
              } else {
                this.$vux.toast.show({
                  text: '出现一点问题，请稍后重试',
                  position: 'center',
                  type: 'text',
                  width: '14em',
                  time: '3000'
                });
              }
            }
          )
        } else {
          this.$vux.toast.show({
            text: '请先填写手机号',
            position: 'center',
            type: 'warn',
            width: '9em',
            time: '3000'
          });
        }
      },
      utf16toEntities(str) {
        str = str.replace(/[\ud800-\udbff][\udc00-\udfff]/g, function (char) {
          // let H, L, code;
          if (char.length === 2) {
            // H = char.charCodeAt(0); // 取出高位
            // L = char.charCodeAt(1); // 取出低位
            // code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法
            // return "&#" + code + ";";
            return ""
          } else {
            return char;
          }
        });// 检测utf16字符正则
        return str;
      },
      submit() {
        this.subBtn = true;
        if (this.code == this.validCode && this.validCode != '') {//验证验证码
          if (this.pwValid) {//是否验证两次密码
            if (this.password == this.rePassword) {
              this.pushData();
            } else {
              this.subBtn = false;
              this.$vux.toast.show({
                text: '两次密码不一致',
                position: 'center',
                type: 'warn',
                width: '9em',
                time: '3000'
              });
            }
          } else {
            this.pushData();
          }
        } else {
          this.subBtn = false;
          this.$vux.toast.show({
            text: '请先进行手机验证',
            position: 'center',
            type: 'warn',
            width: '9em',
            time: '3000'
          });
        }
      },
      pushData() {
        if (!this.isUser) {
          if (this.password != null && this.userType != null && this.getCity.length > 0) {
            this.isUser = true;
          }
        }
        if (this.isUser) {
          let _data = {
            wxOpenId: this.$store.state.wxOpenId,
            wxNickName: this.utf16toEntities(this.$store.state.wxNickName),
            // wxNickName: this.$store.state.wxNickName,
            wxSex: this.$store.state.wxSex,
            wxHeadImgUrl: this.$store.state.wxHeadImgUrl,
            phone: this.phone,
            shareMem: this.shareMem,
            password: this.password,
            userFlag: this.userFlag,
            userType: this.userType,
            province: this.province,
            city: this.city,
          };
          this.$http.post('/valida/bindPhone', qs.stringify(_data)).then(
            ({data}) => {
              if (data.code == 200) {
                localStorage.setItem('wxNickName', this.$store.state.wxNickName);
                localStorage.setItem('wxOpenId', this.$store.state.wxOpenId);
                localStorage.setItem('wxSex', this.$store.state.wxSex);
                localStorage.setItem('wxHeadImgUrl', this.$store.state.wxHeadImgUrl);
                this.$store.commit('setTabbar', true);
                this.$store.commit('setBindPhone', false);
                this.$vux.toast.show({
                  text: '绑定成功',
                  position: 'center',
                  type: 'success',
                });
                this.$router.replace({path: '/index'});
              } else {
                this.subBtn = false;
                this.$vux.toast.show({
                  text: '出现一点问题，请稍后重试',
                  position: 'center',
                  type: 'text',
                  width: '14em',
                  time: '3000'
                });
              }
            }
          )
        } else {
          this.subBtn = false;
          this.$vux.toast.show({
            text: '请完整填写表格',
            position: 'center',
            type: 'warn',
            width: '9em',
            time: '3000'
          });
        }
      }
    },
    mounted() {
      this.$store.commit('setInImg', false);
      sessionStorage.setItem('hideIMG', 'isHide')
      this.$vux.toast.show({
        text: '<p>请绑定手机号</p>',
        position: 'center',
        type: 'text',
        width: '9em',
        time: '3000'
      });
    }
  }
</script>

<style scoped>
  .myRegister {
    width: 100vw;
    position: relative;
    top: 0;
    left: 0;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    z-index: 10;
  }

  .vux-header {
    background-color: #fff;
  }

  .vux-header >>> .vux-header-title {
    color: #333333;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .register_input {
    margin-top: 48px;
    width: 100vw;
    background-color: #fff;
  }

  .submit_btn {
    margin-top: 20px;
    width: 60%;
    text-align: center;
  }

  .register_logo {
    margin-top: 50px;
    height: 15vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .register_logo_div {
    text-align: center;
    height: 13vh;
  }

  .register_logo_div img {
    height: 80%;
    width: auto;
  }

  .register_logo_div p {
    margin-top: 10px;
    letter-spacing: 6px;
    padding: 1px 0;
  }
</style>
