// pages/mine/mine.js
const app = getApp()
const db=wx.cloud.database({env:"csrdwork-5g8wopp85ff78442"})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageheight:0,
    userinfo:{},
    islogin:false,
    userimage:"",
    carddays:0,
    iscard:false
  },
  Loginout:function(){
    app.globalData.islogin=false
    app.globalData.userinfo={}
    app.globalData.openid=""
    this.setData({
      islogin:false,
      userinfo:{},
      userimage:"./user-unlogin.png"
    })
  },
  logIn:function(){
    var that=this
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: res => {
            app.globalData.openid = res.result.openid
            db.collection("userinfo").where({
              _openid:res.result.openid
            }).get({
              success:(res)=>{
                if(res.data.length==0){
                  setTimeout(() => {
                    wx.hideLoading({
                      success: (res) => {
                        app.globalData.islogin=false
                        wx.reLaunch({
                          url: '/pages/regist/regist',
                        })
                      }
                    })
                  }, 100);
                  
                }else{
                  setTimeout(() => {
                    wx.hideLoading({
                   success: (res1) => {
                  app.globalData.islogin=true
                  app.globalData.userinfo=res.data[0];
                  app.globalData.hasregist=true
                  // 根据打卡时间判断当前打卡状态
                  var d = new Date(res.data[0].cardtime.toString().replace(/-/g,"/"));
                  var todaysDate = new Date();
                  if(d.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)){
                      app.globalData.userinfo.iscard=true;
                  }else{
                      app.globalData.userinfo.iscard=false;
                  }

                  that.setData({
                    carddays:app.globalData.userinfo.carddays,
                    userinfo:app.globalData.userinfo,
                    iscard:app.globalData.userinfo.iscard,
                    islogin:true,
                    userimage:app.globalData.userinfo.imgUrl
                  })
                  }
                    })
                  }, 100);
                 
                }
              },
              fail:(res)=>{
                setTimeout(function(){
                  wx.hideLoading({
                    success: (res) => {
                      wx.showToast({
                        title: "请求超时！",
                        duration:2000,
                        icon:"error"
                      })
                    },
                  })
                },100)
              }
            })
          },
          fail:res=>{
            setTimeout(function(){
              wx.hideLoading({
                success: (res) => {
                  wx.showToast({
                    title: "请求超时！",
                    duration:2000,
                    icon:"error"
                  })
                },
              })
            },100)
          }
        })
    
  },
  navto:function(e){
    var that=this;
    var str=e.currentTarget.dataset.address;
    if(!this.data.islogin&&str!="loginout"){
        wx.showToast({
          title: '请先登录(-_-)',
          duration:1500,
          icon:"none",
          success:()=>{
            
          }
        })
        return
    }
    switch (str) {
      case "regist":wx.navigateTo({
        url: '/pages/regist/regist?key=update'
      })
      break;
      
      case "cardlist":wx.navigateTo({
        url: '/pages/mycard/mycard'
      })
      break;
        
      case "loginout":that.Loginout()
       break;
      default:
        break;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var str=app.globalData.userinfo.imgUrl;
    if(!app.globalData.islogin){
       str="./user-unlogin.png"
    }
    // console.log(str)
    this.setData({
      pageheight:app.globalData.pageheight,
      userinfo:app.globalData.userinfo,
      islogin:app.globalData.islogin,
      userimage:str
    })
    // 检查用户是否登录
    // 获取用户头像

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
    this.setData({
     carddays:app.globalData.userinfo.carddays,
     iscard:app.globalData.userinfo.iscard,
     userinfo:app.globalData.userinfo
    })
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