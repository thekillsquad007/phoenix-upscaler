const GUMROAD_URL = "https://aravindk74.gumroad.com/l/phoenixupscaler";

document.querySelectorAll(".gumroad-link").forEach((el) => {
  el.href = GUMROAD_URL;
  el.target = "_blank";
  el.rel = "noopener";
});