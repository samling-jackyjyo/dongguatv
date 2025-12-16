# 冬瓜TV MAX (DongguaTV Enhanced Edition)

这是一个经过全面重构和升级的现代流媒体聚合播放器，基于 Node.js 和 Vue 3 构建。相比原版，本作引入了 Netflix 风格的沉浸式 UI、TMDb 数据驱动的动态榜单、以及智能的多源聚合搜索功能。

## ✨ 核心特性 (Core Features)

### 1. 🎬 双引擎数据驱动
- **TMDb (The Movie Database)**：提供高质量的电影/剧集元数据（海报、背景图、评分、简介、演职员表）。
- **CMS 聚合源 (Maccms)**：集成多个第三方资源站 API，自动进行**全网测速**，智能过滤失效源，确保播放流畅。

### 2. 🔍 智能搜索与聚合
- **混合搜索**：同时检索 TMDb 和 资源站，将冰冷的资源链接与精美的影视信息自动匹配。
- **自动分组**：同一影片的不同线路（如“蓝光”、“云播”）自动聚合在同一卡片下，避免结果重复。
- **本地缓存**：内置 JSON 文件缓存机制（`search_cache.json`），大幅提升热搜词响应速度，减少上游 API 压力。

### 3. 📺 沉浸式播放体验
- **影院模式**：全新设计的播放详情页，采用暗色系沉浸布局，支持剧集网格选择。
- **线路测速**：实时检测各线路延迟（ms），绿色/黄色/红色圆点直观显示连接质量。
- **投屏支持**：集成 DLNA/AirPlay 本地投屏功能（需浏览器支持）。

---

## 🎨 界面与交互升级 (UI/UX Upgrades)

相比原版，我们在 UI/UX 上做了颠覆性的改进：

| 功能区域 | 原版体验 | **MAX 版体验** |
| :--- | :--- | :--- |
| **首页视觉** | 简单的列表罗列 | **Netflix 风格 Hero 轮播**：全屏动态背景、高斯模糊遮罩、Top 10 排名特效。 |
| **导航栏** | 固定顶部 | **智能融合导航**：初始透明，滚动变黑；分类点击自动平滑滚动定位。 |
| **搜索框** | 顶部固定位置 | **动态交互搜索栏**：初始占满全屏，下滑自动吸顶并缩小为“胶囊”悬浮在右上角。 |
| **榜单浏览** | 有限的静态列表 | **无限滚动 (Infinite Scroll)**：20+ 个细分榜单（悬疑、奇幻、历史等），支持向右无限加载。 |
| **搜索页面** | 普通列表 | **沉浸式搜索**：自动隐藏 Navbar 和 Banner，全屏展示结果，支持一键返回。 |
| **分类系统** | 仅支持搜索跳转 | **全直达榜单**：历史、冒险、综艺等分类均拥有独立的数据流榜单，无需跳转搜索。 |

---

## 🛠️ 技术栈 (Tech Stack)

*   **Frontend**: Vue.js 3 (CDN Mode), Bootstrap 5, FontAwesome 6, Animate.css, DPlayer.
*   **Backend**: Node.js (Express/Http), Axios.
*   **Data Sources**: TMDb API v3, Multiple JSON/XML CMS Interfaces.
*   **Persistence**: Local JSON Cache.

## 📦 安装与运行 (Installation)

1.  **安装依赖**
    ```bash
    npm install
    ```

2.  **配置环境**
    在 `server.js` 中配置您的 API Key 和资源站地址（已内置默认配置）。

3.  **启动服务**
    ```bash
    node server.js
    ```
    或者是使用 Nodemon（开发模式）：
    ```bash
    npx nodemon server.js
    ```

4.  **访问**
    打开浏览器访问 `http://localhost:3000`

## 📝 贡献与致谢

本项目由 **kk爱吃王哥呆阿龟头** 设计编写。
数据由 **TMDb** 和各式 **Maccms** API 提供。

---
*Enjoy your movie night! 🍿*
