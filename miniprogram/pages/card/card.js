// pages/card/card.js
var amapFile = require('../../amapPlugin/amap-wx.js');//如：..­/..­/libs/amap-wx.js
var myAmapFun = new amapFile.AMapWX({key:'ac59dd0747ed6529c960177695e4e668'});
var app = getApp();
const db=wx.cloud.database({env:"csrdwork-5g8wopp85ff78442"})
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
      pageheight:0,
      loctime:'',  //当前时间， 格式：年月日 星期X 时分秒
      cardtime:'', //打卡时间 年/月/日 时/分/秒
      loctimeid:null,
      disabled:false,
      sumbmit:false,
      iscard:false,  //判断今日是否已经打卡
      lastcardtime:"",  //上次打卡时间，限制重复打卡，每日只能打卡一次
      weather:{},    //当日天气状况
      mylocation:{  //公司所在位置的经纬度
        latitude: 0, //纬度
        longitude: 0, //经度
        name:""
      },
      canCard:false, //是否进入打卡范围
  },
  // 自定义函数

// 计算用户是否在打卡范围类
getDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = lat1 * Math.PI / 180.0;
  var radLat2 = lat2 * Math.PI / 180.0;
  var a = radLat1 - radLat2;
  var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s;
},
// 日期处理，本地显示时间格式转换
formatDateTime: function(date){  
  var y = date.getFullYear();  
    var m = date.getMonth() + 1;  
      m = m < 10 ? ('0' + m) : m;  
  var d = date.getDate();  
   d = d < 10 ? ('0' + d) : d;  
  var h = date.getHours();  
   h=h < 10 ? ('0' + h) : h;  
  var minute = date.getMinutes();  
   minute = minute < 10 ? ('0' + minute) : minute;  
  var second=date.getSeconds(); 
  second=second < 10 ? ('0' + second) : second;  
  var day=date.getDay();  //0-6,0代表星期天
  switch (day){
    case 0: day='星期天'
      break;
   case 1: day='星期一'
     break;
   case 2: day='星期二'
     break;
   case 3: day='星期三'
     break;
   case 4: day='星期四'
     break;
   case 5: day='星期五'
     break;
   case 6: day='星期六'
     break;
  }
  return y + '年' + m + '月' + d+'日'+' '+day+' '+h+':'+minute+':'+second;  
 },
