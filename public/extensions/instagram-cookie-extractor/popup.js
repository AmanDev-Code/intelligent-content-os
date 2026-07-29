// Trndinn Instagram Session Pool Extractor — popup.js (v2)
//
// Extracts ALL cookies (complete jar, not just 5) and sends them to the
// media engine's session pool endpoint. Each browser profile = one account
// in the pool. Run in N profiles → N accounts rotating automatically.

// Critical cookies (used to identify the account and validate session)
const CRITICAL_COOKIES = ['sessionid', 'csrftoken', 'ds_user_id', 'ig_did', 'mid'];

// DOM references
const backendUrlInput = document.getElementById('backend-url');
const adminTokenInput = document.getElementById('admin-token');
const extractBtn = document.getElementById('extract-btn');
const resultDiv = document.getElementById('result');
const accountBadge = document.getElementById('account-badge');
const cookieSummary = document.getElementById('cookie-summary');
const cookieStats = document.getElementById('cookie-stats');
const backendSaved = document.getElementById('backend-saved');
const tokenSaved = document.getElementById('token-saved');

// ─── Initialization ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['trndinn_backend_url', 'trndinn_admin_token'], (data) => {
    if (data.trndinn_backend_url) {
      backendUrlInput.value = data.trndinn_backend_url;
      backendSaved.textContent = 'Saved';
    }
    if (data.trndinn_admin_token) {
      adminTokenInput.value = data.trndinn_admin_token;
      tokenSaved.textContent = 'Saved';
    }
  });

  // Check current session on open
  detectAccount();
});

// Save settings on change
backendUrlInput.addEventListener('change', () => {
  const val = backendUrlInput.value.trim();
  chrome.storage.local.set({ trndinn_backend_url: val });
  backendSaved.textContent = val ? 'Saved' : '';
});

adminTokenInput.addEventListener('change', () => {
  const val = adminTokenInput.value.trim();
  chrome.storage.local.set({ trndinn_admin_token: val });
  tokenSaved.textContent = val ? 'Saved' : '';
});

// ─── Account Detection ───────────────────────────────────────────────────────

async function detectAccount() {
  try {
    const cookies = await chrome.cookies.getAll({ domain: '.instagram.com' });
    const cookieMap = buildCookieMap(cookies);

    const dsUserId = cookieMap['ds_user_id'];
    const sessionId = cookieMap['sessionid'];

    if (!sessionId || !dsUserId) {
      accountBadge.innerHTML = `
        <div class="no-session">No Instagram session detected. Log in to Instagram in this browser first.</div>
      `;
      extractBtn.disabled = true;
      return;
    }

    // Show account info
    const initial = dsUserId.slice(0, 2).toUpperCase();
    accountBadge.innerHTML = `
      <div class="avatar">${initial}</div>
      <div class="info">
        <div class="username">Account ${dsUserId}</div>
        <div class="account-id">ds_user_id: ${dsUserId} · ${cookies.length} cookies</div>
      </div>
    `;

    // Show cookie stats
    const criticalFound = CRITICAL_COOKIES.filter(n => cookieMap[n]).length;
    const totalFound = cookies.length;

    cookieSummary.style.display = 'block';
    cookieStats.innerHTML = `
      <div class="stat"><span class="dot ${criticalFound === CRITICAL_COOKIES.length ? 'dot-green' : 'dot-yellow'}"></span>${criticalFound}/${CRITICAL_COOKIES.length} critical</div>
      <div class="stat"><span class="dot dot-green"></span>${totalFound} total cookies</div>
    `;

    extractBtn.disabled = false;
  } catch (err) {
    accountBadge.innerHTML = `
      <div class="no-session">Cannot read cookies. Visit instagram.com while logged in.</div>
    `;
    extractBtn.disabled = true;
  }
}

// ─── Extract & Send to Pool ──────────────────────────────────────────────────

extractBtn.addEventListener('click', async () => {
  const backendUrl = backendUrlInput.value.trim() || 'http://localhost:3000';
  const adminToken = adminTokenInput.value.trim();

  if (!adminToken) {
    showResult('error', 'Admin token is required');
    return;
  }

  extractBtn.disabled = true;
  extractBtn.textContent = 'Extracting…';
  hideResult();

  try {
    // Get ALL instagram cookies (complete jar)
    const cookies = await chrome.cookies.getAll({ domain: '.instagram.com' });
    const cookieMap = buildCookieMap(cookies);

    if (!cookieMap['sessionid']) {
      showResult('error', 'sessionid cookie not found. Log in to Instagram first.');
      return;
    }

    const accountId = cookieMap['ds_user_id'] || 'unknown';

    // Build the full cookie jar (ALL cookies, not just the 5 critical ones)
    const fullCookieJar = {};
    for (const cookie of cookies) {
      fullCookieJar[cookie.name] = cookie.value;
    }

    // Send to the session pool endpoint
    const url = `${backendUrl.replace(/\/$/, '')}/admin/media-engine/sessions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        accountId,
        platform: 'instagram',
        cookies: fullCookieJar,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.message || errJson.error || errText;
      } catch {
        errMsg = errText;
      }
      showResult('error', `HTTP ${response.status}: ${errMsg}`);
      return;
    }

    const data = await response.json();
    showResult(
      'success',
      `✓ Account ${accountId} added to session pool!\n${cookies.length} cookies stored.\nPool size: ${data.poolSize || '?'} accounts`
    );

    // Also save to the legacy endpoint for backward compat
    await saveLegacyCredentials(backendUrl, adminToken, cookieMap);

  } catch (err) {
    showResult('error', `Network error: ${err.message}`);
  } finally {
    extractBtn.disabled = false;
    extractBtn.textContent = 'Extract & Add to Pool';
  }
});

// ─── Legacy backward compat ──────────────────────────────────────────────────

async function saveLegacyCredentials(backendUrl, adminToken, cookieMap) {
  try {
    const body = { verify: false };
    const mapping = {
      sessionid: 'instagramSession',
      csrftoken: 'instagramCsrfToken',
      ds_user_id: 'instagramDsUserId',
      ig_did: 'instagramIgDid',
      mid: 'instagramMid',
    };

    for (const [cookieName, bodyKey] of Object.entries(mapping)) {
      if (cookieMap[cookieName]) {
        body[bodyKey] = cookieMap[cookieName];
      }
    }

    const url = `${backendUrl.replace(/\/$/, '')}/admin/scraper/credentials`;
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(body),
    });
  } catch {
    // Non-critical — don't block
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCookieMap(cookies) {
  const map = {};
  for (const c of cookies) {
    map[c.name] = c.value;
  }
  return map;
}

function showResult(type, message) {
  resultDiv.style.display = 'block';
  resultDiv.className = `result ${type}`;
  resultDiv.textContent = message;
}

function hideResult() {
  resultDiv.style.display = 'none';
}
