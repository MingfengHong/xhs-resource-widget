# 📚 学术资源分享小组件

<p align="center">
  <img src="https://img.shields.io/badge/platform-小红书小组件-FF2442?style=flat-square" alt="Platform">
  <img src="https://img.shields.io/badge/license-Mulan%20PSL%20v2-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/version-0.1.0-blue?style=flat-square" alt="Version">
</p>

<p align="center">
  一款轻量级的小红书小组件，用于分享和管理学术资源。<br>
  无需后端服务，数据托管在对象存储，支持热更新。
</p>

<p align="center">
  <b>🍠 由小红书 <a href="https://xhslink.com/m/8hVv9FFnXQj">@汤圆键盘坏了不能写论文</a> 开发</b>
</p>

---

## ✨ 特性

- 🚀 **零后端** - 纯静态架构，数据托管在对象存储服务
- 🔄 **热更新** - 修改 JSON 文件即可更新内容，无需重新发布
- 🔍 **实时搜索** - 支持关键词模糊搜索，即时过滤
- 📅 **多维筛选** - 按日期、类型、文件类型筛选资源
- 📋 **一键复制** - 快速复制网盘链接及提取码
- 🌙 **深色模式** - 自动适配系统深色模式

## 📸 预览

<p align="center">
  <img src="./assets/demo.jpeg" width="300" alt="小组件预览">
</p>

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/MingfengHong/xhs-resource-widget.git
```

### 2. 配置数据源

推荐使用对象存储服务托管数据文件：

| 服务商 | 域名白名单 |
|--------|-----------|
| 腾讯云 COS | `myqcloud.com` |
| 阿里云 OSS | `aliyuncs.com` |
| 七牛云 | `qiniudn.com` |

**配置步骤：**

1. 创建存储桶，上传 `resources.json`（参考 `sample-resources.json`）
2. 设置文件为 **公有读** 权限
3. 获取文件访问地址

### 3. 修改配置

**`project.config.json`** - 填入你的小组件 appid：

```json
"appid": "YOUR_APPID_HERE"
```

**`pages/index/index.js`** - 配置数据源地址（第 8 行）：

```javascript
const REMOTE_DATA_URL = 'https://your-bucket.cos.region.myqcloud.com/resources.json';
```

### 4. 配置域名白名单

在小红书开发者后台，将对象存储域名添加到服务器域名白名单。

### 5. 上传发布

使用小红书开发者工具上传并提交审核。

## 📝 数据格式

```json
[
  {
    "id": "001",
    "title": "资源标题",
    "type": "方法分享",
    "url": "https://example.com/file",
    "code": "abc123",
    "codeUrl": "https://github.com/example",
    "codeCode": "",
    "date": "2025-01-15",
    "desc": "资源描述"
  }
]
```

<details>
<summary>📋 字段说明</summary>

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `id` | String | ✅ | 唯一标识符 |
| `title` | String | ✅ | 资源标题 |
| `type` | String | ✅ | 资源类型 |
| `url` | String | ⚡ | 文献/网盘链接 |
| `code` | String | - | 网盘提取码 |
| `codeUrl` | String | ⚡ | 代码仓库链接 |
| `codeCode` | String | - | 代码提取码 |
| `date` | String | - | 发布日期 (YYYY-MM-DD) |
| `desc` | String | - | 资源描述 |

> ⚡ `url` 和 `codeUrl` 至少填写一个

</details>

## 📁 项目结构

```
├── app.js                 # 应用入口
├── app.json               # 应用配置
├── app.css                # 全局样式
├── project.config.json    # 项目配置
├── sample-resources.json  # 示例数据
├── pages/
│   └── index/
│       ├── index.js       # 页面逻辑
│       ├── index.xhsml    # 页面模板
│       ├── index.css      # 页面样式
│       └── index.json     # 页面配置
└── utils/
    └── util.js            # 工具函数
```

## 🔧 日常维护

1. 编辑 `resources.json`，添加新资源
2. 上传到对象存储覆盖原文件
3. 用户下次打开时自动获取最新数据

> 💡 建议同步更新 `LOCAL_FALLBACK_DATA` 作为离线备用

## 👨‍💻 作者

🍠 **@汤圆键盘坏了不能写论文** - [小红书主页](https://xhslink.com/m/8hVv9FFnXQj)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 [木兰宽松许可证, 第2版 (Mulan PSL v2)](LICENSE) 开源。

## ⚠️ 免责声明

本项目仅供学习和学术交流使用，请勿用于商业用途。使用者需自行承担使用本项目的风险。

Readme文件由AI生成。

