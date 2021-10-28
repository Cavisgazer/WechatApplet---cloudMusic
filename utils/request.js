
// 发送网络请求
export default (url, data={}, method='GET') => {
  return new Promise((resolve, reject) => {
    // new Promise 初始化 实例的状态为 pending
    wx.request({
      url:'http://1.12.227.123:3000' + url,
      data: data,
      method,
      header: {
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
      },
      success: (res) => {
        if(data.isLogin){//登录请求,将用户cookie存入
          wx.setStorage({
            key: 'cookies',
            data: res.cookies,
          })
        }
        resolve(res.data);  
      },
      fail: (err) => {
        console.log(err);
        reject(err);
      }
    })
  })
}