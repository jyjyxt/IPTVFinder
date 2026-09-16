# PublicIPTV 发布前版权与商店政策检查

日期：2026-09-15。范围：实际 `dist/PublicIPTV.zip`、发布图片和审核文案，以及本地可取得的依赖/品牌来源。本检查不是商标检索、专利检索或法律意见，不能保证 Google 审核结果。

## 结论

未在 ZIP 中发现内置电视频道清单、第三方影视文件或电视台标志。hls.js 有允许再分发的开源许可证；发现的许可证材料缺口已补齐。

仍不能判定“版权全部通过”：logo 的原创/商用授权证据尚未确认；`publiciptv.com` 所链接频道的播放授权未验证，审核说明当前以 Fox 频道为示例。不要把 HTTP 200、公开可访问或网站属于自己当作节目传播授权。

## 分项结果

| 项目 | 证据与判断 | 状态 |
| --- | --- | --- |
| 本项目代码 | ZIP 包含 `Copyright (c) 2026 jyjyxt` 的 MIT 声明。未做全网代码相似性/作者权属取证，声明本身不是原创证明。 | 未发现直接问题，溯源范围有限 |
| hls.js 1.7.3 | ZIP 中的文件与本地安装包 `dist/hls.min.js` 字节一致；上游 LICENSE 标注 Apache-2.0，并包含 Dailymotion/Brightcove 归属。 | 允许依许可证分发 |
| Apache 许可证全文 | 原 ZIP 只有短声明和许可证链接，没有完整条款。Apache 2.0 第 4(a) 要求向接收者提供许可证副本。已加入全文。 | 已补齐 |
| hls.js 组件声明 | 源码还含 DASH Industry Forum 的 BSD 声明、vtt.js Contributors 和 Masanao Izumo 的版权说明。已随包附加保留。 | 已补齐 |
| Logo | `icons/source.png` 与 `../publiciptv/public/logo.png` 字节一致；16/48/128 图标由它缩放。相邻仓库中未找到可确认这张图商用权利的许可证文件。Git 历史不能替代作者/购买授权。 | 待确认来源及商用授权 |
| PublicIPTV 名称 | 使用项目名不构成自动侵权结论；未做目标市场商标近似检索或权属确认。 | 未完成商标清查 |
| ZIP 内媒体 | 包内为代码、图标、说明及许可证，无内置频道播放列表、影视文件或台标。 | 未发现媒体再分发素材 |
| 商店截图 | 由实际扩展和 ffmpeg 本地测试图案生成，无第三方节目画面。图中品牌 logo 的风险同上。 | 测试画面来源明确 |
| 功能与外链 | 功能包含提取/复制媒体 URL 和弹出框播放；未见应用代码实施 DRM 解密绕过、付费墙绕过或 Cookie/Authorization 重放。manifest 主页指向 publiciptv.com，审核说明引用 Fox 频道。相关节目授权未验证。 | 存在有条件的审核风险 |

## 已实施的补齐

- 新增 `extension/vendor/APACHE-2.0.txt`：从 Apache 官方文本地址下载的完整许可证。
- 新增 `extension/vendor/THIRD-PARTY-NOTICES.txt`：从当前 hls.js 源码提取并保留组件声明。
- 更新 `scripts/vendor.js`，以后复制播放器库时同步生成声明，并检查完整 Apache 许可证存在。
- 重建 `dist/PublicIPTV.zip`；验证 ZIP 完整性、三份许可证/声明均在包内，并确认播放器 JS 未被修改。

原始受检 ZIP SHA-256：

`d6b62aac521ff7090f99181646eeef678049dfcdc09ef082df2d153a2ad7aa57`

补齐后 ZIP SHA-256：

`27a69f0deec5bc4a2a97782a28a777f6133c75950b9c15a6ec3c9d8d12a78686`

## 提交前仍应处理

1. 确认 logo 是原创、委托且取得相应权利，或素材许可允许用于商业软件/品牌标志；保存原始设计文件、合同或许可证。已有网站使用同一图片，不足以单独证明这一点。
2. 核实审核示例和产品关联内容的授权。无法确认 Fox 示例授权时，改为自有生成媒体或明确允许该用途的测试素材；不能只改示例来掩盖产品实际提供的未授权内容。
3. 对网站实际提供/推广的频道另做授权检查。本次没有审计整个 publiciptv 网站，不能替其确认节目许可。
4. 保持文案与实际功能一致：通用发现/预览工具，无付费频道授权、无绕过限制功能。现有免责声明不能代替授权，也不能排除权利人投诉。

## 政策与许可证依据

- [Google：禁止产品](https://developer.chrome.com/docs/webstore/program-policies/malicious-and-prohibited/)：禁止协助未授权访问、下载或在线播放受版权保护的媒体，亦禁止绕过付费/登录限制。
- [Google：冒充和知识产权](https://developer.chrome.com/docs/webstore/program-policies/impersonation-and-intellectual-property)：覆盖版权、商标等权利，不允许虚假授权/背书。
- [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0)：第 2、4 条涉及复制、分发和许可证/归属保留条件。
- [hls.js v1.7.3 LICENSE](https://github.com/video-dev/hls.js/blob/v1.7.3/LICENSE)：对应本地打包版本。

流媒体工具并不因为名称含 IPTV 就自动禁止；是否涉及未经授权内容、如何推广及具体审核证据，才是本次识别出的关键风险。此句为结合当前实现与上述政策作出的判断，不是 Google 对本产品的预先批准。
