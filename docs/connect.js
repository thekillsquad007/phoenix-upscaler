/* "Connect Phoenix": the OAuth consent page (authorization endpoint).
 *
 * An MCP app sends the user here with a standard OAuth 2.1 request. The page
 * asks the Worker whether the client and its redirect_uri are real
 * (studio_worker/src/oauth.ts), shows who is asking and where the user will
 * be sent back to, and on Allow uses the wallet key this browser already
 * keeps for Phoenix Motion to create the connection. The app then gets a
 * code, and from it tokens that stand for a capped agent key.
 *
 * Nothing redirects anywhere until the Worker has confirmed the redirect_uri
 * belongs to the client.
 */

const API = (() => {
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === "file:";
  const q = new URLSearchParams(location.search).get("api");
  if (q && local) return q.replace(/\/$/, "");
  if (local) return "http://127.0.0.1:8787";
  return "https://api.phoenixlabs.space";
})();
const ISSUER = "https://api.phoenixlabs.space";
const KEY_STORE = "phoenix_motion_key_v1"; // shared with Phoenix Motion

const $ = (s) => document.querySelector(s);
const money = (cents) => `$${(cents / 100).toFixed(2)}`;
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

const params = new URLSearchParams(location.search);
const req = {
  response_type: params.get("response_type") || "",
  client_id: params.get("client_id") || "",
  redirect_uri: params.get("redirect_uri") || "",
  code_challenge: params.get("code_challenge") || "",
  code_challenge_method: params.get("code_challenge_method") || "",
  state: params.get("state"),
  scope: params.get("scope") || "",
  resource: params.get("resource") || "",
};
let key = store.get(KEY_STORE);
let verifiedRedirect = null; // set only after the Worker confirms it

function show(id) {
  ["loading", "problem", "consent"].forEach((s) => $(`#${s}`).classList.toggle("hidden", s !== id));
}

function problem(text) {
  $("#problemText").textContent = text;
  show("problem");
}

/** Send the user back with an OAuth error; only ever to a confirmed redirect_uri. */
function redirectWith(error, description) {
  if (!verifiedRedirect) { problem(description); return; }
  const back = new URL(verifiedRedirect);
  back.searchParams.set("error", error);
  if (description) back.searchParams.set("error_description", description);
  if (req.state !== null) back.searchParams.set("state", req.state);
  back.searchParams.set("iss", ISSUER);
  location.assign(back.toString());
}

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && key) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error_description || data.detail || `Request failed (${res.status})`), { status: res.status });
  return data;
}

async function loadWallet() {
  $("#walletHave").classList.add("hidden");
  $("#walletNone").classList.add("hidden");
  if (key) {
    try {
      const { wallet } = await api("/wallet", { auth: true });
      $("#balance").textContent = money(wallet.balance_cents);
      $("#walletHave").classList.remove("hidden");
      $("#allow").disabled = false;
      return;
    } catch {
      key = null; // a key from another database, or revoked: treat as none
    }
  }
  $("#walletNone").classList.remove("hidden");
  $("#allow").disabled = true;
}

async function useKey() {
  const k = $("#walletKey").value.trim();
  if (!/^pmk_[0-9a-f]{64}$/.test(k)) return;
  key = k;
  try {
    await api("/wallet", { auth: true });
    store.set(KEY_STORE, k);
  } catch {
    key = null;
    $("#walletKey").setCustomValidity("That wallet key isn't recognised.");
    $("#walletKey").reportValidity();
    return;
  }
  await loadWallet();
}

async function createWallet() {
  const btn = $("#createWallet");
  btn.disabled = true;
  try {
    const r = await api("/wallet", { method: "POST", body: {} });
    key = r.key;
    store.set(KEY_STORE, key);
    await loadWallet();
  } catch (e) {
    problem(e.message);
  } finally {
    btn.disabled = false;
  }
}

async function allow() {
  const dollars = Number($("#limit").value);
  if (!(dollars >= 1 && dollars <= 1000)) {
    $("#limit").setCustomValidity("Set a limit between $1 and $1,000.");
    $("#limit").reportValidity();
    return;
  }
  $("#limit").setCustomValidity("");
  const btn = $("#allow");
  btn.disabled = true;
  btn.textContent = "Connecting…";
  try {
    const r = await api("/oauth/authorize", {
      method: "POST", auth: true,
      body: { ...req, limit_cents: Math.round(dollars * 100), label: $("#label").value.trim() },
    });
    location.assign(r.redirect);
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "Allow";
    problem(e.message);
  }
}

async function init() {
  document.documentElement.classList.remove("no-js");
  if (!req.client_id || !req.redirect_uri) { problem("It's missing the app's details (client_id and redirect_uri)."); return; }
  let client;
  try {
    client = await api(`/oauth/client?client_id=${encodeURIComponent(req.client_id)}&redirect_uri=${encodeURIComponent(req.redirect_uri)}`);
  } catch (e) {
    problem(e.message);
    return;
  }
  verifiedRedirect = req.redirect_uri;
  if (req.response_type !== "code") { redirectWith("unsupported_response_type", "Only response_type=code is supported."); return; }
  if (req.code_challenge_method !== "S256" || !req.code_challenge) {
    redirectWith("invalid_request", "PKCE with code_challenge_method S256 is required.");
    return;
  }
  $("#appName").textContent = client.client_name;
  $("#redirectHost").textContent = client.redirect_host;
  $("#loopbackWarn").classList.toggle("hidden", !client.loopback);
  $("#label").value = client.client_name.slice(0, 60);
  document.title = `Connect ${client.client_name} to Phoenix`;
  show("consent");
  await loadWallet();

  $("#allow").addEventListener("click", allow);
  $("#deny").addEventListener("click", () => redirectWith("access_denied", "The user said no."));
  $("#createWallet").addEventListener("click", createWallet);
  $("#showUseKey").addEventListener("click", () => { $("#useKeyField").classList.remove("hidden"); $("#walletKey").focus(); });
  $("#walletKey").addEventListener("input", () => { $("#walletKey").setCustomValidity(""); useKey(); });
}

init();
