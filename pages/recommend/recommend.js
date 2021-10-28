// pages/recommend/recommend.js
import regeneratorRuntime from '../../utils/runtime'
import request from '../../utils/request'
import PubSub from 'pubsub-js';
  // 获取全局实例
  const appInstance = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    year: '',
    month: '',
    day: '',
    dailySongsList: [],//每日推荐歌曲数据
    index: 0, // 点击音乐的下标，初始化为0
    musicId: '',
  },
  // 获取每日推荐歌曲
  async getRecommend() {
    let recommendData = await request('/recommend/songs');
    console.log(recommendData);
    this.setData({
      dailySongsList: recommendData.data.dailySongs,
    })
    appInstance.globalData.dailySongsList = recommendData.data.dailySongs;
  },
  // 跳转至 songDetail 页面
  toSongDetail(event) {
    console.log(event);
    let songId = event.currentTarget.dataset.song.privilege.id;
    let index = event.currentTarget.dataset.index;
    this.setData({
      index
    })
    // 路由跳转传参: query 参数
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?song=' + songId,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 更新日期的状态数据
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    })
    // 获取每日推荐数据
    this.getRecommend();
    // 订阅来自 SongDeatail 页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      let {dailySongsList, index} = this.data;
      if(type === 'pre') {// 上一首
        (index === 0) && (index = dailySongsList.length - 1);
        index -= 1;
      } else {// 下一首
        (index === dailySongsList.length - 1) && (index = -1);
        index += 1;
      }
      let songId = dailySongsList[index].id;
      this.setData({
        index
      })
      // 将 songId 回传给 songDetail 页面
      PubSub.publish('getSongId', songId)
    })
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