# Chrome Web Store listing

## Basic fields

| Field | Value |
| --- | --- |
| Name | PublicIPTV |
| Version | 0.1.0 |
| Language | English |
| Suggested category | Tools (choose the matching category in the dashboard) |
| Price | Free |
| Homepage | https://github.com/jyjyxt/IPTVFinder |
| Support URL | https://github.com/jyjyxt/IPTVFinder/issues |
| Privacy policy URL | https://github.com/jyjyxt/IPTVFinder/blob/main/PRIVACY.md |

The manifest supplies the name and short description. Its current short description is:

> Find HLS and video streams on a page, then preview them in your browser. Local only.

## Detailed description — paste into the store

Discover video stream URLs requested by the websites you visit, then preview them directly inside the extension popup.

PublicIPTV automatically listens for supported media requests on HTTP and HTTPS tabs. Start a video on a website and open the extension to see the streams that page requested. Capture begins during page loading, so you do not need to press Start capture first.

FEATURES

• Detect HLS playlists (m3u/m3u8) and MP4, WebM and MOV resources by URL or supported response MIME type.
• Keep results separate for each browser tab, including requests from embedded frames.
• Search by name, URL or page title, and filter by media format.
• Copy a complete stream URL or preview it inside the popup.
• Switch between available HLS quality levels, retry playback or paste a stream address.
• Pause capture, clear results or reload the page with capture enabled.

LOCAL, TEMPORARY RESULTS

The extension temporarily stores matching media URLs, response type/status, source page title/address and capture time in Chrome session storage. It keeps up to 150 different addresses per tab. Navigation clears that tab's results, closing the tab removes its records, and closing the browser clears the session. A manual pause stays in effect across reloads and navigation in that tab.

No account, analytics or developer collection server is used. Results are not uploaded to Public IPTV. Playback connects directly to the stream provider. Complete URLs can contain signed tokens or other query parameters; copying an address includes those parameters. The extension does not read request cookies or Authorization headers.

WHAT TO EXPECT

Only media requests actually made by the page are detected. Links merely listed in page text are not automatically extracted. Closing the popup stops playback. You may need to click Play if the browser blocks autoplay.

This is a stream discovery and preview tool. It does not include a channel subscription, video downloads, DRM bypass or access to paid content. Some streams require the original website, an unexpired address, a supported codec or a specific region. Use it with content you are authorized to access.

## Image upload order

1. `assets/01-discover.png` — 1280 × 800, actual capture interface.
2. `assets/02-play.png` — 1280 × 800, actual popup playback.

Store icon: `assets/icon-128.png` (128 × 128).

Small promotional tile: `assets/promo-440x280.png` (440 × 280).

The screenshots use locally generated test media, with no third-party channel logos or footage. The logo is copied from the sibling Public IPTV project. These are presentation screenshots of the actual running UI; surrounding explanatory text is not part of the extension.
