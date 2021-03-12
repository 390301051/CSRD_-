
// pages/regist/regist.js
const app = getApp()
const db=wx.cloud.database({env:"csrdwork-5g8wopp85ff78442"})
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    pageheight:0,
    sex:[
      {value:"BOY",  name:"男", checked:true},
      {value:"GIRL",name:"女",checked:false}
    ],
    Classarray:[],
    class:null,
    company:null,
    companyarr:[],
    classindex:0,
    companyarrindex:0,
    chosesex:"男",
    avatarUrl:"",
    isupdate:false,  //判断当前是注册信息，还是用户更新信息
  },
  nameinput:function(e){
    this.setData({
      name:e.detail.value //正则去除空格
    })
  },
  radioChange(e) {
    const value=e.detail.value
    var item="男"
    if(value==="GIRL"){
      item="女"
    }else{
      item="男"
    }
    this.setData({
      chosesex:item
    })
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
  setUserinfo:function(){
    var appobj=app.globalData.userinfo
    var name=appobj.name,
     sex=appobj.sex,
     myclass=appobj.class,
     company=appobj.company; 
    if(sex=="男"){
      this.setData({
        "sex[0].checked":true,
        "sex[1].checked":false
      })
    }else{
      this.setData({
        "sex[0].checked":false,
        "sex[1].checked":true
      })
    }
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
      companyarrindex:companyindex,
      name:name
    })
   
    
  },
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
  getSysteminfo:function () {
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
          if(that.data.isupdate){
            that.setUserinfo();
          }else{
            that.setCompanyArr();
          }
           
        })
      },
      fail:err=>{
        wx.showToast({
          title: err
        })
      }
    })
  },
  updatebtn:function(e){
    var that=this
    var str=this.data.Classarray[this.data.classindex]
    var compan=this.data.companyarr[this.data.companyarrindex]
    wx.showLoading({
      title: '正在提交...',
      mask:true
    })
    db.collection('userinfo').where({
      _openid:app.globalData.openid
    }).update({
      data:{
        name:that.data.name, //姓名
        sex:that.data.chosesex,
        class:str,  //部门
        company:compan,  //分公司
      },
      success:(res)=>{
        app.globalData.userinfo.name=that.data.name
        app.globalData.userinfo.sex=that.data.chosesex
        app.globalData.userinfo.class=str
        app.globalData.userinfo.company=compan
          setTimeout(() => {
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '更新成功！',
                  icon:"success",
                  duration:1500,
                  complete:function(){
                    wx.navigateBack({
                      delta: 0,
                    })
                  }
                })
              },
              fail:(err)=>{
                console.log(err)
              }
            })
          }, 100);
      }
    })
  },
  registbtn:function(e){
    // console.log(e)
    var name=this.data.name.replace(/\s+/g, '')
    var that=this
    var str=this.data.Classarray[this.data.classindex]
    var compan=this.data.companyarr[this.data.companyarrindex]
    var str=e.detail.userInfo.avatarUrl
    str=str.slice(0,str.length-3)+"64"
    this.setData({
      avatarUrl:str
    },()=>{
      if(name===""){
        wx.showToast({
          title: '请输入用户名',
          icon:"error",
          duration:1500
        })
        return
      }else{
        if(that.data.isupdate){
          that.updatebtn()
        }else{
          that.postData();
        }
         
      }
    })
  },

  postData:function(){
    var that=this
    var str=this.data.Classarray[this.data.classindex]
    var compan=this.data.companyarr[this.data.companyarrindex]
    wx.showLoading({
      title: '正在提交...',
      mask:true
    })
    db.collection('userinfo').where({
      _openid:app.globalData.openid
    }).get({
      success:(res)=>{

        if(res.data.length!=0){
          setTimeout(() => {
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '该用户已存在',
                  icon:"error",
                  duration:1500
                })
              },
              fail:(err)=>{
                console.log(err)
              }
            })
          }, 100);
          
          return
        }else{
          var obj={
            // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
            class:str,  //部门
            company:compan,  //分公司
            id:app.globalData.openid,
            name:that.data.name, //姓名
            sex:that.data.chosesex,
            iscard:false, //当日是否打卡
            cardtime:new Date("2009/1/1 12:59:59"), //上次打卡时间。初始化默认为 2009/1/1 凌晨
            carddays:0, //累计打卡天数,
            imgUrl:that.data.avatarUrl
          }
          db.collection('userinfo').add({
            // data 字段表示需新增的 JSON 数据
            data: obj,
            success: function(res) {
              app.globalData.hasregist=true
              app.globalData.userinfo=obj;
              app.globalData.islogin=true
              // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
              setTimeout(() => {
                wx.hideLoading({
                  success: () => {
                    wx.showToast({
                      title: '注册成功！',
                      icon:"success",
                      duration:1500,
                      complete:function(){
                        wx.reLaunch({
                          url: '/pages/card/card',
                        })
                      }
                    })
                  },
                  fail:(err)=>{
                    console.log(err)
                  }
                })
              }, 100)
            }
          })
        }
      }
    })
  },
  // 获取授权与用户信息
  getSeting:function(){
   
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    this.setData({pageheight:app.globalData.pageheight})
    var flag=(options.key==="update"?true : false)
    this.setData({
      isupdate:flag
    },()=>{
      that.getSysteminfo()
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