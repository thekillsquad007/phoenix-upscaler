/* Phoenix Cloud Studio — talks to the real /cloud/* API.
 *
 * Flow: quote -> create job (+ presigned upload) -> upload source to R2 ->
 * Lemon Squeezy checkout -> (return) -> poll -> download. No login, no credits:
 * the customer enters an email, sees a dollar price, and pays per job.
 */

// Where the cloud API lives — the Cloudflare Worker (studio_worker/). Defaults
// to api.phoenixlabs.space in production, localhost in dev, ?api=... to override.
const CLOUD_API_BASE = (() => {
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.protocol === "file:";
  const q = new URLSearchParams(location.search).get("api");
  // ?api= is a local-dev override only — ignore it on the production site.
  if (q && local) return q.replace(/\/$/, "");
  if (local) return "http://127.0.0.1:8787";
  return "https://api.phoenixlabs.space";
})();

// UI quality -> server quality vocabulary.
const QUALITY_MAP = { standard: "faithful", enhanced: "enhanced", max: "enhanced_max" };

const STORAGE_KEY = "phoenix_studio_session_v1";
const HISTORY_KEY = "phoenix_studio_history_v1";

const $ = (sel) => document.querySelector(sel);

let session = loadSession();
let selectedFile = null;
let mediaKind = "video"; // image | video
let selectedWidth = 0;
let selectedHeight = 0;
let currentQuote = null; // {amount_cents, display}
let pollTimer = null;

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // keep in sync with the Worker

function loadSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}
function saveSession(s) {
  session = s;
  if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  else localStorage.removeItem(STORAGE_KEY);
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(items) { localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 40))); }

async function api(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${CLOUD_API_BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Couldn't reach the cloud service — check your connection.");
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try { detail = (await res.json()).detail || detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
}

function fileDims() {
  return selectedWidth && selectedHeight ? { width: selectedWidth, height: selectedHeight } : {};
}

function toast(msg, isError) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("error", Boolean(isError));
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3600);
}

function showLogin() { $("#view-login").classList.remove("hidden"); $("#view-app").classList.add("hidden"); }
function showApp() {
  $("#view-login").classList.add("hidden");
  $("#view-app").classList.remove("hidden");
  $("#userEmailLabel").textContent = session?.email || "";
  renderHistory();
  updatePrice();
  resumePendingCheckout();
}

function switchTab(name) {
  document.querySelectorAll(".nav-tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
  ["new", "history", "account"].forEach((id) => {
    const panel = $(`#tab-${id}`);
    if (panel) panel.classList.toggle("hidden", id !== name);
  });
}

function formatMoney(n) { return `$${Number(n).toFixed(2)}`; }

// Debounced server quote so the price shown is exactly what we charge.
let quoteTimer = null;
function updatePrice() {
  const isVideo = mediaKind === "video";
  $("#durationField").classList.toggle("hidden", !isVideo || !selectedFile);
  if (!selectedFile) {
    currentQuote = null;
    $("#priceAmount").textContent = "$0.00";
    $("#priceNote").textContent = "Select a file to see the price.";
    $("#payBtn").disabled = true;
    return;
  }
  $("#priceNote").textContent = "Getting price…";
  $("#payBtn").disabled = true;
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(fetchQuote, 250);
}

async function fetchQuote() {
  const quality = QUALITY_MAP[$("#quality").value] || "enhanced";
  const durationSec = mediaKind === "video" ? Number($("#durationSec").value) || 30 : 0;
  try {
    const q = await api("/cloud/quote", { method: "POST", body: { quality, duration_sec: durationSec, ...fileDims() } });
    currentQuote = q;
    $("#priceAmount").textContent = q.display || formatMoney((q.amount_cents || 0) / 100);
    const qLabel = { standard: "Standard", enhanced: "Enhanced", max: "Studio Max" }[$("#quality").value];
    $("#priceNote").textContent = mediaKind === "image"
      ? `${qLabel} photo restore · charged only when the job succeeds`
      : `${qLabel} · ~${durationSec}s video · charged only when the job succeeds`;
    $("#payBtn").disabled = false;
  } catch (err) {
    currentQuote = null;
    $("#priceNote").textContent = err.message; // includes over-limit reasons
    $("#payBtn").disabled = true;
  }
}

function setFile(file) {
  if (!file) return;
  selectedFile = file;
  selectedWidth = 0;
  selectedHeight = 0;
  const isImage = file.type.startsWith("image/");
  mediaKind = isImage ? "image" : "video";
  $("#fileName").textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;

  if (file.size > MAX_UPLOAD_BYTES) {
    $("#priceNote").textContent = "That file is over the 2 GB limit — trim or compress it first.";
    $("#payBtn").disabled = true;
    return;
  }

  const url = URL.createObjectURL(file);
  if (isImage) {
    const img = new Image();
    img.onload = () => { selectedWidth = img.naturalWidth; selectedHeight = img.naturalHeight; URL.revokeObjectURL(url); updatePrice(); };
    img.onerror = () => { URL.revokeObjectURL(url); updatePrice(); };
    img.src = url;
  } else {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      selectedWidth = v.videoWidth;
      selectedHeight = v.videoHeight;
      $("#durationSec").value = String(Math.min(1800, Math.max(1, Math.round(v.duration || 30))));
      URL.revokeObjectURL(url);
      updatePrice();
    };
    v.onerror = () => { URL.revokeObjectURL(url); updatePrice(); };
    v.src = url;
  }
  updatePrice();
}

