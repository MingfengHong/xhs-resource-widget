/**
 * 学术资源分享小组件 - 主页逻辑
 * 功能：资源列表展示、搜索过滤、日期/类型筛选、复制链接
 */

// 远程数据地址配置（请替换为你的 Gitee Raw 地址或其他托管地址）
// 示例：https://gitee.com/your-username/your-repo/raw/master/resources.json
const REMOTE_DATA_URL = 'YOUR_REMOTE_DATA_URL_HERE';

// 本地备用数据（当远程请求被小红书平台拦截时使用）
// 注意：小红书小组件对外部域名有限制，Gitee/GitHub 等域名可能被拦截
// 如需更新数据，请同时更新此处的本地数据
const LOCAL_FALLBACK_DATA = [
  {
    "id": "sample001",
    "title": "示例资源：机器学习入门指南",
    "type": "方法分享",
    "url": "https://example.com/resource1",
    "code": "abc123",
    "codeUrl": "",
    "codeCode": "",
    "date": "2025-01-15"
  },
  {
    "id": "sample002",
    "title": "示例资源：深度学习论文精读",
    "type": "论文精读",
    "url": "https://example.com/resource2",
    "code": "",
    "codeUrl": "https://example.com/code2",
    "codeCode": "xyz789",
    "date": "2025-01-10"
  },
  {
    "id": "sample003",
    "title": "示例资源：数据分析工具推荐",
    "type": "工具推荐",
    "url": "https://example.com/resource3",
    "code": "",
    "codeUrl": "",
    "codeCode": "",
    "date": "2025-01-05"
  }
];

