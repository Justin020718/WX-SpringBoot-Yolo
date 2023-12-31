Page({
    data: {
      user_id: '',
      bob_id: '666',
      isAuth: false,
      src: '',
      recv_src: '',
      recv_text: '',
      text: ''
    },
    onLoad() {
      const _this = this
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.camera']) {
            // 用户已经授权
            _this.setData({
              isAuth: true
            })
          } else {
            // 用户还没有授权，向用户发起授权请求
            wx.authorize({
              scope: 'scope.camera',
              success() { // 用户同意授权
                _this.setData({
                  isAuth: true
                })
              },
              fail() { // 用户不同意授权
                _this.openSetting().then(res => {
                  _this.setData({
                    isAuth: true
                  })
                })
              }
            })
          }
        },
        fail: res => {
          console.log('获取用户授权信息失败')
        }
      })
      wx.request({
        url: 'http://localhost:8888/demo/upTexts',
        method: 'POST',
        data: {cypher: "Ask for user id"},
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log("已发送"+res.data)//打印到控制台
          if (res.data != "Unknown command")
          {
            _this.setData(
            {
              user_id: res.data
            })
            
            console.log(_this.data.user_id)
          }
        }
      })
    },
  
    // 打开授权设置界面
    openSetting() {
      const _this = this
      let promise = new Promise((resolve, reject) => {
        wx.showModal({
          title: '授权',
          content: '请先授权获取摄像头权限',
          success(res) {
            if (res.confirm) {
              wx.openSetting({
                success(res) {
                  if (res.authSetting['scope.camera']) { // 用户打开了授权开关
                    resolve(true)
                  } else { // 用户没有打开授权开关， 继续打开设置页面
                    _this.openSetting().then(res => {
                      resolve(true)
                    })
                  }
                },
                fail(res) {
                  console.log(res)
                }
              })
            } else if (res.cancel) {
              _this.openSetting().then(res => {
                resolve(true)
              })
            }
          }
        })
      })
      return promise;
    },
    getText: function(res){
      //获取输入框输入的内容
      const _this = this
      let value = res.detail.value;
      
      _this.setData({
        text: value
      })
    },
    getBobId: function(res){
      const _this = this
      let value = res.detail.value;
      _this.setData({
        bob_id: value
      })
    },
    takePhoto() {
      const _this = this
      const ctx = wx.createCameraContext()
      let cypher = _this.data["text"]
      console.log(cypher)
      ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          _this.setData({
            'src': res.tempImagePath
          })
          console.log(res.tempImagePath)
          wx.previewImage({
            current: res.tempImagePath, // 当前显示图片的http链接
            urls: [res.tempImagePath] // 需要预览的图片http链接列表
          })
        }
      })
    },
    uploadFile:function(){
      var _this=this;
      let src=_this.data.src;
      if(src==''){
        wx.showToast({
          title: '请选择文件',
          icon:'none'
        })
      }
      //准备上传文件
      else{
        console.log(src);
        var fileName = _this.data.user_id + "To" + _this.data.bob_id + "!" + _this.data.text + ".jpeg";//保存的文件名字，自定义
        var uploadTask=wx.uploadFile({
         url: 'http://localhost:8888/demo/upImgs?fileName='+fileName,
         header: { 
           "Content-Type": "multipart/form-data" },//类型
          filePath: src,
          name: 'file',//和后台接收的参数名字一致
          success:(res)=>{
            console.log(res.data);
            wx.showToast({
              title: '上传成功',
            })
          },
          fail:function(res){
           console.log("错误"+res);
         }
        })
        uploadTask.onProgressUpdate((res)=>{
          console.log('上传进度',res.progress);
          console.log('已经上传的数据长度',res.totalBytesSent);
          console.log('预期需要上传的数据总长度',res.totalBytesExpectedToSend);
        })
      }
    },
    refresh() {
      const _this = this
      let fileName = 'To'+_this.data.user_id+'.jpeg'
      console.log(fileName)
      wx.downloadFile({
        url: 'http://localhost:8888/demo/image/'+fileName,  //源文件地址
        // url: 'https://i0.hippopx.com/photos/320/918/427/sky-clouds-sunlight-dark-preview.jpg',
        success(res) {
          console.log(res.tempFilePath)
          let data = res.tempFilePath;
          _this.setData({
            recv_src: data
          })
        }
      })
      wx.request({
        url: 'http://localhost:8888/demo/image',
        method: 'GET',
        data: {"user_id": _this.data.user_id},
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          console.log("已接收"+res.data)//打印到控制台
          _this.setData({
            recv_text: res.data
          })
        }
      })
    }
  })