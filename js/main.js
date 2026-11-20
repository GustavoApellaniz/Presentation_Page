/* ==========================================================================
   Gustavo Fraga Apellaniz — portfolio script (ES module, loaded deferred)
   Every feature is a small function, started at the bottom of the file.
   Each one checks that its elements exist, so the same file serves all pages.
   ========================================================================== */

// User preferences and device hints, read once.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isMobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

/* --------------------------------------------------------------------------
   1. Navbar: blurred background after scrolling + mobile menu
   -------------------------------------------------------------------------- */
function initNav() {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  // Toggle the translucent background once the page has scrolled a bit.
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 16);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = nav.querySelector(".nav__toggle");
  const menu = nav.querySelector(".nav__menu");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));

  // Close after choosing a link, on Escape, or when clicking outside.
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("is-open") && !nav.contains(e.target)) setOpen(false);
  });
}

/* --------------------------------------------------------------------------
   2. Hero name: "decode" effect — random characters resolve into the name.
      Runs once, under 1.2 s. The reflection copies every frame.
   -------------------------------------------------------------------------- */
function initDecode() {
  const target = document.querySelector("[data-decode]");
  if (!target || reduceMotion) return;

  const reflection = document.querySelector(".hero__reflection");
  const finalText = target.textContent;
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/\\=+";
  const duration = 1100; // ms
  const start = performance.now();

  // Each letter "locks" at its own moment, roughly left to right.
  const lockAt = [...finalText].map((_, i) => (i / finalText.length) * duration * 0.75 + Math.random() * duration * 0.25);

  const frame = (now) => {
    const t = now - start;
    let out = "";
    for (let i = 0; i < finalText.length; i++) {
      const ch = finalText[i];
      if (ch === " " || ch === "\n" || t >= lockAt[i]) out += ch;
      else out += glyphs[(Math.random() * glyphs.length) | 0];
    }
    target.textContent = out;
    if (reflection) reflection.textContent = out;
    if (t < duration) requestAnimationFrame(frame);
    else {
      target.textContent = finalText;
      if (reflection) reflection.textContent = finalText;
    }
  };
  requestAnimationFrame(frame);
}

/* --------------------------------------------------------------------------
   3. Typewriter: cycles through the roles listed in data-roles.
   -------------------------------------------------------------------------- */
function initTypewriter() {
  const el = document.querySelector("[data-typewriter]");
  if (!el) return;
  const roles = JSON.parse(el.dataset.roles || "[]");
  if (!roles.length) return;

  // Reduced motion: show every role at once, no typing.
  if (reduceMotion) {
    el.textContent = roles.join(" · ");
    return;
  }

  // The first role is already in the HTML, so start by pausing on it.
  let roleIndex = 0;
  let charIndex = roles[0].length;
  let deleting = true;

  const tick = () => {
    const word = roles[roleIndex];
    charIndex += deleting ? -1 : 1;
    el.textContent = word.slice(0, charIndex);

    let delay = deleting ? 35 : 70;
    if (!deleting && charIndex === word.length) {
      delay = 1700; // pause on the full word
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 350;
    }
    setTimeout(tick, delay);
  };
  // Start deleting after the name has decoded and the first role was read.
  setTimeout(tick, 2400);
}

/* --------------------------------------------------------------------------
   4. Background: neon rain on a <canvas>.
      Low opacity, paused when the tab is hidden, 30 fps on mobile.
   -------------------------------------------------------------------------- */
function initRain() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const fps = isMobile ? 30 : 60;
  const frameTime = 1000 / fps;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  // Mostly purple, a little cyan, rare magenta: neon is an accent.
  const colors = ["157,77,255", "157,77,255", "157,77,255", "34,211,238", "255,43,214"];
  let drops = [];
  let width = 0;
  let height = 0;
  let rafId = 0;
  let last = 0;

  const makeDrop = (randomY) => ({
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -30,
    len: 10 + Math.random() * 22,
    speed: 4 + Math.random() * 7,
    alpha: 0.12 + Math.random() * 0.3,
    color: colors[(Math.random() * colors.length) | 0],
  });

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(isMobile ? 45 : 110, Math.round(width / 12));
    drops = Array.from({ length: count }, () => makeDrop(true));
  };

  const draw = (now) => {
    rafId = requestAnimationFrame(draw);
    if (now - last < frameTime) return; // frame cap
    const step = Math.min((now - last) / 16.7, 3); // keep speed stable at 30 fps
    last = now;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    for (const d of drops) {
      // Slight slant, like rain in the wind.
      const grad = ctx.createLinearGradient(d.x, d.y, d.x - d.len * 0.12, d.y + d.len);
      grad.addColorStop(0, `rgba(${d.color},0)`);
      grad.addColorStop(1, `rgba(${d.color},${d.alpha})`);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.12, d.y + d.len);
      ctx.stroke();
      d.y += d.speed * step;
      d.x -= d.speed * 0.12 * step;
      if (d.y > height) Object.assign(d, makeDrop(false));
    }
  };

  const start = () => { if (!rafId) { last = performance.now(); rafId = requestAnimationFrame(draw); } };
  const stop = () => { cancelAnimationFrame(rafId); rafId = 0; };

  resize();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  start();
}

/* --------------------------------------------------------------------------
   5. Reveal sections on scroll (IntersectionObserver).
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
}

/* --------------------------------------------------------------------------
   6. Cards: border glow follows the mouse, with a slight tilt (desktop only).
   -------------------------------------------------------------------------- */
function initCards() {
  if (!finePointer) return;
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      if (!reduceMotion) {
        card.style.setProperty("--ry", `${(x - 0.5) * 4}deg`);
        card.style.setProperty("--rx", `${(0.5 - y) * 4}deg`);
      }
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

/* --------------------------------------------------------------------------
   7. Copy email to clipboard + "Copied!" toast.
   -------------------------------------------------------------------------- */
function initCopyEmail() {
  const buttons = document.querySelectorAll("[data-copy]");
  const toast = document.querySelector(".toast");
  if (!buttons.length) return;
  let hideTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied!");
      } catch {
        // Clipboard blocked (e.g. insecure context): open the mail app instead.
        window.location.href = `mailto:${text}`;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   8. Quick fade between pages (fallback for browsers without
      cross-document View Transitions).
   -------------------------------------------------------------------------- */
function initPageFade() {
  if (reduceMotion || "onpagereveal" in window) return; // native transitions handle it
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === "_blank" || link.hasAttribute("download")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return; // external or same-page anchor
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => { location.href = url.href; }, 180);
  });
  // Coming back with the Back button (bfcache): make the page visible again.
  window.addEventListener("pageshow", () => document.body.classList.remove("is-leaving"));
}

/* --------------------------------------------------------------------------
   Start everything.
   -------------------------------------------------------------------------- */
initNav();
initDecode();
initTypewriter();
initRain();
initReveal();
initCards();
initCopyEmail();
initPageFade();
