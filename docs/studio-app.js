const STORAGE_KEY = "phoenix_studio_session_v1";
const HISTORY_KEY = "phoenix_studio_history_v1";

const $ = (sel) => document.querySelector(sel);

let session = loadSession();
let selectedFile = null;
let mediaKind = "video"; // image | video
let tickTimer = null;

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(s) {
  session = s;
  if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  else localStorage.removeItem(STORAGE_KEY);
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 40)));
}

function toast(msg, isError) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.toggle("error", Boolean(isError));
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3200);
}

function showLogin() {
  $("#view-login").classList.remove("hidden");
  $("#view-app").classList.add("hidden");
}

function showApp() {
  $("#view-login").classList.add("hidden");
  $("#view-app").classList.remove("hidden");
  $("#userEmailLabel").textContent = session?.email || "";
  renderHistory();
  updatePrice();
}

function switchTab(name) {
  document.querySelectorAll(".nav-tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.tab === name);
  });
  ["new", "history", "account"].forEach((id) => {
    const panel = $(`#tab-${id}`);
    if (panel) panel.classList.toggle("hidden", id !== name);
  });
}

/** Transparent dollar pricing — no credits. */
function estimatePrice({ kind, quality, durationSec }) {
  const q = quality || "enhanced";
  if (kind === "image") {
    if (q === "standard") return 0.99;
    if (q === "max") return 2.99;
    return 1.49;
  }
  // video: per 10 seconds, with minimums
  const blocks = Math.max(1, Math.ceil((durationSec || 30) / 10));
  if (q === "standard") return Math.max(1.99, blocks * 0.59);
  if (q === "max") return Math.max(4.99, blocks * 1.99);
  return Math.max(2.99, blocks * 0.99);
}

function formatMoney(n) {
  return `$${n.toFixed(2)}`;
}

function updatePrice() {
  const quality = $("#quality").value;
  const durationSec = Number($("#durationSec").value) || 30;
  const isVideo = mediaKind === "video";
  $("#durationField").classList.toggle("hidden", !isVideo || !selectedFile);

  if (!selectedFile) {
    $("#priceAmount").textContent = "$0.00";
    $("#priceNote").textContent = "Select a file to see the price.";
    $("#payBtn").disabled = true;
    return;
  }

  const price = estimatePrice({
    kind: mediaKind,
    quality,
    durationSec: isVideo ? durationSec : 0,
  });
  $("#priceAmount").textContent = formatMoney(price);
  const qLabel = { standard: "Standard", enhanced: "Enhanced", max: "Studio Max" }[quality];
  if (mediaKind === "image") {
    $("#priceNote").textContent = `${qLabel} photo restore · charged only if the job succeeds`;
  } else {
    $("#priceNote").textContent = `${qLabel} · ~${durationSec}s video · charged only if the job succeeds`;
  }
  $("#payBtn").disabled = false;
  $("#payBtn").dataset.price = String(price);
}

function setFile(file) {
  if (!file) return;
  selectedFile = file;
  const isImage = file.type.startsWith("image/");
  mediaKind = isImage ? "image" : "video";
  $("#fileName").textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
  if (!isImage && file.type.startsWith("video/")) {
    // best-effort duration via video element
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const sec = Math.max(1, Math.round(v.duration || 30));
      $("#durationSec").value = String(Math.min(600, sec));
      URL.revokeObjectURL(url);
      updatePrice();
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      updatePrice();
    };
    v.src = url;
  }
  updatePrice();
}

function renderHistory() {
  const list = $("#historyList");
  const items = loadHistory();
  if (!items.length) {
    list.innerHTML = `<p class="muted">No jobs yet. Complete a restore to see receipts here.</p>`;
    return;
  }
  list.innerHTML = items
    .map(
      (j) => `
    <div class="history-item">
      <div>
        <strong>${escapeHtml(j.name)}</strong>
        <span class="muted">${j.kind} · ${j.quality} · ${j.when}</span>
      </div>
      <div>
        <strong>${formatMoney(j.price)}</strong>
        <span class="muted">${j.status}</span>
      </div>
    </div>`
    )
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function startMockJob() {
  const price = Number($("#payBtn").dataset.price || 0);
  const quality = $("#quality").value;
  const name = selectedFile?.name || "file";
  $("#jobPanel").classList.remove("hidden");
  $("#jobDone").classList.add("hidden");
  $("#payBtn").disabled = true;
  $("#jobTitle").textContent = "Processing…";
  $("#jobMsg").textContent = "Payment authorized (preview). Running restore…";
  let p = 6;
  $("#progressFill").style.width = "6%";
  $("#jobPercent").textContent = "6%";
  clearInterval(tickTimer);
  tickTimer = setInterval(() => {
    p = Math.min(100, p + Math.random() * 12 + 4);
    $("#progressFill").style.width = `${p}%`;
    $("#jobPercent").textContent = `${Math.floor(p)}%`;
    if (p < 35) $("#jobMsg").textContent = "Analyzing source…";
    else if (p < 70) $("#jobMsg").textContent = "Restoring detail…";
    else if (p < 95) $("#jobMsg").textContent = "Building final output…";
    if (p >= 100) {
      clearInterval(tickTimer);
      $("#jobTitle").textContent = "Complete";
      $("#jobMsg").textContent = `Paid ${formatMoney(price)} · ready to download (preview).`;
      $("#jobDone").classList.remove("hidden");
      const items = loadHistory();
      items.unshift({
        name,
        kind: mediaKind,
        quality,
        price,
        status: "Complete",
        when: new Date().toLocaleString(),
      });
      saveHistory(items);
      renderHistory();
      toast(`Job complete · ${formatMoney(price)}`);
    }
  }, 450);
}

// Events
$("#loginBtn").addEventListener("click", () => {
  const email = ($("#loginEmail").value || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    toast("Enter a valid email.", true);
    return;
  }
  saveSession({ email, at: Date.now() });
  showApp();
  toast(`Signed in as ${email}`);
});

$("#logoutBtn").addEventListener("click", () => {
  saveSession(null);
  selectedFile = null;
  showLogin();
});

document.querySelectorAll(".nav-tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

$("#browseBtn").addEventListener("click", () => $("#fileInput").click());
$("#fileInput").addEventListener("change", () => setFile($("#fileInput").files[0]));

const drop = $("#dropzone");
drop.addEventListener("dragover", (e) => {
  e.preventDefault();
  drop.classList.add("drag");
});
drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
drop.addEventListener("drop", (e) => {
  e.preventDefault();
  drop.classList.remove("drag");
  if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
});

$("#quality").addEventListener("change", updatePrice);
$("#durationSec").addEventListener("input", updatePrice);

$("#payBtn").addEventListener("click", () => {
  if (!selectedFile) return;
  startMockJob();
});

$("#newJobBtn").addEventListener("click", () => {
  $("#jobPanel").classList.add("hidden");
  $("#payBtn").disabled = !selectedFile;
  updatePrice();
});

$("#cancelHintBtn").addEventListener("click", () => {
  toast("Cancel Pro from Account when live — renewal stops; cloud jobs still work pay-per-job.");
});

// boot
if (session?.email) showApp();
else showLogin();
updatePrice();
