// pages/songDetail/songDetail.js
import regeneratorRuntime from '../../utils/runtime'
import request from '../../utils/request';
import PubSub from 'pubsub-js';
import {handleMusicTime, returnSecond} from '../../utils/utils';
  // 获取全局实例
  const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, // 音乐是否播放
    song: [], // 歌曲详情
    songUrl: [], // 歌曲Url
    musicId: '', // 音乐 id
    currentTime: '00:00', // 实时时间
    durationTime: '00:00', // 总时长
    currentWidth: 0, //进度条
  },

  // 点击播放/暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    let {musicId} = this.data;
    this.musicControl(isPlay,musicId);
  },
  // 控制音乐播放/暂停的功能函数
 async musicControl(isPlay, musicId) {
    if(isPlay) {// 音乐播放
      //获取音频资源
      let result = await request('/song/url',{id: musicId});
      let musicLink = result.data[0].url;
      // 创建控制音乐播放的实例
      this.backgroundAudoManager.src = musicLink;
      this.backgroundAudoManager.title = this.data.song.name
    } else {
      this.backgroundAudoManager.pause();
    }
  },
  // 封装修改播放状态的功能函数
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    appInstance.globalData.isMusicPlay = isPlay;
  },
  // 请求歌曲详情
  async getMusic(musicId) {
    let result = await request('/song/detail', {ids: musicId})
    console.log(result);
    let durationTime = handleMusicTime(result.songs[0].dt);
    this.setData({
      song: result.songs[0],
      durationTime
    })
        // 动态设置页面标题为歌曲名
        wx.setNavigationBarTitle({
          title: this.data.song.name,
        })
        // this.getMusicUrl(musicId);
  },
  // 请求歌曲url
  // async getMusicUrl(musicId) {
  //   let result = await request('/song/url', {id: musicId});
  //   console.log(result);
  //   this.setData({
  //     songUrl: result.data[0].url,
  //   })
  // },
  // 点击切歌的回调
  handleSwitch(event) {
    // 获取切歌的类型
    let type = event.currentTarget.id;
    // 订阅来自 recommend 页面发布的 musicId 消息
    // 监听musicIdGet事件，获取上一页面通过eventChannel传到当前页面的数据
    // this.eventChannel.on('musicIdGet', (data) => {
    //   console.log(data);
    // })
    // 关闭当前的音乐
    this.backgroundAudoManager.stop();
    //  订阅来自 recommend 页面发布的 songId
    PubSub.subscribe('getSongId', (msg, songId) => {
      console.log(songId);
      this.getMusic(songId);
      this.musicControl(true, songId);
      //取消订阅
      PubSub.unsubscribe('getSongId')
    })
        // 通知上一页，传回参数，响应函数
        PubSub.publish('switchType', type);
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    // options 用于接收路由器跳转的 query 参数
    let musicId = options.song;
    this.setData({
      musicId
    })
    console.log(musicId);
    this.getMusic(musicId);
    // this.getMusicUrl(musicId);
    /**
     * 问题：如果用户操作系统的控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
     * 解决：
     *  1、通过控制音频的实例去监视音乐播放/暂停
     */
    // 判断当前页面音乐是否在播放
      if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
        // 修改当前页面音乐播放状态为 true
        this.setData({
          isPlay: true
        })
      }
    this.backgroundAudoManager = wx.getBackgroundAudioManager();
    // 监控 音乐播放/暂停/停止
    this.backgroundAudoManager.onPlay(() => {
      // 修改音乐的状态
      this.changePlayState(true);
            // 修改全局音乐播放的状态(封装到功能函数里了)
            appInstance.globalData.musicId = musicId;
      
    })
    this.backgroundAudoManager.onPause(() => {
      this.changePlayState(false);
            // 修改全局音乐播放的状态
    })
    this.backgroundAudoManager.onStop(() => {
      this.changePlayState(false);
            // 修改全局音乐播放的状态      
    })
    // 监听音乐自然播放的回调
    this.backgroundAudoManager.onEnded(() => {
      // 自动切换至下一首音乐，并且自动播放
      PubSub.publish('switchType', 'next');
      // 将实时进度条的长度还原成0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    })
    // 监听音乐实时播放的进度
    this.backgroundAudoManager.onTimeUpdate(() => {
      // 格式化实时时间
      let currentTime = handleMusicTime(this.backgroundAudoManager.currentTime);
      let currentWidth = (this.backgroundAudoManager.currentTime / this.backgroundAudoManager.duration) * 450;
      this.setData({
        currentTime,
        currentWidth,
      });
    })
    // 测试原生页面通信
    // // 获取事件对象
    // this.eventChannel = this.getOpenerEventChannel();
    // // 监听switch事件，获取上一页面通过eventChannel传到当前页面的数据
    // this.eventChannel.on('switch', (data) => {
    //   console.log(data);
    // }) 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})