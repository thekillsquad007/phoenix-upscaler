const GUMROAD_URL = "https://aravindk74.gumroad.com/l/phoenixupscaler";

document.querySelectorAll(".gumroad-link").forEach((el) => {
  el.href = GUMROAD_URL;
  el.target = "_blank";
  el.rel = "noopener";
});

document.querySelectorAll("[data-before-after]").forEach((slider) => {
  const range = slider.querySelector("[data-slider-range]");
  const after = slider.querySelector("[data-after-pane]");
  const handle = slider.querySelector("[data-slider-handle]");
  if (!range || !after || !handle) return;

  const update = () => {
    const value = Number(range.value);
    after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    handle.style.left = `${value}%`;
  };

  range.addEventListener("input", update);
  update();
});
