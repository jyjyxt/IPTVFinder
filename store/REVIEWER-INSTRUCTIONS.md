# Reviewer test instructions

No login, subscription, API key or special credentials are required.

## Automatic discovery

1. Pin PublicIPTV in the Chrome toolbar.
2. Open https://publiciptv.com/channels/foxus and start the page's video if it does not start automatically.
3. Open the extension. Capture is enabled automatically on normal HTTP/HTTPS tabs; no Start capture click is required.
4. Expect detected HLS addresses for the source actually requested by the player. This is not a scan of every address displayed in the webpage's source list.
5. Search or filter the results, then click Copy or Play.

Public streams can change or be unavailable in some regions. Failure of a third-party channel is not a credential requirement.

## Popup player (independent test)

1. Open the extension and click Player.
2. Paste this public test stream and click Load stream:

   https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8

3. Expect playback in the same popup. Click the native Play control if autoplay is blocked.
4. Choose a quality, use Retry, and return with Back to streams.
5. Closing the popup or returning to the list stops that preview.

The test playlist returned HTTP 200 during preparation; external availability can change.

## Data controls

1. Click Pause capture on a normal web tab. Further media requests in that tab should not add results.
2. Reload that tab. It stays paused and old results are cleared.
3. Click Reload & capture to resume and reload, then play the source video again.
4. Clear removes results; closing a tab removes its session records.

## Reproducible local verification

The public repository includes tests that generate local media with ffmpeg, load the actual extension in Chromium and verify capture, tab isolation, pause persistence, popup playback, HLS quality switching, error recovery and cleanup. Run `npm ci`, `npx playwright install chromium`, `npm test`, and `npm run test:browser` with ffmpeg installed.

No remote executable code is loaded. `extension/vendor/hls.min.js` is the locally bundled player library; its license is included.