//  上次打卡时间格式化处理
formatCardTime: function (date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h=h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  var second=date.getSeconds();
  second=second < 10 ? ('0' + second) : second;
  var time= y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
  this.isToday(time)
},
// 判断上次打卡时间，避免每日重复打卡
isToday :function (date) {
  var that=this
    var d = new Date(date.toString().replace(/-/g,"/"));
    var todaysDate = new Date();
    if(d.setHours(0,0,0,0) == todaysDate.setHours(0,0,0,0)){
        this.setData({
          iscard:true,
          disabled:false
        })
        wx.showToast({
          title: '今日已打卡',
          icon:"error",
          duration:1000
        })
        return true;
    } else {
      app.globalData.userinfo.iscard=true
      var time= new Date()
      this.setData({
        iscard:true,
        disabled:false
      },()=>{
           // 打卡的有效范围：用户所在分公司实际地理位置（数据库统一设置）距离用户打卡时所在位置的直线距离小于<50m,  打卡有效。
            db.collection("systeminfo").where({
              useraddress:{
                name:app.globalData.userinfo.company
              }
            }).get({
              success:(res)=>{
                var advAddress=res.data[0].useraddress
                var advLatitude,advLongitude;
                for(var i=0; i<advAddress.length;i++){
                  if(advAddress[i].name==app.globalData.userinfo.company){
                    advLatitude=advAddress[i].address.latitude;
                    advLongitude=advAddress[i].address.longitude;
                    break;
                  }
                }
                var result=that.getDistance(that.data.mylocation.latitude,that.data.mylocation.longitude,advLatitude,advLongitude)
                if(result>0.1){
                  wx.showToast({
                    title: '尚未进入打卡范围(-_-)',
                    duration:1500,
                    icon:"none"
                  })
                  return
                }else{
                   // 更新本地数据
                   var carddays = app.globalData.userinfo.carddays
                   app.globalData.userinfo.iscard = true
                   app.globalData.userinfo.cardtime = time
                   app.globalData.userinfo.carddays = carddays + 1

                   // 更新数据库用户表
                   db.collection("userinfo").where({
                   _openid: app.globalData.openid
                   }).update({
                   data: {
                   iscard: true,
                   cardtime: time,
                   carddays: _.inc(1)
                   },
                   success: (res) => {
                   wx.showToast({
                     title: '打卡成功！',
                     icon: "success",
                     duration: 1000
                   })
                   //将用户打卡信息记入历史数据表
                   db.collection("history").add({
                     data: {
                       cardtime: time,
                       class: app.globalData.userinfo.class,
                       company: app.globalData.userinfo.company,
                       name: app.globalData.userinfo.name,
                       openid: app.globalData.openid,
                       sex: app.globalData.userinfo.sex,
                       userimage: app.globalData.userinfo.imgUrl
                     },
                     success: (res) => {

                     }
                   })
                   }
                   })
                   }
                   }
                   })

                   })
                   return false;
    }
},
 card:function(){
    var that=this;
    if(!app.globalData.islogin){
      wx.showToast({
        title: '请先登录(-_-)',
        duration:1500,
        icon:"none"
      })
      return
    }
   
    // 获取用户当前位置信息，检查定位权限
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success () {
             that.getmyLocation()
            },
            fail(){
              wx.showModal({
                title: '提示',
                content: '若点击不授权，将无法使用打卡与天气功能',
                cancelText:'不授权',
                cancelColor:'#999',
                confirmText:'授权',
                confirmColor:'#f94218',
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({
                        success(res) {
                        if(res['scope.userLocation'])
                          that.getmyLocation()
                        }
                      })                                
                  } else if (res.cancel) {
                    wx.showToast({
                      title: '授权失败！',
                      duration:1500,
                      icon:"none"
                    })
                    console.log('用户点击取消')
                    return
                  }
                }
              })
            }
          })
        }else{
          that.getmyLocation()
        }
      },
      fail(err){
        return
      }    
    })



    // 打卡状态审核
    db.collection("userinfo").where({
      _openid:app.globalData.openid
    }).get({
      success:(res)=>{
        if(res.data.length==0){
         
        }else{
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
            iscard:res.data[0].iscard,
            lastcardtime:res.data[0].cardtime
          },()=>{
            that.formatCardTime(app.globalData.userinfo.cardtime)
          })
        }
      }
    })
 },
//  获取天气接口
getWeather:function(){
  var that=this;
  myAmapFun.getWeather({
    success: function(data){
      //成功回调
      that.setData({
        weather:data
      })
    },
    fail: function(info){
      //失败回调
      console.log(info)
    }
  })
},
// 获取位置接口
getmyLocation:function(){
  var that = this;
  myAmapFun.getRegeo({
    success: function(data){
      //成功回调
      that.setData({
        mylocation:{
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          address:data[0].name
        }
      })
    },
    fail: function(info){
      //失败回调
      console.log(info)
    }
  })
},
// 初始化本地位置权限获取
checkPremision:function(){
  var that=this;
  // 弹窗提示用户授权获取当前位置信息
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userLocation']) {
        wx.authorize({
          scope: 'scope.userLocation',
          success () {
           that.getWeather()
           that.getmyLocation()
          },
          fail(){
            wx.showModal({
              title: '提示',
              content: '若点击不授权，将无法使用打卡与天气功能',
              cancelText:'不授权',
              cancelColor:'#999',
              confirmText:'授权',
              confirmColor:'#f94218',
              success(res) {
                if (res.confirm) {
                  wx.openSetting({
                      success(res) {
                      if(res['scope.userLocation'])
                        that.getWeather()
                        that.getmyLocation()
                      }
                    })                                
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        })
      }else{
        that.getWeather()
        that.getmyLocation()
      }
    },
    fail(err){

    }    
  })
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    wx.getSystemInfo({
      success: (result) => {
        app.globalData.pageheight=result.windowHeight
        that.setData({pageheight:result.windowHeight })
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
                     that.checkPremision();
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
                    iscard:res.data[0].iscard,
                    lastcardtime:res.data[0].cardtime
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
      }
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
    var that=this;
    var screenHeight=0;
    wx.getSystemInfo({
      success: (result) => {
        screenHeight=result.windowHeight
        this.setData({pageheight:screenHeight})
      },
    })
    this.setData({loctime:that.formatDateTime(new Date())})
    this.setData({
      loctimeid:setInterval(function(){
        that.setData({loctime:that.formatDateTime(new Date())});
      },500)
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.loctimeid)
    this.setData({loctimeid:null})
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