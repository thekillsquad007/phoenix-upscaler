/* Phoenix Motion: image in, 5-second clip out, paid from a dollar balance.
 *
 * Talks to the Worker's /motion/* routes (studio_worker/src/motion.ts).
 * The wallet key in localStorage is the whole identity; the top-up receipt
 * links back here with it in the URL fragment (#key=...), which browsers never
 * send to a server.
 */

const API = (() => {
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === "file:";
  const q = new URLSearchParams(location.search).get("api");
  if (q && local) return q.replace(/\/$/, "");
  if (local) return "http://127.0.0.1:8787";
  return "https://api.phoenixlabs.space";
})();

const KEY_STORE = "phoenix_motion_key_v1";
const PREV_KEY_STORE = "phoenix_motion_prev_key_v1";
const MAX_EDGE = 2048; // images are shrunk to this before upload; the model uses far less
const POLL_MS = 4000;

// Storage can throw (private windows, blocked site data); the page still works.
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: (k) => { try { localStorage.removeItem(k); } catch {} },
};

const $ = (s) => document.querySelector(s);
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

let key = store.get(KEY_STORE);
let config = null;
let wallet = null;
let picked = null; // { blob, url, width, height }
let size = "480p";
let topupCents = null;
let pollTimer = null;
const clips = new Map(); // job id -> job

// ── API ──────────────────────────────────────────────────────────────────────

async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && key) headers.Authorization = `Bearer ${key}`;
  let res;
  try {
    res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw Object.assign(new Error("Couldn't reach Phoenix. Check your connection and try again."), { status: 0 });
  }
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw Object.assign(new Error(data.detail || `Request failed (${res.status})`), { status: res.status, data });
  return data;
}

function toast(msg, isError = false) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("error", isError);
  el.classList.remove("hidden");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.add("hidden"), isError ? 7000 : 4000);
}

// ── Wallet ───────────────────────────────────────────────────────────────────

function setWallet(w) {
  if (!w) return;
  wallet = w;
  $("#balanceAmount").textContent = money(w.balance_cents);
  if (w.email && !$("#email").value) $("#email").value = w.email;
  updateMakeButton();
}

async function ensureWallet() {
  if (key) return;
  const r = await api("/motion/wallet", { method: "POST", body: {} });
  key = r.key;
  store.set(KEY_STORE, key);
  setWallet(r.wallet);
}

async function loadWallet() {
  if (!key) return null;
  try {
    const r = await api("/motion/wallet", { auth: true });
    setWallet(r.wallet);
    return r.wallet;
  } catch (e) {
    if (e.status === 401) {
      // A key this server has never seen (another environment, or deleted).
      store.del(KEY_STORE);
      key = null;
      toast("That wallet key isn't recognised, so a fresh wallet will be made when you need one.", true);
    }
    return null;
  }
}

function importKeyFromLink() {
  const m = location.hash.match(/key=(pmk_[0-9a-f]{64})/);
  if (!m) return;
  if (key && key !== m[1]) store.set(PREV_KEY_STORE, key);
  key = m[1];
  store.set(KEY_STORE, key);
  history.replaceState(null, "", location.pathname + location.search);
}

// After checkout the webhook usually lands within seconds; watch for it.
async function watchTopup() {
  const params = new URLSearchParams(location.search);
  if (!params.get("topup") || !key) return;
  history.replaceState(null, "", location.pathname);
  const before = wallet ? wallet.balance_cents : 0;
  toast("Payment received. Adding it to your balance…");
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const w = await loadWallet();
    if (w && w.balance_cents > before) {
      toast(`Balance added. You have ${money(w.balance_cents)}.`);
      return;
    }
  }
  toast("Your payment is taking a while to arrive. Refresh in a minute; it won't be lost.", true);
}

// ── Sizes and the make button ────────────────────────────────────────────────

function priceOf(s) {
  const q = config?.sizes.find((x) => x.size === s);
  return q ? q.amount_cents : null;
}

function renderSizes() {
  const box = $("#sizes");
  config.sizes.forEach((q, i) => {
    const label = document.createElement("label");
    label.className = "m-size";
    const input = Object.assign(document.createElement("input"), { type: "radio", name: "size", value: q.size, checked: i === 0 });
    input.addEventListener("change", () => { size = q.size; updateMakeButton(); });
    const span = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = q.size;
    const small = document.createElement("small");
    small.textContent = `${q.display} a clip${q.size === "720p" ? " · sharper" : " · fastest"}`;
    span.append(strong, small);
    label.append(input, span);
    box.append(label);
  });
  size = config.sizes[0].size;
}