// ── Pay + run ──────────────────────────────────────────────────────────────
async function startJob() {
  if (!selectedFile || !currentQuote || !session?.email) return;
  const quality = QUALITY_MAP[$("#quality").value] || "enhanced";
  const durationSec = mediaKind === "video" ? Number($("#durationSec").value) || 30 : 0;

  $("#payBtn").disabled = true;
  showJob("Preparing…", "Creating your job.");
  try {
    const created = await api("/cloud/jobs", {
      method: "POST",
      body: { email: session.email, quality, duration_sec: durationSec, filename: selectedFile.name,
              size: selectedFile.size, content_type: selectedFile.type, ...fileDims() },
    });
    const job = created.job;
    recordHistory(job, selectedFile.name, currentQuote.display);

    if (created.upload_url) {
      showJob("Uploading…", "Sending your file securely.");
      await uploadTo(created.upload_url, selectedFile);
    }

    showJob("Redirecting to payment…", "Opening secure checkout.");
    const success = `${location.origin}${location.pathname}?paid=${job.id}`;
    const checkout = await api(`/cloud/jobs/${job.id}/checkout`, { method: "POST", body: { success_url: success } });

    if (checkout.checkout_url) {
      localStorage.setItem("phoenix_pending_job", job.id);
      window.location.href = checkout.checkout_url; // Lemon Squeezy
      return;
    }
    // Dev / already-paid: no checkout URL — go straight to polling.
    pollJob(job.id);
  } catch (err) {
    showJob("Something went wrong", err.message);
    $("#payBtn").disabled = false;
    toast(err.message, true);
  }
}

async function uploadTo(url, file) {
  const res = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
  if (!res.ok) throw new Error(`Upload failed (${res.status})`);
}

function resumePendingCheckout() {
  const paid = new URLSearchParams(location.search).get("paid");
  const pending = paid || localStorage.getItem("phoenix_pending_job");
  if (pending) {
    localStorage.removeItem("phoenix_pending_job");
    history.replaceState(null, "", location.pathname);
    pollJob(pending);
  }
}

function pollJob(jobId) {
  clearInterval(pollTimer);
  showJob("Processing…", "Payment received. Restoring your file…");
  let ticks = 0;
  const tick = async () => {
    ticks += 1;
    try {
      const { job } = await api(`/cloud/jobs/${jobId}`);
      const st = job.status;
      if (st === "done") {
        clearInterval(pollTimer);
        jobDone(job);
      } else if (st === "failed") {
        clearInterval(pollTimer);
        showJob("Job failed", "Your payment will be refunded automatically. No charge for a failed restore.");
        toast("Job failed — you’ll be refunded.", true);
      } else if (st === "refunded") {
        clearInterval(pollTimer);
        showJob("Refunded", "This job was refunded.");
      } else {
        const msg = { queued: "Queued — waiting for a GPU…", processing: "Restoring detail…", pending_payment: "Waiting for payment…" }[st] || "Working…";
        $("#jobMsg").textContent = msg;
        bumpProgress(ticks);
      }
    } catch (err) {
      $("#jobMsg").textContent = `Reconnecting… (${err.message})`;
    }
  };
  tick();
  pollTimer = setInterval(tick, 2500);
}

