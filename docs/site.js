// ── Lemon Squeezy checkout ──────────────────────────────────────────────
// Paste the product's "Buy Now" / checkout URL here after creating the product
// in Lemon Squeezy (Products → your product → Share → copy the checkout link,
// e.g. "https://phoenixlabs.lemonsqueezy.com/buy/xxxxxxxx-xxxx-xxxx"). Until
// it's set, the buy button falls back to the free-download section.
const LEMON_CHECKOUT_URL = "https://phoenixlabss.lemonsqueezy.com/checkout/buy/66a237da-d2b8-4fc8-9f1f-7390bccdb44a";

document.querySelectorAll("[data-ls-checkout]").forEach((btn) => {
  if (LEMON_CHECKOUT_URL) {
    btn.href = LEMON_CHECKOUT_URL;
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  }
});

// Before/after comparison sliders.
//
// The "before" image sits in a clipped overlay above the "after" image. Both
// are the same displayed size, so the inner <img> is pinned to the container
// width — otherwise narrowing the clip would squash the image instead of
// revealing what is underneath.
document.querySelectorAll("[data-ba]").forEach((el) => {
  const range = el.querySelector(".ba-range");
  const clip = el.querySelector(".ba-clip");
  const handle = el.querySelector(".ba-handle");
  const inner = clip && clip.querySelector("img");
  if (!range || !clip || !handle || !inner) return;

  const sync = () => {
    inner.style.width = `${el.clientWidth}px`;
  };

  const update = () => {
    const v = Number(range.value);
    clip.style.width = `${v}%`;
    handle.style.left = `${v}%`;
  };

  range.addEventListener("input", update);
  window.addEventListener("resize", () => { sync(); update(); });

  // Images may not be laid out yet on first paint.
  if (inner.complete) { sync(); } else { inner.addEventListener("load", () => { sync(); update(); }); }
  sync();
  update();
});

// Pause any other demo video when one starts, so two clips never talk over
// each other on the comparison row.
const videos = [...document.querySelectorAll("video")];
videos.forEach((v) => {
  v.addEventListener("play", () => {
    videos.forEach((other) => { if (other !== v) other.pause(); });
  });
});
