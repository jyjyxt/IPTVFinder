# Privacy

Public IPTV Finder has no submission feature, analytics, accounts, or backend.

Capture is off for each new tab. Starting capture records matching HTTP/HTTPS video request URLs, response MIME/status, page title, page URL, and capture time for that tab. Records use Chrome session storage, are cleared on navigation or tab closure, and discarded when the browser closes. You can pause capture or clear records in the popup. URLs may contain sensitive query parameters; copying a URL includes those parameters.

The extension does not read or save request cookies or authorization headers. It does not upload captures to Public IPTV or any collection service. Playback sends requests directly to the stream provider, which can see your IP address and ordinary request information. Opening the original page connects to that destination.

Permissions:
- webRequest: recognize media URLs and response MIME types in enabled tabs.
- HTTP/HTTPS hosts: observe requests from sites and their cross-origin media CDNs; fetch streams from the extension player.
- tabs: associate captures with source pages, reload the chosen page, and open the player.
- storage: temporary capture state across service-worker restarts.
- webNavigation: clear old captures when the top-level page navigates.

No remote executable code is loaded. hls.js is bundled locally.