function showJob(title, msg) {
  $("#jobPanel").classList.remove("hidden");
  $("#jobDone").classList.add("hidden");
  $("#jobTitle").textContent = title;
  $("#jobMsg").textContent = msg;
}

// Soft, honest progress: eases toward 90% while we wait, never fakes 100%.
function bumpProgress(ticks) {
  const pct = Math.min(90, 8 + ticks * 6);
  $("#progressFill").style.width = `${pct}%`;
  $("#jobPercent").textContent = `${pct}%`;
}

function jobDone(job) {
  $("#progressFill").style.width = "100%";
  $("#jobPercent").textContent = "100%";
  $("#jobTitle").textContent = "Complete";
  $("#jobMsg").textContent = "Your restore is ready.";
  const done = $("#jobDone");
  done.classList.remove("hidden");
  const dl = job.download_url;
  done.innerHTML = dl
    ? `<p><strong>Done.</strong></p><a class="btn btn-primary" href="${dl}" download>Download your restore</a>
       <button type="button" class="btn secondary" id="newJobBtn">Start another</button>`
    : `<p><strong>Done.</strong> Your download link will appear here.</p>
       <button type="button" class="btn btn-primary" id="newJobBtn">Start another</button>`;
  $("#newJobBtn").addEventListener("click", resetForNewJob);
  updateHistoryStatus(job.id, "Complete", dl);
  toast("Restore complete.");
}

function resetForNewJob() {
  $("#jobPanel").classList.add("hidden");
  selectedFile = null;
  $("#fileName").textContent = "No file selected";
  $("#progressFill").style.width = "0%";
  updatePrice();
}

// ── History (local receipts) ────────────────────────────────────────────────
function recordHistory(job, name, price) {
  const items = loadHistory();
  items.unshift({ id: job.id, name, kind: mediaKind, quality: $("#quality").value, price, status: "Started", when: new Date().toLocaleString(), download: null });
  saveHistory(items);
  renderHistory();
}
function updateHistoryStatus(id, status, download) {
  const items = loadHistory();
  const it = items.find((j) => j.id === id);
  if (it) { it.status = status; if (download) it.download = download; saveHistory(items); renderHistory(); }
}
function renderHistory() {
  const list = $("#historyList");
  const items = loadHistory();
  if (!items.length) { list.innerHTML = `<p class="muted">No jobs yet. Complete a restore to see receipts here.</p>`; return; }
  list.innerHTML = items.map((j) => `
    <div class="history-item">
      <div><strong>${escapeHtml(j.name)}</strong><span class="muted">${j.kind} · ${j.quality} · ${j.when}</span></div>
      <div><strong>${escapeHtml(j.price || "")}</strong><span class="muted">${escapeHtml(j.status)}</span>
      ${j.download ? `<a href="${j.download}" download>Download</a>` : ""}</div>
    </div>`).join("");
}
function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Events ───────────────────────────────────────────────────────────────────
$("#loginBtn").addEventListener("click", () => {
  const email = ($("#loginEmail").value || "").trim().toLowerCase();
  if (!email || !email.includes("@")) { toast("Enter a valid email.", true); return; }
  saveSession({ email, at: Date.now() });
  showApp();
});
$("#logoutBtn").addEventListener("click", () => { saveSession(null); selectedFile = null; showLogin(); });
document.querySelectorAll(".nav-tab").forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));
$("#browseBtn").addEventListener("click", () => $("#fileInput").click());
$("#fileInput").addEventListener("change", () => setFile($("#fileInput").files[0]));

const drop = $("#dropzone");
drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("drag"); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); });

$("#quality").addEventListener("change", updatePrice);
$("#durationSec").addEventListener("input", updatePrice);
$("#payBtn").addEventListener("click", startJob);

// boot — if the customer is returning from checkout, resume even before "login".
if (session?.email) showApp();
else {
  showLogin();
  const paid = new URLSearchParams(location.search).get("paid");
  if (paid) { $("#view-login").classList.add("hidden"); $("#view-app").classList.remove("hidden"); resumePendingCheckout(); }
}
