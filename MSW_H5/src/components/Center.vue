<template>
  <div class="myCenter">
    <div class="CBack">
      <div class="iconContent">
        <div class="icon">
          <img src="@/assets/img/myIcon.png" alt="" class="icon01">
          <div class="icon02">
            <img :src="imgUrl" alt="">
          </div>
        </div>
        <div class="iconTxt">
          <p>{{nickName}}</p>
        </div>
      </div>
    </div>
    <group class="Group">
      <cell title="个人中心" is-link link="/center/myinfo"></cell>
      <cell title="我的订单" is-link link="/center/myorder"></cell>
      <cell title="地址管理" is-link link="/center/mysite"></cell>
      <cell is-link link="/center/mymessage">
        <span slot="title"><span style="vertical-align:middle;">我的消息</span><badge :text="Badge" style="margin-left: 3px"
                                                                                  v-if="Badge != null"></badge></span>
      </cell>
      <cell title="问题反馈" is-link link="/center/feedback"></cell>
      <cell title="推荐码" :value="Invitation"></cell>
    </group>
  </div>
</template>

<script>
  import {Group, Cell, Badge} from 'vux'

  export default {
    name: "Center",
    data() {
      return {
        Invitation: '',
        Badge: null,
        imgUrl: localStorage.getItem('wxHeadImgUrl'),
        nickName: localStorage.getItem('wxNickName')
      }
    },
    components: {
      Group,
      Cell,
      Badge
    },
    mounted() {
      this.$http.get('/user/info').then(
        ({data}) => {
          if (data.code == 200) {
            let isBage = data.data.msgNumber
            if (isBage != '0') {
              this.Badge = isBage;
            }
            this.Invitation = data.data.shareCode;
          }
        }
      )
    }
  }
</script>

<style scoped>
  .myCenter {
    width: 100vw;
  }

  .CBack {
    background: #fff url(../assets/img/CBackgroud.png) right top / cover no-repeat;
    height: 20vh;
    width: 100vw;
    text-align: center;
    position: relative;
    top: 0;
    left: 0;
  }

  .iconContent {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    display: inline-block;
    text-align: center;
  }

  .icon {
    width: 11vh;
    height: 11vh;
    margin: 0 auto;
    overflow: hidden;
    position: relative;
    top: 0;
    left: 0;
  }

  .icon01 {
    position: absolute;
    top: 0;
    left: 0;
    width: 11vh;
    height: 11vh;
    z-index: 10;
  }

  .icon02 {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 9.8vh;
    height: 9.8vh;
    z-index: 9;
  }

  .icon02 img {
    width: 100%;
    height: 100%;
  }

  .iconTxt {
    margin-top: 1vh;
    color: #fff;
    font-size: 16px;
    letter-spacing: 2px;
    text-align: center;
  }

  .Group >>> .weui-cells {
    margin-top: 5px;
  }
</style>
