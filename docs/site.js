// Phoenix Labs site behaviour. Plain script, no build step, every page.

document.documentElement.classList.remove("no-js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── Old home-page anchors ──────────────────────────────────────────────────
// The home page used to be the Upscaler's page, and installed copies of the
// app still open https://phoenixlabs.space/#price. Those sections live on
// upscaler.html now, so send the old anchors there.
(() => {
  const path = location.pathname.replace(/\/index\.html$/, "/");
  const moved = ["#price", "#download", "#what", "#paths", "#proof", "#proof-2", "#how", "#faq", "#cloud"];
  if ((path === "/" || path.endsWith("/")) && moved.includes(location.hash)) {
    location.replace(`upscaler.html${location.hash}`);
  }
})();

// ── Lemon Squeezy checkout ─────────────────────────────────────────────────
// Paste each product's checkout URL here. Until one is set, the buy button
// falls back to the free-download section.
const LEMON_CHECKOUT_URL = "https://phoenixlabss.lemonsqueezy.com/checkout/buy/66a237da-d2b8-4fc8-9f1f-7390bccdb44a";
// Separate product, separate URL: Editor is $99 with a year of updates, not
// the $129 perpetual Upscaler, so it must never fall back to the one above.
const LEMON_EDITOR_CHECKOUT_URL = "https://phoenixlabss.lemonsqueezy.com/checkout/buy/47adb5fa-7203-4e78-8517-c2c48aeff18a";

for (const [attr, url] of [["data-ls-checkout", LEMON_CHECKOUT_URL], ["data-ls-checkout-editor", LEMON_EDITOR_CHECKOUT_URL]]) {
  document.querySelectorAll(`[${attr}]`).forEach((btn) => {
    if (!url) return;
    btn.href = url;
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  });
}

// ── Nav: mobile menu, and the see-through nav over the home video ─────────
(() => {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const toggle = nav.querySelector(".nav-toggle");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  if (nav.classList.contains("nav-over")) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40 || nav.classList.contains("menu-open"));
    window.addEventListener("scroll", onScroll, { passive: true });
    toggle?.addEventListener("click", onScroll);
    onScroll();
  }
})();

// ── Before/after image sliders ─────────────────────────────────────────────
// The "before" image sits in a clipped overlay above the "after" image. Both
// are the same displayed size, so the inner <img> is pinned to the container
// width; otherwise narrowing the clip would squash the image.
document.querySelectorAll("[data-ba]").forEach((el) => {
  const range = el.querySelector(".ba-range");
  const clip = el.querySelector(".ba-clip");
  const handle = el.querySelector(".ba-handle");
  const inner = clip && clip.querySelector("img");
  if (!range || !clip || !handle || !inner) return;
  const sync = () => { inner.style.width = `${el.clientWidth}px`; };
  const update = () => {
    clip.style.width = `${range.value}%`;
    handle.style.left = `${range.value}%`;
  };
  range.addEventListener("input", update);
  window.addEventListener("resize", () => { sync(); update(); });
  if (inner.complete) sync(); else inner.addEventListener("load", () => { sync(); update(); });
  sync();
  update();
});

// ── Before/after video: two synced clips, the "before" wiped over the "after" ──
document.querySelectorAll("[data-vcompare]").forEach((el) => {
  const range = el.querySelector(".vc-range");
  const before = el.querySelector(".vc-before");
  const after = el.querySelector(".vc-after");
  if (!range || !before || !after) return;
  const update = () => el.style.setProperty("--pos", `${range.value}%`);
  range.addEventListener("input", update);
  update();
  // "after" leads; "before" follows it whenever they drift apart.
  const follow = () => {
    if (Math.abs(before.currentTime - after.currentTime) > 0.12) before.currentTime = after.currentTime;
  };
  after.addEventListener("timeupdate", follow);
  after.addEventListener("seeked", follow);
  after.addEventListener("play", () => { before.currentTime = after.currentTime; before.play().catch(() => {}); });
  after.addEventListener("pause", () => before.pause());
});

// ── Videos that play only while they're on screen ─────────────────────────
// data-inview videos are muted loops. They start when at least a third of
// them is visible and pause when scrolled away, so a page full of clips
// isn't decoding all of them at once. With reduced motion they stay on
// their poster frame.
(() => {
  const vids = [...document.querySelectorAll("video[data-inview]")];
  if (!vids.length) return;
  vids.forEach((v) => { v.muted = true; v.playsInline = true; });
  if (reduceMotion) {
    // Ambient loops (the home hero) just hold their poster; the rest get
    // controls so they can still be played on purpose.
    vids.forEach((v) => { v.removeAttribute("autoplay"); v.pause(); if (!v.hasAttribute("data-ambient")) v.controls = true; });
    return;
  }
  if (!("IntersectionObserver" in window)) {
    vids.forEach((v) => v.play().catch(() => {}));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (v.classList.contains("vc-before")) continue; // follows its partner
      if (e.isIntersecting) {
        if (v.preload === "none") v.preload = "auto";
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }
  }, { threshold: 0.33 });
  vids.forEach((v) => io.observe(v));
})();

