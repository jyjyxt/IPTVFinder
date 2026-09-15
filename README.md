# Public IPTV Finder

A lightweight Chrome extension for discovering and playing streams on the web.
Inspired by the discovery workflow of [cat-catch](https://github.com/xifangczy/cat-catch), independently implemented for Public IPTV. No cat-catch code or assets are included.

## 安装

1. 下载本仓库，或解压 `npm run package` 生成的 `dist/IPTVFinder.zip`。
2. 打开 `chrome://extensions`，开启「开发者模式」。
3. 点击「加载已解压的扩展程序」，选择仓库中的 **extension** 文件夹（ZIP 解压后直接选择包含 manifest.json 的文件夹）。
4. 固定 Public IPTV Finder 到工具栏。需要 Chrome 116 或更新版本。

运行插件不需要 npm 或构建。HLS 播放库已随插件本地打包。

## 使用

- 打开电视台或直播网页，点击插件 → **Start capture**，再在网页中播放。
- 已经播放过时，用 **Reload & capture** 重新加载网页并重新播放。
- 识别 HLS（m3u/m3u8 或对应 MIME）和 MP4/WebM/MOV，按网页标签隔离，包含 iframe 发起的请求。
- 按名称、URL、页面标题搜索，或按 HLS / Video 筛选。
- **Play** 打开独立播放器，**Copy** 复制完整地址（含原有查询参数）。
- 播放器支持 HLS 自适应码率、清晰度选择、原生播放控件、重试、原页面入口和手动输入 URL。自动播放被拦截时，点击视频播放按钮。
- **Pause capture** 停止记录，**Clear** 清空记录。页面导航清空旧记录；新标签页默认不捕获。

## 范围与限制

- 本版不包含提交接口、上传、后台源库或自动发布。
- 捕获结果是候选播放资源，不代表已验证为直播，也不代表有公开分发授权。
- 不采集 Cookie / Authorization，不重放登录凭据或伪造 Referer。依赖这些条件、DRM、特定地区或已过期签名的源可能无法在独立播放器播放，请使用原页面。
- DASH、FLV、UDP/RTP、blob-only/MSE 深度提取不在本版范围。
- 每个标签最多保留最近 150 个不同地址；完全相同 URL 去重，签名和清晰度不同的地址保留。浏览器关闭后记录清除。

## 权限与隐私

详见 [PRIVACY.md](PRIVACY.md)。跨域 CDN 嗅探及直接播放需要 HTTP/HTTPS 主机权限；仅在用户主动开启捕获的标签记录。请求头不保存。播放直接请求视频提供者，不经过 Public IPTV 服务器。

## 开发与验证

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
npm run package
```

浏览器测试自动生成本地 HLS 测试流（需要 ffmpeg），加载真实扩展并验证捕获和实际视频解码。不依赖第三方直播站点。

更新 hls.js 后运行 `npm run vendor` 并提交 vendor 文件。项目代码采用 MIT；hls.js 采用 Apache-2.0，许可证位于 `extension/vendor/HLS-LICENSE.txt`。
