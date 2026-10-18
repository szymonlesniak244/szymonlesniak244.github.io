// =========================================================
// main.js: wszystkie interakcje strony (bez bibliotek)
// =========================================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// --- Nagłówek: tło po przewinięciu ---
function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

// --- Menu mobilne ---
function initNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;

  const setOpen = (open) => {
    header.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  header.querySelectorAll(".site-nav a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  window.matchMedia("(min-width: 821px)").addEventListener("change", () => setOpen(false));
}

// --- Pojawianie się elementów przy przewijaniu ---
function initReveal() {
  // puste liczniki od razu pokazują placeholder [X]
  document.querySelectorAll("[data-count]").forEach((el) => {
    if (Number.isNaN(parseInt(el.dataset.count, 10))) runCounter(el);
  });
  const items = document.querySelectorAll("[data-reveal], .process, [data-count]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll("[data-count]").forEach(runCounter);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.hasAttribute("data-count")) runCounter(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

// --- Animowane liczniki ---
// W HTML: <span data-count="12"></span>. Puste data-count = placeholder [X].
function runCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  if (Number.isNaN(target)) {
    el.innerHTML = '<span class="ph">[X]</span>';
    return;
  }
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) {
    el.textContent = target + suffix;
    return;
  }
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// --- Efekt pisania (zmieniające się słowa w haśle) ---
function initTypewriter() {
  const el = document.querySelector(".typewriter");
  if (!el) return;
  let words;
  try {
    words = JSON.parse(el.dataset.words);
  } catch {
    return;
  }
  if (!words.length || reduceMotion) return;

  let w = 0;
  let i = words[0].length;
  let deleting = true;

  const step = () => {
    const word = words[w];
    i += deleting ? -1 : 1;
    el.textContent = word.slice(0, i);

    let delay = deleting ? 45 : 85;
    if (!deleting && i === word.length) {
      deleting = true;
      delay = 1800;
    } else if (deleting && i === 0) {
      deleting = false;
      w = (w + 1) % words.length;
      delay = 300;
    }
    setTimeout(step, delay);
  };
  setTimeout(step, 2200);
}

// --- Przechylanie kart projektów za kursorem ---
function initTilt() {
  if (reduceMotion || !finePointer) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.classList.add("is-tilting");
      card.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
      card.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

// --- Okna z szczegółami projektów (natywny <dialog>) ---
function initModals() {
  const openModal = (id) => {
    const dialog = document.getElementById(id);
    if (!dialog || typeof dialog.showModal !== "function") return;
    dialog.showModal();
    history.replaceState(null, "", `#${id}`);
  };

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.open));
  });

  document.querySelectorAll("dialog.modal").forEach((dialog) => {
    dialog.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dialog.close()));
    // kliknięcie w tło zamyka okno
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      history.replaceState(null, "", location.pathname + location.search);
    });
  });

  // link typu projekty.html#projekt-2 od razu otwiera właściwy projekt
  const hash = location.hash.slice(1);
  if (hash && document.querySelector(`dialog.modal#${CSS.escape(hash)}`)) openModal(hash);
}

// --- Kopiowanie adresu e-mail ---
function initCopy() {
  const status = document.querySelector(".copy-status");
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        if (status) status.textContent = "Skopiowano adres e-mail.";
      } catch {
        if (status) status.textContent = "Nie udało się skopiować. Zaznacz adres ręcznie.";
      }
    });
  });
}

// --- Linki-placeholdery (aria-disabled) nie przewijają strony ---
function initDisabledLinks() {
  document.querySelectorAll('a[aria-disabled="true"]').forEach((a) => {
    a.setAttribute("tabindex", "-1");
    a.addEventListener("click", (e) => e.preventDefault());
  });
}

// --- Rok w stopce ---
function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

initHeader();
initNav();
initReveal();
initTypewriter();
initTilt();
initModals();
initCopy();
initDisabledLinks();
initYear();