// ── Reveal on scroll ──────────────────────────────────────────────────────
(() => {
  const els = [...document.querySelectorAll(".reveal")];
  if (!els.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach((el) => io.observe(el));
})();

// ── Copy buttons on code blocks ───────────────────────────────────────────
document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const code = btn.closest(".code")?.querySelector("pre");
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.innerText.trim());
      btn.textContent = "Copied";
    } catch {
      btn.textContent = "Select and copy";
    }
    setTimeout(() => { btn.textContent = "Copy"; }, 1800);
  });
});

// ── WebMCP: the site's own tools for AI agents working in a browser ────────
// Where the browser offers navigator.modelContext (WebMCP), expose a few free,
// read-only tools. Paid work goes through the full MCP server, which
// get_agent_setup points to. The API is a draft, so never let it break the page.
(() => {
  const mc = navigator.modelContext;
  if (!mc) return;
  const API = "https://api.phoenixlabs.space";
  const QUALITY = { standard: "faithful", enhanced: "enhanced", studio_max: "enhanced_max" };
  const reply = (data) => ({ content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }] });
  const tools = [
    {
      name: "get_prices",
      description: "Current Phoenix Labs prices in US dollars: Phoenix Motion clips (image to five-second video with sound) and the Phoenix balance top-up range.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      async execute() {
        const cfg = await (await fetch(`${API}/motion/config`)).json();
        return reply({
          motion_clip: Object.fromEntries(cfg.sizes.map((s) => [s.size, s.display])),
          upscaler_desktop_app: "$129 once",
          editor_desktop_app: "$99 with a year of updates",
          cloud_restore: "from $2.99; use quote_restore for an exact price",
          top_up_usd: `${cfg.topup.min_cents / 100} to ${cfg.topup.max_cents / 100} by card; USDC on Base from $1`,
        });
      },
    },
    {
      name: "quote_restore",
      description: "Exact price in US dollars to restore one old video in the cloud with Phoenix Cloud Restore, from its length and frame size.",
      inputSchema: {
        type: "object",
        properties: {
          duration_seconds: { type: "number", description: "Length of the video in seconds." },
          quality: { type: "string", enum: ["standard", "enhanced", "studio_max"], description: "standard: clean-up and 2x upscale. enhanced: adds AI detail reconstruction. studio_max: enhanced at up to 4K." },
          width: { type: "integer", description: "Frame width in pixels, if known." },
          height: { type: "integer", description: "Frame height in pixels, if known." },
        },
        required: ["duration_seconds"],
      },
      annotations: { readOnlyHint: true },
      async execute({ duration_seconds, quality = "enhanced", width, height } = {}) {
        const res = await fetch(`${API}/cloud/quote`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ duration_sec: Number(duration_seconds), quality: QUALITY[quality] || "enhanced", width, height }),
        });
        const q = await res.json();
        return reply(res.ok ? { price: q.display, amount_cents: q.amount_cents } : q.detail || "Couldn't price that clip.");
      },
    },
    {
      name: "get_agent_setup",
      description: "How an AI agent can restore videos and make clips with Phoenix for a user: the MCP server, REST API, how agent keys and payment (card balance or USDC via x402) work.",
      inputSchema: { type: "object", properties: {} },
      annotations: { readOnlyHint: true },
      async execute() {
        return reply({
          mcp_server: `${API}/mcp`,
          openapi: `${API}/openapi.json`,
          guide: "https://phoenixlabs.space/developers",
          agent_skill: "https://phoenixlabs.space/.well-known/agent-skills/phoenix-labs/SKILL.md",
          paying: "Paid tools need an agent key (pak_...) with a spending limit, made by the user in Phoenix Motion (balance, then Agent keys). Agents with a crypto wallet can add USDC on Base with x402.",
        });
      },
    },
  ];
  try {
    if (typeof mc.provideContext === "function") mc.provideContext({ tools });
    else if (typeof mc.registerTool === "function") tools.forEach((t) => mc.registerTool(t));
  } catch { /* draft API: ignore */ }
})();

// ── One demo with sound at a time ──────────────────────────────────────────
// Only for clips the visitor starts themselves (they have controls and aren't
// the ambient loops): starting one pauses the others, so two never talk over
// each other. Ambient loops are left alone.
(() => {
  const own = [...document.querySelectorAll("video[controls]:not([data-inview])")];
  own.forEach((v) => {
    v.addEventListener("play", () => own.forEach((o) => { if (o !== v) o.pause(); }));
  });
})();
