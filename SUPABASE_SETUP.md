# 开通云同步

网站代码已接入邮箱登录、按城市云同步、本地离线队列、访客足迹合并及 JSON 备份。`public/cloud-config.json` 为空时只启用本地模式。

1. 在 https://supabase.com/dashboard 创建或选择你自己的项目。创建新项目时选择适合的地区和方案；数据库密码由项目所有者自行设置，不需要发给网站用户或写进代码。
2. 在 SQL Editor 中执行 `supabase/migrations/001_city_visits.sql`。该迁移新建 `city_visits`，启用强制 RLS；匿名访问无表权限，登录用户只能读取、插入、更新自己的行。
3. Authentication → URL Configuration：Site URL 设为 `https://ijokerpro.github.io/shanhe-footprints/`；把相同网址加入 Redirect URLs。开发调试时另加实际本地网址。
4. 启用 Email provider。保留默认 Magic Link 邮件模板即可。Supabase 内置邮件服务有收件人与速率限制；供其他人使用前应配置自己的 SMTP 并验证发信。
5. 在项目 Connect/API Keys 页面取得 Project URL 和 Publishable key。只将它们填写到 `public/cloud-config.json`：

   ```json
   {"url":"https://你的项目.supabase.co","publishableKey":"sb_publishable_公开密钥"}
   ```

   不可填写 `sb_secret_`、service_role、数据库密码或管理访问令牌。配置器会拒绝非公开密钥。
6. 运行 `npm run build`，提交新的 `docs/` 后推送到 GitHub。GitHub Pages 自动发布。

## 上线验证（项目就绪后必须做）

- 匿名请求不能读取或写入 `city_visits`。
- 使用两个不同测试账号：A 不能读、修改 B 的记录，不能伪造 B 的 user_id 插入。
- 用户 A 在设备 1 点亮一座城，设备 2 登录后可读到；取消点亮也能同步。
- 切换账号或退出后，不显示上一账号的数据；未同步修改保留在该账号独立缓存里。
- 断网修改后显示待同步，恢复网络重试；正在同步时再次修改同一城市，新修改不能丢失。
- 首次登录不自动上传访客记录；点击“导入本机足迹”才合并。备份导入只合并，不清空当前记录。

## 已知边界

- 这不是端到端加密；项目管理员及数据库服务方在权限允许的情况下可以访问数据库。用户间的数据隔离由 RLS 实现。
- 多设备同时修改同一城市时，以最后被服务器接受的修改为准；不同城市的修改互不覆盖。
- 云端记录每分钟或窗口重新聚焦、网络恢复时刷新，也可手动同步。
- 浏览器缓存、登录会话仍应只保存在可信设备上。
- 免费项目需要自行安排异地备份；“导出备份”下载的是当前用户的城市记录，不等同于数据库全量备份。
- localhost 与 GitHub Pages 为不同来源，不能直接读取对方本地存储。可在旧网址导出备份后，在新网址导入。

官方参考：
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/auth-smtp
