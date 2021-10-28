// pages/search/search.js
import regeneratorRuntime from '../../utils/runtime'
import request from '../../utils/request'
let isSend = false;//函数节流使用
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',// placeholder默认的内容
    hotList: [],//热搜榜
    searchContent: '',//用户输入的表单数据项
    searchList: [], //关键字
    historyList: [],//初始化历史记录
  },
  // 回调函数

  // 获取默认搜索关键词
  async getInitData() {
    let placeholderData = await request('/search/default');
    console.log(placeholderData);
    this.setData({
      placeholderContent: placeholderData.data.showKeyword
    })
  },
  // 获取热搜榜
  async getHotHank() {
    let hotListData = await request('/search/hot/detail');
    console.log(hotListData);
    this.setData({
      hotList: hotListData.data,
    })
  },
  // 发请求获取关键字模糊匹配数据
  async getSearch() {
    if(!this.data.searchContent) {
      this.setData({
        searchList: [],
      })
      return;
    }
    // 发请求获取关键字模糊匹配数据
    let {searchContent, historyList} = this.data;
    let searchListData = await request('/search', {keywords:searchContent, limit: 10})
    console.log(searchListData);
    this.setData({
      searchList: searchListData.result.songs,
    })
    // 将搜索的关键字添加到搜索历史记录中
    if(historyList.indexOf(searchContent) !== -1){
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList: historyList
    })
      //存储到本地
      wx.setStorageSync('searchHistory', historyList)
  },
  // 表单项内容发生改变的回调
  handleInputChange(event) {
    console.log(event);
        // 获更新 searchContent 的状态数据
        this.setData({
          searchContent: event.detail.value.trim(),
        })
        if(isSend) {
          return;
        }
        isSend = true;
        this.getSearch();
        setTimeout(() => {
          isSend = false;
        }, 500)
  },
      // 获取本地历史记录的功能函数
      getSearchHistory(){
        let historyList =  wx.getStorageSync('searchHistory');
        if(historyList){
          this.setData({
            historyList: historyList
          })
        }
      },
        //清空搜索内容
  handleClear(){
    this.setData({
      searchContent: '',
      searchList: []
    })
  },
    //删除搜索历史记录
    handleDelete(){
      //是否确认清空
      wx.showModal({
        content: '确认清空记录吗?',
        success: (res)=>{
          if(res.confirm){
            this.setData({
              historyList: []
            })
            wx.removeStorageSync('searchHistory');
          }
        }
      })
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取默认搜索关键词
    this.getInitData();
    // 获取热搜榜
    this.getHotHank();
    // 获取历史记录
    this.getSearchHistory();
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