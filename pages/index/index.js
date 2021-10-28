// pages/index/index.js
import regeneratorRuntime from '../../utils/runtime'
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**轮播图数据存放 */
    bannerList: {},
    /**推荐数据存放 */
    recommendList: {},
    /**排行榜数据存放 */
    topList: [],
    /**排行榜榜单歌曲存放 */
    topListMusic: [],
  },
  // 跳转至每日挸页面
  toRecommend() {
    wx.navigateTo({
      url: '/pages/recommend/recommend',
    })
  },
  // 跳转至搜索页面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    /** 网络请求-轮播图 */
   let bannerData = await request('/banner', {type: 2});
   console.log(bannerData);
   this.setData({
     bannerList: bannerData.banners,
   })
   console.log(this.data.bannerList);

   /**网络请求-推荐歌曲 */
   let recommendData = await request('/personalized', {limit: 10});
   console.log(recommendData);
   this.setData({
     recommendList: recommendData.result,
   })

   /**网络请求-排行榜榜单 */
   let topListData = await request('/toplist');
   console.log(topListData);
   topListData = topListData.list.slice(0,5);
   let topListItem = [];
   for(let i in topListData) {
    topListItem.push({name: topListData[i].name, id: topListData[i].id});
   }
   console.log(topListData);
   console.log(topListItem);

     for(let i in topListItem) {
       /**根据歌单id请求歌单歌曲，截取前三首然后合并到数组中 */
      let topListMusic = await request('/playlist/detail', {id: topListItem[i].id});
      topListMusic = topListMusic.playlist.tracks.splice(0, 3);
      /**新增一个属性 tracks 用来放歌单歌曲 */
      topListItem[i].tracks = topListMusic; 
      /**更新 topList 的状态值，如果放在循环外会导致发送请求的过程中页面长时间白屏，用户体验差 
       * 放在循环体里面不需要等待五次请求全部结束才更新，用户体验较好，但是渲染次数会多一些
      */
      this.setData({
        topList: topListItem,
      })
     }
     console.log(topListItem);
  //    console.log(this.data.topListMusic);
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