function updateMakeButton() {
  const btn = $("#makeBtn");
  const price = priceOf(size);
  const ready = Boolean(picked && $("#prompt").value.trim() && price);
  btn.disabled = !ready;
  btn.textContent = price ? `Make clip · ${money(price)}` : "Make clip";
  const note = $("#makeNote");
  if (price && wallet && wallet.balance_cents < price) {
    note.textContent = `You have ${money(wallet.balance_cents)}. Add to your balance to make this clip.`;
  } else {
    note.textContent = "Paid from your balance. If a clip fails, the price goes straight back.";
  }
}

// ── Image ────────────────────────────────────────────────────────────────────

async function prepareImage(file) {
  if (!config.image_types.includes(file.type)) throw new Error("Use a JPEG, PNG or WebP image.");
  // Re-encoding also drops the photo's metadata, GPS location included.
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const width = Math.max(1, Math.round(bmp.width * scale));
  const height = Math.max(1, Math.round(bmp.height * scale));
  const canvas = Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // transparent PNGs land on white, not black
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close?.();
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  if (!blob) throw new Error("That image couldn't be read.");
  if (blob.size > config.max_image_bytes) throw new Error("That image is too large even after shrinking it.");
  return { blob, url: URL.createObjectURL(blob), width, height };
}

async function pick(file) {
  if (!file) return;
  try {
    const next = await prepareImage(file);
    if (picked) URL.revokeObjectURL(picked.url);
    picked = next;
    $("#preview").src = picked.url;
    $("#preview").classList.remove("hidden");
    $("#dropEmpty").classList.add("hidden");
    $("#clearImage").classList.remove("hidden");
  } catch (e) {
    toast(e.message || "That image couldn't be read.", true);
  }
  updateMakeButton();
}

function clearImage() {
  picked = null;
  $("#preview").classList.add("hidden");
  $("#preview").removeAttribute("src");
  $("#dropEmpty").classList.remove("hidden");
  $("#clearImage").classList.add("hidden");
  $("#fileInput").value = "";
  updateMakeButton();
}

// ── Making a clip ────────────────────────────────────────────────────────────

async function make() {
  const btn = $("#makeBtn");
  btn.disabled = true;
  btn.textContent = "Starting…";
  try {
    await ensureWallet();
    const seedText = $("#seed").value.trim();
    const body = {
      prompt: $("#prompt").value.trim(),
      size,
      seconds: 5,
      content_type: "image/jpeg",
      image_bytes: picked.blob.size,
      loop: $("#loop").checked,
    };
    if (seedText) body.seed = Number(seedText);
    let r;
    try {
      r = await api("/motion/jobs", { method: "POST", body, auth: true });
    } catch (e) {
      if (e.status === 402) openTopup();
      toast(e.message, true);
      return;
    }
    setWallet(r.wallet);
    upsertClip(r.job);
    if (r.upload_url) {
      let ok = false;
      try {
        const put = await fetch(r.upload_url, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: picked.blob });
        ok = put.ok;
      } catch {}
      if (!ok) {
        const c = await api(`/motion/jobs/${r.job.id}/cancel`, { method: "POST", auth: true }).catch(() => null);
        if (c) { upsertClip(c.job); setWallet(c.wallet); }
        toast("The image didn't upload, so nothing was charged. Try again.", true);
        return;
      }
    }
    const s = await api(`/motion/jobs/${r.job.id}/start`, { method: "POST", auth: true });
    upsertClip(s.job);
    if (s.wallet) setWallet(s.wallet);
    schedulePoll();
  } catch (e) {
    toast(e.message || "Something went wrong.", true);
  } finally {
    updateMakeButton();
  }
}

// ── Gallery ──────────────────────────────────────────────────────────────────

const ACTIVE = new Set(["awaiting_upload", "queued", "processing"]);
const STATUS_TEXT = {
  awaiting_upload: "Uploading your image…",
  queued: "Waiting for a GPU…",
  processing: "Making your clip. Usually under a minute.",
  failed: "This clip failed. The price is back on your balance.",
  refused: "Not made. The price is back on your balance.",
  expired: "The image never uploaded. Nothing was charged.",
  cancelled: "The image didn't upload. Nothing was charged.",
};

function upsertClip(job) {
  clips.set(job.id, job);
  renderClips();
}

