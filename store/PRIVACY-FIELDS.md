# Privacy practices — dashboard fields

Prepared from the 0.1.0 source. These are code-based disclosure recommendations; review the dashboard's exact field wording before submitting. No claim of guaranteed store approval is made.

## Single purpose

Discover media stream URLs requested by web pages and preview those streams in the extension popup.

## Permission justifications — paste separately

### webRequest

Observe media response URLs and MIME/status metadata to identify supported HLS and video resources requested by web pages, including embedded frames. Matching results are kept in local session storage and shown in the popup. The extension does not modify requests or read Cookie or Authorization request headers.

### storage

Keep each tab's capture results and paused/enabled state in chrome.storage.session so they survive background service-worker restarts. The extension does not use sync storage. Results are removed on navigation, tab closure, or browser-session end.

### tabs

Read the source page URL and title to associate detected streams with the correct tab, determine whether the selected tab is a supported HTTP/HTTPS page, display source context, and offer an original-page link. The extension does not use the browser history API.

### webNavigation

Detect top-level navigation to start automatic capture before page media requests and clear results belonging to the previous page, while preserving a user's per-tab pause setting.

### Host permissions: http://*/* and https://*/*

Users can discover streams on arbitrary websites whose media may be served from unrelated CDN hosts. Broad HTTP/HTTPS host access is necessary to observe those media responses automatically and fetch a user-selected stream in the local popup player. A fixed domain list or access to only the top-level page would miss cross-origin media. Users can pause capture for a tab. The extension does not upload capture results to a developer server.

## Remote code

Select **No, I am not using remote code**.

All executable JavaScript, including hls.js, is bundled in the extension. Remote playlists and video segments are media data. No remote scripts are loaded or evaluated.

## Data usage

Do not describe the product as handling no data simply because it stores results locally. Recommended categories based on the stored fields:

| Category | Recommendation and scope |
| --- | --- |
| Web history | Declare: source page URL/title and capture time for matching media results. This is temporary per-tab context, not a full history database. |
| Website content | Declare: media URLs and associated response MIME/status metadata used for discovery and preview. The extension does not scrape page text. |
| Authentication information | Conservatively declare: complete media and page URLs can contain signed access tokens in query strings. Cookie/Authorization headers and password fields are not read. |
| Other categories | No intentional collection of names/contact profiles, health or financial data, private communications, location, keystrokes, mouse tracking or analytics. Do not infer these categories merely from arbitrary text that could appear in a URL. Reassess if functionality changes. |

The extension does not sell user data, use or transfer it for unrelated purposes, or use it to determine creditworthiness or for lending. The corresponding three certifications are consistent with the current implementation. Playback requests go directly to the provider selected by the user; the provider receives ordinary network information, including the IP address and requested URL.

## Privacy policy URL

https://github.com/jyjyxt/IPTVFinder/blob/main/PRIVACY.md

The corresponding raw policy returned HTTP 200 during preparation. The live policy still uses the previous product name; publish the renamed local PRIVACY.md before submission, then recheck anonymous access. Data handling is unchanged.

## Review considerations

Automatic capture is a core feature and is disclosed in the listing and popup. The broad host permissions should be justified with that behavior and cross-origin CDNs. Do not promise a specific review time. This document does not change capture behavior or add a consent screen.

## Official references

- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/program-policies/user-data-faq (including local-only storage and privacy policies)
- https://developer.chrome.com/docs/webstore/program-policies/disclosure-requirements/
