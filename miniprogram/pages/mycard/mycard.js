// miniprogram/pages/mycard.js
var app = getApp();
const db=wx.cloud.database({env:"csrdwork-5g8wopp85ff78442"})
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    endtimepicker:'',
    startvalue:'',
    endvalue:'',
    mycardList:[],
    isnodata:false,
    scrollheight:0,
  },
  bindDateChange:function(e){
    this.setData({
      startvalue:e.detail.value
    })
    this.getMydata();
  },
  bindendDateChange:function(e){
    this.setData({
      endvalue:e.detail.value
    })
    this.getMydata();
  },
  getDate:function(){
    var that=this;
    var date=new Date();
    var year=date.getFullYear();
    var month=date.getMonth()+1;
    var day=date.getDate()
    month =(month<10 ? "0"+month:month);
    var day1=day+1;
    var endday=(day1<10 ? "0"+day1:day1)
    day=(day<10 ? "0"+day:day)
    var end=year+"-"+month+"-"+day;
    var now=this.getDay(-7)
    this.setData({
      startvalue:now,
      endvalue:end,
      endtimepicker:year+"-"+month+"-"+endday
    },()=>{
      that.getMydata();
    })

  },

  getDay:function (day){
    　　var today = new Date();
    　　var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;
    　　today.setTime(targetday_milliseconds); //注意，这行是关键代码
    　　var tYear = today.getFullYear();
    　　var tMonth = today.getMonth();
    　　var tDate = today.getDate();
    　　tMonth = this.doHandleMonth(tMonth + 1);
    　　tDate = this.doHandleMonth(tDate);
    　　return tYear+"-"+tMonth+"-"+tDate;
  },
  doHandleMonth:function (month){
    　　var m = month;
    　　if(month.toString().length == 1){
    　　　　m = "0" + month;
    　　}
    　　return m;
  },
  cardTimeHandle:function(date){
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
    return time
  },
  getMydata:function(){
    wx.showLoading({
      title: '查询中',
      mask:true
    })
    var that=this;
    // 确定查询区间后，开始查询数据库相关信息
     var start=new Date(new Date(this.data.startvalue.replace(/-/g, '/')).setHours(0,0,0,0)) 
     var end=new Date(new Date(this.data.endvalue.replace(/-/g, '/')).setHours(23,59,59,0))  
      db.collection('history').where({
    // and 方法用于指定一个 "与" 条件，此处表示需同时满足 _.gt(30) 和 _.lt(70) 两个条件
      _openid:app.globalData.openid,
      cardtime: _.gte(start).and(_.lte(end))
      })
      .get({
        success: function(res) {
          setTimeout(function(){
            wx.hideLoading({
              success: (res) => {},
            })
          },100)
          if(res.data.length==0){
            that.setData({
              isnodata:true,
              mycardList:[]
            })
          }else{
            var arr=[]
            for(let item in res.data){
             var obj=res.data[item]
             obj.cardtime=that.cardTimeHandle(obj.cardtime)
              arr.push(obj)
            }
            arr.reverse();
            that.setData({
               mycardList:arr,
               isnodata:false
             })
          }
         }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
 
  onLoad: function (options) {
    var that=this;
    // 初始化获取当前年份，设置时间选择器的时间范围
    wx.getSystemInfo({
      success: (result) => {
        that.setData({
          scrollheight:result.windowHeight-64
        },()=>{
          that.getDate()
        })
      },
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