function renderClips() {
  const box = $("#clips");
  const jobs = [...clips.values()].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  $("#emptyNote").classList.toggle("hidden", jobs.length > 0);
  // Rebuild only cards whose state changed, so a playing video isn't reset.
  const seen = new Set();
  let prev = null;
  for (const job of jobs) {
    seen.add(job.id);
    let card = box.querySelector(`[data-id="${job.id}"]`);
    const sig = `${job.status}|${job.video_url ? 1 : 0}`;
    if (!card || card.dataset.sig !== sig) {
      const fresh = clipCard(job);
      if (card) card.replaceWith(fresh); else box.prepend(fresh);
      card = fresh;
    }
    // Keep newest first.
    if (prev && prev.nextSibling !== card) prev.after(card);
    else if (!prev && box.firstElementChild !== card) box.prepend(card);
    prev = card;
  }
  box.querySelectorAll(".m-clip").forEach((c) => { if (!seen.has(c.dataset.id)) c.remove(); });
}

function clipCard(job) {
  const card = document.createElement("article");
  card.className = "m-clip";
  card.dataset.id = job.id;
  card.dataset.sig = `${job.status}|${job.video_url ? 1 : 0}`;

  const media = document.createElement("div");
  media.className = "m-clip-media";
  if (job.status === "done" && job.video_url) {
    const v = Object.assign(document.createElement("video"), {
      src: job.video_url, controls: true, loop: true, muted: true, playsInline: true, preload: "metadata",
    });
    media.append(v);
  } else {
    const status = document.createElement("div");
    status.className = "m-clip-status";
    if (ACTIVE.has(job.status)) {
      const spin = document.createElement("div");
      spin.className = "m-spinner";
      status.append(spin);
    } else {
      status.classList.add("bad");
    }
    const text = document.createElement("p");
    text.style.margin = "0";
    text.textContent = job.status === "refused" || job.status === "failed" ? (job.error || STATUS_TEXT[job.status]) : STATUS_TEXT[job.status] || job.status;
    status.append(text);
    media.append(status);
  }

  const body = document.createElement("div");
  body.className = "m-clip-body";
  const prompt = document.createElement("p");
  prompt.className = "m-clip-prompt";
  prompt.textContent = job.prompt;
  const meta = document.createElement("div");
  meta.className = "m-clip-meta";
  const bits = [job.size, "5 s"];
  if (job.loop) bits.push("loop");
  if (job.status === "done") bits.push("sound");
  bits.push(ACTIVE.has(job.status) || job.status === "done" ? money(job.amount_cents) : "not charged");
  if (job.seed != null && job.status === "done") bits.push(`seed ${job.seed}`);
  bits.forEach((b) => meta.append(Object.assign(document.createElement("span"), { textContent: b })));

  const actions = document.createElement("div");
  actions.className = "m-clip-actions";
  if (job.status === "done" && job.download_url) {
    actions.append(Object.assign(document.createElement("a"), { className: "btn", href: job.download_url, textContent: "Download" }));
  }
  const again = Object.assign(document.createElement("button"), { type: "button", className: "btn btn-ghost", textContent: "Use this prompt" });
  again.addEventListener("click", () => {
    $("#prompt").value = job.prompt;
    $("#loop").checked = Boolean(job.loop);
    if (!picked) toast("Choose an image to make another take with this prompt.");
    updateMakeButton();
    $("#prompt").focus();
  });
  actions.append(again);
  if (job.status === "done" && job.seed != null) {
    const same = Object.assign(document.createElement("button"), { type: "button", className: "btn btn-ghost", textContent: "Reuse seed" });
    same.addEventListener("click", () => {
      $("#seed").value = job.seed;
      $(".m-advanced").open = true;
      toast(`Seed ${job.seed} set. Change the prompt a little to refine this take.`);
    });
    actions.append(same);
  }
  body.append(prompt, meta, actions);
  card.append(media, body);
  return card;
}

async function loadClips() {
  if (!key) return;
  try {
    const r = await api("/motion/jobs", { auth: true });
    r.jobs.forEach((j) => clips.set(j.id, j));
    renderClips();
    schedulePoll();
  } catch {}
}

function schedulePoll() {
  clearTimeout(pollTimer);
  const active = [...clips.values()].filter((j) => ACTIVE.has(j.status) && j.status !== "awaiting_upload");
  if (!active.length) return;
  pollTimer = setTimeout(async () => {
    for (const job of active) {
      try {
        const r = await api(`/motion/jobs/${job.id}`, { auth: true });
        const was = clips.get(job.id)?.status;
        upsertClip(r.job);
        setWallet(r.wallet);
        if (was !== r.job.status && r.job.status === "done") toast("Your clip is ready.");
        if (was !== r.job.status && r.job.status === "refused") toast(r.job.error, true);
      } catch {}
    }
    schedulePoll();
  }, POLL_MS);
}

// ── Top-up ───────────────────────────────────────────────────────────────────

