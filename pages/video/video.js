// pages/video/video.js
import request from '../../utils/request'
import regeneratorRuntime from '../../utils/runtime'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList : [], // 导航标签数据
    navId: '', // 导航标识
    videoList:  [], // 视频数据存放
    videoId: '', // 视频 id 标识
    videoUpdateTime: [], // 记录 video 播放的时长
    isTriggered: false, // 标识下拉是否被触发
  },
  // 获取导航数据
  async getVideoGroupListData() {
    let videoGroupData  = await request('/video/group/list');
    console.log(videoGroupData);
    this.setData({
      videoGroupList: videoGroupData.data.slice(0, 14),
      navId: videoGroupData.data[0].id,
    }) 
        // 获取视频列表数据
        this.getVideoList(this.data.navId);
  },
  // 获取视频列表数据
  async getVideoList(navId) {
    let VideoListData = await request('/video/group', {id: navId});
    console.log(VideoListData);
    let videoInfoList = [];
    VideoListData.datas.forEach((i) => {
      videoInfoList.push({
        id: i.data.vid,
        title: i.data.title,
        creator: i.data.creator,
        commentCount: i.data.commentCount,
        praisedCount: i.data.praisedCount,
        coverUrl: i.data.coverUrl,
        videoUrl : ''
      })
    })
    console.log(videoInfoList);
    for(let i in videoInfoList) {
      let result = await request('/video/url', {id: videoInfoList[i].id});
      videoInfoList[i].videoUrl = result.urls[0].url
    }
    this.setData({
      videoList: videoInfoList,
      // 关闭下拉刷新
      isTriggered: false
    })
    wx.hideLoading({
      success: (res) => {},
    })
    console.log(this.data.videoList);
  },
  // 点击播放的回调
  handlePlay(event) {
    /**
     * 需求：
     *  在点击播放的事件中找到上一个播放的视频
     *  在播放新的视频之前关闭上一个正在播放的视频
     * 关键：
     *  如何找到上一个视频的实例
     *  如何确认点击播放的视频和正在播放的视频不是同一个视频
     */
    let id = event.currentTarget.id;
    // 关闭上一个播放的视频
   this.id !== id && this.videoContext && this.videoContext.stop();
   this.id = id;
   // 更新 data 中的 videoId 的状态数据
   this.setData({
     videoId: id,
   })
    // 创建控制 video 标签的实例对象
    this.videoContext = wx.createVideoContext(id);
    // 判断当前的视频之前是否播放过，是否有播放记录，如果有，跳转到指定的播放位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.id === id);
    if(videoItem) {
      this.videoContext.seek(videoItem.currentTime);
    }
    this.videoContext.play();
    },
  // 监听视频播放进度的回调
  handleTimeUpdate(event) {
    let videoTimeObj = {id: event.currentTarget.id, currentTime: event.detail.currentTime};
    let {videoUpdateTime} = this.data;
    /**
     * 思路：判断记录播放时长的 videoTime 数组中是否有当前视频的播放记录
     *  1、如果有，在原有的播放记录中修改播放时间为当前的播放时间
     *  2、如果没有，需要在数组中添加当前视频的播放对象
     */
    let videoItem = videoUpdateTime.find(item => 
      item.id === videoTimeObj.id
    )
    if(videoItem) { // 之前有
      videoItem.currentTime = event.detail.currentTime;
    } else {  // 之前没有
      videoUpdateTime.push(videoTimeObj);
    }
    // 更新 videoTime 的状态
    this.setData({
      videoUpdateTime
    })
  },
  // 下拉的回调
  handleRefresher() {
    this.getVideoList(this.data.navId);
  },
  // 自定义上拉触底的回调
  handleTolower() {
    // 数据分页： 1、后端分页， 2/前端分页
    },


  //   播放视频结束的回调
  handleEnded(event) {
    // 移除记录播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.id === event.currentTarget.id), 1);
    this.setData({
      videoUpdateTime
    })
  },

  // 点击切换导航的回调
  changeNav(event) {
    let navId = event.currentTarget.id;
    this.setData({
      navId,
      videoList: []
    })
    // 显示正在加载
    wx.showLoading({
      title: '正在加载',
    })
    // 动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId);
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取导航标签数据
    this.getVideoGroupListData();
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
  onShareAppMessage: function ({from}) {
    return {
      title: '自定义转发内容',
      page: '/pages/video/video',
    }
  }
})