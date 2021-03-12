// pages/list/list.js
const app=getApp()
const db=wx.cloud.database({env:"csrdwork-5g8wopp85ff78442"})
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Classarray:[],
    class:null,
    company:null,
    companyarr:[],
    classindex:0,
    companyarrindex:0,
    mycardList:[],
    isnodata:false,
    scrollheight:0,
    endtimepicker:'',
    startvalue:'',
    isloginnum:0
  },
  classPicker(e){
    var that=this
    this.setData({
      classindex:e.detail.value
    },()=>{
      that.setCompanyArr()
    })
   
  },
  companyPicker(e){
    this.setData({
      companyarrindex:e.detail.value
    })
  },
  bindDateChange(e){
    this.setData({
      startvalue:e.detail.value
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
    day=(day<10 ? "0"+day:day)
    var end=year+"-"+month+"-"+day;
    this.setData({
      startvalue:end,
      endtimepicker:year+"-"+month+"-"+day
    })

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
  // 获取历史打卡数据
  getMydata:function(){
    if(!app.globalData.islogin){
        wx.showToast({
          title: '请先登录(-_-)',
          duration:1500,
          icon:"none"
        })
      return
    }
    wx.showLoading({
      title: '查询中',
      mask:true
    })
    var that=this;
    // 确定查询区间后，开始查询数据库相关信息
    var myclass=this.data.Classarray[this.data.classindex];
    var mycompany=this.data.companyarr[this.data.companyarrindex];
     var start=new Date(new Date(this.data.startvalue.replace(/-/g, '/')).setHours(0,0,0,0)) 
     var end=new Date(new Date(this.data.startvalue.replace(/-/g, '/')).setHours(23,59,59,0))  
      db.collection('history').where({
    // and 方法用于指定一个 "与" 条件，此处表示需同时满足 _.gt(30) 和 _.lt(70) 两个条件
      class:myclass,
      company:mycompany,
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
             if(item==0){
               obj["myhead"]="../../images/one.png"
             }
             if(item==1){
              obj["myhead"]="../../images/two.png"
            }
            if(item==2){
              obj["myhead"]="../../images/three.png"
            }
             obj.cardtime=that.cardTimeHandle(obj.cardtime)
              arr.push(obj)
            }
            // arr.reverse();
            that.setData({
               mycardList:arr,
               isnodata:false
             })
          }
         }
      })
  },
  setUserinfo:function(){
    var that=this;
    var appobj=app.globalData.userinfo
    var name=appobj.name,
     myclass=appobj.class,
     company=appobj.company; 
    var newarr=[]
    var index=this.data.Classarray.indexOf(myclass)
   var obj=this.data.company
    var classobj=this.data.class
    var str=this.data.Classarray[index]
    var code=''  //当前所选的部门的关键字
    // 查询当前选择的部门有哪些下属分公司
    for(let item in classobj){
      if(str===classobj[item]){
        code=item
        break
      }
    }
      var arr=obj[code];
      // console.log(typeof(arr)) //Object
      // if(arr.length>0){
      //   arr.forEach((index,value) => {
      //     newarr.push(value)
      //   });
      // }
      if(arr.length<=0){
        newarr=[obj.default]
      }else{
        newarr.push(obj.default)
        for(var i=0;i<arr.length;i++){
          newarr.push(arr[i])
        }
      }
   var companyindex=newarr.indexOf(company)
    this.setData({
      classindex:index,
      companyarr:newarr,
      companyarrindex:companyindex
    },()=>{
      that.getMydata();
    })
   
    
  },
  // 数据格式处理
  setCompanyArr:function(){
    var that=this
    var newarr=[]
    var obj=this.data.company
    var classobj=this.data.class
    var str=this.data.Classarray[this.data.classindex]
    var code=''  //当前所选的部门的关键字
    // 查询当前选择的部门有哪些下属分公司
    for(let item in classobj){
      if(str===classobj[item]){
        code=item
        break
      }
    }
      var arr=obj[code];
      // console.log(typeof(arr)) //Object
      // if(arr.length>0){
      //   arr.forEach((index,value) => {
      //     newarr.push(value)
      //   });
      // }
      if(arr.length<=0){
        newarr=[obj.default]
      }else{
        newarr.push(obj.default)
        for(var i=0;i<arr.length;i++){
          newarr.push(arr[i])
        }
      }
    var defaultindex=newarr.indexOf("成都总部")
    this.setData({
      companyarr:newarr,
      companyarrindex:defaultindex
    })
  },
  // 获取后台预设部门及分公司
  getSystem:function(){
    var that=this;
    db.collection("systeminfo").get({
      success:res=>{
        var obj=res.data[0].classobj
        var arr=[]
        for(let item in obj){
          arr.push(obj[item])
        }
        that.setData({
          Classarray:arr,
          class:res.data[0].classobj,
          company:res.data[0].company
        },()=>{
            that.setUserinfo();
           
        })
      },
      fail:err=>{
        wx.showToast({
          title: err
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    // console.log(app.globalData.userinfo)
    if(!app.globalData.islogin){
      this.setData({
        isloginnum:1
      },()=>{
        wx.showToast({
          title: '请先登录(-_-)',
          duration:1500,
          icon:"none"
        })
      })
      return
    }
    // 获取系统所用部门及部门下属子公司
    wx.getSystemInfo({
      success: (result) => {
        that.setData({
          scrollheight:result.windowHeight-64
        },()=>{
          that.getSystem()
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
    var that=this
    if(app.globalData.islogin&&this.data.isloginnum==1){
      wx.getSystemInfo({
        success: (result) => {
          that.setData({
            scrollheight:result.windowHeight-64,
            isloginnum:0
          },()=>{
            that.getSystem()
            that.getDate()
          })
        },
      })
    }
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