function renderAmounts() {
  const box = $("#amounts");
  config.topup.presets_cents.forEach((c, i) => {
    const b = Object.assign(document.createElement("button"), { type: "button", textContent: money(c).replace(".00", "") });
    b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", String(i === 0));
    b.addEventListener("click", () => {
      topupCents = c;
      $("#customAmount").value = "";
      box.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    });
    box.append(b);
  });
  topupCents = config.topup.presets_cents[0];
  $("#customAmount").min = config.topup.min_cents / 100;
  $("#customAmount").max = config.topup.max_cents / 100;
  $("#customAmount").addEventListener("input", () => {
    const v = Math.round(Number($("#customAmount").value) * 100);
    topupCents = v || config.topup.presets_cents[0];
    box.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(!v && x === box.firstElementChild)));
  });
}

function openTopup() {
  $("#topupDialog").showModal();
}

async function checkout(ev) {
  ev.preventDefault();
  const email = $("#email").value.trim();
  if (!email.includes("@")) { toast("Add an email for the receipt.", true); return; }
  const { min_cents, max_cents } = config.topup;
  if (!(topupCents >= min_cents && topupCents <= max_cents)) {
    toast(`Add between ${money(min_cents)} and ${money(max_cents)}.`, true);
    return;
  }
  const btn = $("#checkoutBtn");
  btn.disabled = true;
  btn.textContent = "Opening checkout…";
  try {
    await ensureWallet();
    const r = await api("/motion/wallet/topup", { method: "POST", auth: true, body: { amount_cents: topupCents, email } });
    if (r.checkout_url) { location.href = r.checkout_url; return; }
    if (r.dev_paid) { await loadWallet(); $("#topupDialog").close(); toast("Balance added (test mode)."); }
  } catch (e) {
    toast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = "Continue to checkout";
  }
}

// ── Wallet key dialog ────────────────────────────────────────────────────────

function openKey() {
  $("#keyText").textContent = key || "No wallet yet. One is made when you first add balance.";
  $("#copyKey").disabled = !key;
  $("#otherKey").value = "";
  $("#keyDialog").showModal();
}

async function useOtherKey() {
  const k = $("#otherKey").value.trim();
  if (!/^pmk_[0-9a-f]{64}$/.test(k)) { toast("That doesn't look like a wallet key.", true); return; }
  const old = key;
  key = k;
  try {
    const r = await api("/motion/wallet", { auth: true });
    if (old && old !== k) store.set(PREV_KEY_STORE, old);
    store.set(KEY_STORE, k);
    setWallet(r.wallet);
    clips.clear();
    renderClips();
    await loadClips();
    $("#keyDialog").close();
    toast(`Switched. This wallet has ${money(r.wallet.balance_cents)}.`);
  } catch {
    key = old;
    toast("That key isn't recognised.", true);
  }
}

// ── Wiring ───────────────────────────────────────────────────────────────────

function wire() {
  const drop = $("#drop");
  const input = $("#fileInput");
  drop.addEventListener("click", (e) => { if (e.target.id !== "clearImage") input.click(); });
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  input.addEventListener("change", () => pick(input.files[0]));
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("drag")));
  drop.addEventListener("drop", (e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); });
  document.addEventListener("paste", (e) => {
    const file = [...(e.clipboardData?.files || [])].find((f) => f.type.startsWith("image/"));
    if (file) pick(file);
  });
  $("#clearImage").addEventListener("click", (e) => { e.stopPropagation(); clearImage(); input.click(); });

  $("#prompt").addEventListener("input", updateMakeButton);
  $("#ideas").addEventListener("click", (e) => {
    const idea = e.target.dataset?.idea;
    if (!idea) return;
    const p = $("#prompt");
    p.value = p.value.trim() ? `${p.value.trim()} ${idea}` : idea;
    updateMakeButton();
    p.focus();
  });
  $("#makeBtn").addEventListener("click", make);

  $("#topupBtn").addEventListener("click", openTopup);
  $("#topupForm").addEventListener("submit", checkout);
  $("#balanceBtn").addEventListener("click", openKey);
  $("#copyKey").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(key); toast("Key copied."); } catch { toast("Select the key and copy it.", true); }
  });
  $("#useKey").addEventListener("click", useOtherKey);
  document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
}

async function init() {
  importKeyFromLink();
  wire();
  try {
    config = await api("/motion/config");
  } catch (e) {
    toast(e.message, true);
    return;
  }
  renderSizes();
  renderAmounts();
  await loadWallet();
  updateMakeButton();
  await loadClips();
  watchTopup();
}

init();