Page({
  data: {
    // 资源列表（原始数据）
    resourceList: [],
    // 过滤后的资源列表（用于展示）
    filteredResourceList: [],
    // 搜索关键词
    searchKeyword: '',
    // 加载状态
    loading: true,
    // 错误状态
    hasError: false,
    errorMessage: '',
    
    // 筛选器状态
    showDateFilter: false,
    showTypeFilter: false,
    showFileTypeFilter: false,
    selectedDate: 'all',
    selectedType: 'all',
    selectedFileType: 'all',
    selectedDateLabel: '全部日期',
    selectedTypeLabel: '全部栏目',
    selectedFileTypeLabel: '全部文件',
    
    // 动态日期选项（从数据中提取）
    dateOptions: [],
    
    // 自定义 Toast 状态
    showToast: false,
    toastMessage: ''
  },

  /**
   * 页面生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('[ResourceApp] 学术资源分享页面加载');
    this.fetchResourceData();
  },

  /**
   * 页面生命周期函数--监听页面显示
   * 每次显示时重新获取数据，确保热更新
   */
  onShow() {
    // 如果已有数据，则静默刷新
    if (this.data.resourceList.length > 0) {
      this.silentRefresh();
    }
  },

  /**
   * 静默刷新数据（不显示 loading）
   * 注意：由于小红书平台限制，远程刷新可能失败，此时保持使用本地数据
   */
  silentRefresh() {
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${REMOTE_DATA_URL}?t=${timestamp}`;

    xhs.request({
      url: urlWithTimestamp,
      method: 'GET',
      timeout: 8000,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = this.parseJsonData(res.data);
          if (data && Array.isArray(data)) {
            console.log('[ResourceApp] 静默刷新成功，共', data.length, '条');
            const dateOptions = this.extractDateOptions(data);
            this.setData({
              resourceList: data,
              dateOptions: dateOptions
            });
            this.applyFilters();
          }
        }
        // 如果不是 200，静默失败，不做任何处理
      },
      fail: () => {
        // 静默刷新失败，继续使用现有数据
        console.log('[ResourceApp] 静默刷新失败，继续使用现有数据');
      }
    });
  },

  /**
   * 解析 JSON 数据（兼容字符串和对象）
   */
  parseJsonData(rawData) {
    // 如果已经是数组或对象，直接返回
    if (typeof rawData === 'object' && rawData !== null) {
      return rawData;
    }
    
    // 如果是字符串，尝试解析
    if (typeof rawData === 'string') {
      try {
        // 移除可能的 BOM 头
        let cleanData = rawData;
        if (rawData.charCodeAt(0) === 0xFEFF) {
          cleanData = rawData.substring(1);
        }
        return JSON.parse(cleanData);
      } catch (e) {
        console.error('[ResourceApp] JSON 解析失败:', e);
        console.error('[ResourceApp] 原始数据前200字符:', String(rawData).substring(0, 200));
        return null;
      }
    }
    
    return null;
  },

  /**
   * 从数据中提取年月选项
   */
  extractDateOptions(data) {
    const dateSet = new Set();
    data.forEach(item => {
      if (item.date) {
        // 提取年月部分 "2025-11-29" -> "2025-11"
        const yearMonth = item.date.substring(0, 7);
        dateSet.add(yearMonth);
      }
    });
    // 转为数组并按时间倒序排列
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  },

  /**
   * 使用本地备用数据
   */
  useLocalFallbackData() {
    console.log('[ResourceApp] 使用本地备用数据，共', LOCAL_FALLBACK_DATA.length, '条资源');
    const dateOptions = this.extractDateOptions(LOCAL_FALLBACK_DATA);
    this.setData({
      resourceList: LOCAL_FALLBACK_DATA,
      filteredResourceList: LOCAL_FALLBACK_DATA,
      dateOptions: dateOptions,
      loading: false,
      hasError: false
    });
  },

  /**
   * 获取远程资源数据
   */
  fetchResourceData() {
    this.setData({
      loading: true,
      hasError: false,
      errorMessage: ''
    });

    // 添加时间戳防止缓存
    const timestamp = new Date().getTime();
    const urlWithTimestamp = `${REMOTE_DATA_URL}?t=${timestamp}`;

    console.log('[ResourceApp] 尝试请求远程数据:', urlWithTimestamp);

    xhs.request({
      url: urlWithTimestamp,
      method: 'GET',
      timeout: 10000,
      header: {
        'Accept': 'application/json, text/plain, */*'
      },
      success: (res) => {
        console.log('[ResourceApp] 请求响应状态:', res.statusCode);
        
        if (res.statusCode === 200) {
          const data = this.parseJsonData(res.data);
          
          if (data && Array.isArray(data)) {
            console.log('[ResourceApp] 远程数据获取成功，共', data.length, '条资源');
            const dateOptions = this.extractDateOptions(data);
            this.setData({
              resourceList: data,
              filteredResourceList: data,
              dateOptions: dateOptions,
              loading: false,
              hasError: false
            });
          } else {
            console.warn('[ResourceApp] 远程数据格式异常，使用本地数据');
            this.useLocalFallbackData();
          }
        } else {
          // 远程请求失败（如 403），使用本地备用数据
          console.warn('[ResourceApp] 远程请求返回', res.statusCode, '，使用本地备用数据');
          this.useLocalFallbackData();
        }
      },
      fail: (err) => {
        // 网络请求失败，使用本地备用数据
        console.warn('[ResourceApp] 网络请求失败，使用本地备用数据:', err);
        this.useLocalFallbackData();
      }
    });
  },

  /**
   * 处理网络错误
   */
  handleNetworkError(message) {
    this.setData({
      loading: false,
      hasError: true,
      errorMessage: message
    });
  },

  /**
   * 重试按钮点击事件
   */
  onRetryTap() {
    console.log('[ResourceApp] 用户点击重试');
    this.fetchResourceData();
  },

  /**
   * 搜索框输入事件
   */
  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    console.log('[ResourceApp] 搜索关键词:', keyword);
    
    this.setData({
      searchKeyword: keyword
    });

    this.applyFilters();
  },

  /**
   * 清除搜索框
   */
  onClearSearch() {
    this.setData({
      searchKeyword: ''
    });
    this.applyFilters();
  },

  /**
   * 应用所有筛选条件
   */
  applyFilters() {
    const { resourceList, searchKeyword, selectedDate, selectedType, selectedFileType } = this.data;
    
    let filtered = [...resourceList];
    
    // 0. 过滤掉没有任何链接的条目（既没有文献也没有代码）
    filtered = filtered.filter(item => item.url || item.codeUrl);
    
    // 1. 搜索关键词过滤
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(item => {
        return (item.title && item.title.toLowerCase().includes(kw)) ||
               (item.type && item.type.toLowerCase().includes(kw)) ||
               (item.desc && item.desc.toLowerCase().includes(kw));
      });
    }
    
    // 2. 日期过滤（按年月）
    if (selectedDate !== 'all') {
      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemYearMonth = item.date.substring(0, 7);
        return itemYearMonth === selectedDate;
      });
    }
    
    // 3. 栏目类型过滤
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }
    
    // 4. 文件类型过滤
    if (selectedFileType !== 'all') {
      filtered = filtered.filter(item => {
        const hasDoc = !!item.url;
        const hasCode = !!item.codeUrl;
        
        switch (selectedFileType) {
          case 'doc':
            return hasDoc && !hasCode;
          case 'code':
            return hasCode && !hasDoc;
          case 'both':
            return hasDoc && hasCode;
          default:
            return true;
        }
      });
    }
    
    console.log('[ResourceApp] 过滤结果:', filtered.length, '条');
    
    this.setData({
      filteredResourceList: filtered
    });
  },

  /**
   * 打开日期筛选弹窗
   */
  onDateFilterTap() {
    this.setData({ showDateFilter: true });
  },

  /**
   * 关闭日期筛选弹窗
   */
  onCloseDateFilter() {
    this.setData({ showDateFilter: false });
  },

  /**
   * 选择日期筛选项
   */
  onSelectDate(e) {
    const value = e.currentTarget.dataset.value;
    const label = value === 'all' ? '全部日期' : value;
    
    this.setData({
      selectedDate: value,
      selectedDateLabel: label,
      showDateFilter: false
    });
    
    this.applyFilters();
  },

  /**
   * 打开类型筛选弹窗
   */
  onTypeFilterTap() {
    this.setData({ showTypeFilter: true });
  },

  /**
   * 关闭类型筛选弹窗
   */
  onCloseTypeFilter() {
    this.setData({ showTypeFilter: false });
  },

  /**
   * 选择类型筛选项
   */
  onSelectType(e) {
    const value = e.currentTarget.dataset.value;
    
    this.setData({
      selectedType: value,
      selectedTypeLabel: value === 'all' ? '全部栏目' : value,
      showTypeFilter: false
    });
    
    this.applyFilters();
  },

  /**
   * 打开文件类型筛选弹窗
   */
  onFileTypeFilterTap() {
    this.setData({ showFileTypeFilter: true });
  },

  /**
   * 关闭文件类型筛选弹窗
   */
  onCloseFileTypeFilter() {
    this.setData({ showFileTypeFilter: false });
  },

  /**
   * 选择文件类型筛选项
   */
  onSelectFileType(e) {
    const value = e.currentTarget.dataset.value;
    const labelMap = {
      'all': '全部文件',
      'doc': '仅文献',
      'code': '仅代码',
      'both': '文献与代码'
    };
    
    this.setData({
      selectedFileType: value,
      selectedFileTypeLabel: labelMap[value],
      showFileTypeFilter: false
    });
    
    this.applyFilters();
  },

  /**
   * 复制文献链接按钮点击事件
   */
  onCopyLinkTap(e) {
    const { index } = e.currentTarget.dataset;
    const resource = this.data.filteredResourceList[index];
    
    if (!resource || !resource.url) {
      this.showCustomToast('链接不可用');
      return;
    }

    // 组合复制内容：链接 + 空格 + 提取码（如果有）
    let copyText = resource.url;
    if (resource.code) {
      copyText += ` 提取码: ${resource.code}`;
    }

    console.log('[ResourceApp] 准备复制文献链接:', copyText);
    this.copyToClipboard(copyText);
  },

  /**
   * 复制代码链接按钮点击事件
   */
  onCopyCodeTap(e) {
    const { index } = e.currentTarget.dataset;
    const resource = this.data.filteredResourceList[index];
    
    if (!resource || !resource.codeUrl) {
      this.showCustomToast('代码链接不可用');
      return;
    }

    // 组合复制内容：链接 + 空格 + 提取码（如果有）
    let copyText = resource.codeUrl;
    if (resource.codeCode) {
      copyText += ` 提取码: ${resource.codeCode}`;
    }

    console.log('[ResourceApp] 准备复制代码链接:', copyText);
    this.copyToClipboard(copyText);
  },

  /**
   * 复制到剪贴板
   */
  copyToClipboard(text) {
    xhs.setClipboardData({
      data: text,
      success: () => {
        console.log('[ResourceApp] 复制成功');
        this.showCustomToast('已复制下载链接，请粘贴到浏览器下载');
      },
      fail: (err) => {
        console.error('[ResourceApp] 复制失败:', err);
        this.showCustomToast('复制失败，请稍后重试');
      }
    });
  },

  /**
   * 显示自定义 Toast
   */
  showCustomToast(message) {
    this.setData({
      showToast: true,
      toastMessage: message
    });
    
    // 2秒后自动隐藏
    setTimeout(() => {
      this.setData({ showToast: false });
    }, 2000);
  }
});
