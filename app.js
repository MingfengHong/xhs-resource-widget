/**
 * 学术资源分享小组件 - 应用入口
 * App() 必须在 app.js 中调用，且只能调用一次
 */
App({
  /**
   * 小程序初始化完成时触发，全局只触发一次
   */
  onLaunch() {
    console.log('[ResourceApp] 小组件启动');
    
    // 获取系统信息
    const systemInfo = xhs.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    console.log('[ResourceApp] 系统信息:', {
      platform: systemInfo.platform,
      screenWidth: systemInfo.screenWidth,
      screenHeight: systemInfo.screenHeight
    });
  },

  /**
   * 全局数据
   */
  globalData: {
    // 系统信息
    systemInfo: null,
    // 版本号
    version: '1.0.0'
  }
});
