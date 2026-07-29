# Trndinn — Instagram Cookie Extractor (Chrome Extension)

A Chrome extension that extracts Instagram session cookies from your browser and sends them directly to the Trndinn backend. No more manual copy-pasting from DevTools.

## Installation

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select this folder (`frontend/public/extensions/instagram-cookie-extractor/`)
5. Pin the extension to your toolbar for easy access

## Usage

1. Navigate to [instagram.com](https://www.instagram.com) and make sure you are **logged in**
2. Click the Trndinn extension icon in your toolbar
3. Set your **Backend URL** (e.g., `http://localhost:3000` or your production URL) — saved automatically
4. Set your **Admin Token** (the JWT from your admin session) — saved automatically
5. Click **"Extract & Save"**
6. The extension will:
   - Read your Instagram cookies (`sessionid`, `csrftoken`, `ds_user_id`, `ig_did`, `mid`)
   - Show which cookies were found or missing
   - Send them to your backend's `/admin/scraper/credentials` endpoint
   - Display the health check result

## Cookies Extracted

| Cookie | Purpose |
|--------|---------|
| `sessionid` | Main session identifier (required) |
| `csrftoken` | CSRF protection token |
| `ds_user_id` | Your Instagram user ID |
| `ig_did` | Device ID |
| `mid` | Machine ID |

## Troubleshooting

- **"sessionid cookie not found"** — Make sure you are logged in to Instagram in Chrome (not just the extension browser). Visit instagram.com and verify you see your feed.
- **Network error** — Check that your backend URL is correct and the server is running. If using HTTPS, make sure the certificate is valid.
- **401 Unauthorized** — Your admin token is expired or invalid. Get a fresh token from the admin panel.
- **Cookies showing as "Missing"** — Instagram may not have set all cookies yet. Browse a few pages on Instagram and try again.

## Security Notes

- Your admin token is stored in `chrome.storage.local` (encrypted at rest by Chrome, per-profile)
- Cookie values are sent over the network to your backend only — never to any third party
- The extension only has permission to read cookies from `.instagram.com`
