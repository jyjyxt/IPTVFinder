# Chrome Web Store 发布材料

## 本次交付

| 材料 | 文件 |
| --- | --- |
| 上传安装包 | [PublicIPTV.zip](../dist/PublicIPTV.zip) |
| 英文商店文案、链接及图片顺序 | [LISTING.md](LISTING.md) |
| 单一用途、权限理由、数据声明 | [PRIVACY-FIELDS.md](PRIVACY-FIELDS.md) |
| 审核测试步骤 | [REVIEWER-INSTRUCTIONS.md](REVIEWER-INSTRUCTIONS.md) |
| 商店图标 | [icon-128.png](assets/icon-128.png) |
| 宣传图 | [promo-440x280.png](assets/promo-440x280.png) |
| 自动捕获截图 | [01-discover.png](assets/01-discover.png) |
| 弹出框播放截图 | [02-play.png](assets/02-play.png) |

版本：`0.1.0`。本目录是发布准备材料；尚未上传或提交 Chrome Web Store 审核。

## 上传步骤

1. 登录 [Chrome Web Store 开发者后台](https://chrome.google.com/webstore/devconsole)。首次使用需完成开发者注册、后台要求的注册费、联系邮箱验证和 Google 账号两步验证。
2. 新建扩展，上传 `dist/PublicIPTV.zip`。`manifest.json` 位于 ZIP 根目录。
3. 按 `LISTING.md` 填写商店页。默认英文、免费；分发地区和公开范围按你的发布需求选择。
4. 上传 128 × 128 图标、两张 1280 × 800 截图和 440 × 280 宣传图。图片使用与 Public IPTV 一致的新 logo。
5. 按 `PRIVACY-FIELDS.md` 填写用途和权限理由，并声明本地处理的数据类别；填入可匿名访问的隐私政策链接。
6. 填入 `REVIEWER-INSTRUCTIONS.md` 中的测试说明。不需要测试账号。
7. 检查后台所有必填项。确认材料、开发者信息及分发范围后，再点击 Submit for review；可按需要选择审核通过后自动发布或手动发布。

账号注册/验证状态和商店后台字段尚未登录核实。已有公开隐私政策链接可用；线上仍使用旧名称，提交审核前需把本地已改名的 `PRIVACY.md` 同步到 GitHub，无需另建网站。支持邮箱可使用你在开发者后台验证的邮箱；本仓库作者邮箱为 `im.jyjyxt@gmail.com`，未代为验证。

## 重建与验证

```sh
npm test
npm run store:assets
npm run package
```

`store:assets` 需要 ffmpeg 和 Playwright Chromium：它运行真实浏览器测试，生成演示截图和宣传图。截图中的视频为本地生成的测试图案。logo 原始文件为 `extension/icons/source.png`，复制自 `../publiciptv/public/logo.png`；16/48/128 图标使用同一源图缩放。

图标和截图保存在 Git 可跟踪的 `store/assets`；ZIP 在被忽略的 `dist` 中，可按需重建。只有 `extension` 的运行时文件进入安装包，发布说明和截图不会混入扩展。

## 核对依据

- [图片规范](https://developer.chrome.com/docs/webstore/images)：图标、截图和小宣传图。
- [隐私字段](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)：单一用途、权限和数据用途。
- [隐私政策 FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)：本地存储也需要隐私说明。
- [发布流程](https://developer.chrome.com/docs/webstore/publish)：上传 ZIP、填资料、提交审核。
- [开发者账号设置](https://developer.chrome.com/docs/webstore/set-up-account)：开发者名称、联系邮箱验证等。

准备日期：2026-09-15。Google 后台实际可选项和审核结论以提交时为准。
