# 山河足迹

中国省份与城市旅行足迹地图。支持全国省份/城市高亮、逐城点亮、悬停名称、缩放拖动与海南独立附图。

记录保存在访问者自己的浏览器中，不上传到 GitHub。更换网站地址后，浏览器不会自动迁移旧地址的足迹。

## 开发

需要 Node.js 22.13 以上。运行 `npm ci` 后通过 `npm run dev` 启动；运行 `npm run build` 更新 `docs/` 静态站点。

## GitHub Pages

在仓库 Settings → Pages 中选择 Deploy from a branch，分支 `main`，目录 `/docs`。

地图数据来自阿里云 DataV，包含 369 个城市及同级目的地；具体统计口径见网页底部。台湾市县边界暂缺。
