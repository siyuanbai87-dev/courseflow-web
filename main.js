const LINKS = {
  testflight: "https://testflight.apple.com/join/6AZTKyPD",
  apk: "https://github.com/siyuanbai87-dev/courseflow-web/releases/latest/download/CourseFlow-Android.apk",
};

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Bind download links & TestFlight state
  const tfButtons = document.querySelectorAll("[data-testflight-link]");
  const hasTestFlight = Boolean(LINKS.testflight && LINKS.testflight.trim().length > 0);
  tfButtons.forEach((btn) => {
    if (hasTestFlight) {
      btn.setAttribute("href", LINKS.testflight);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
      btn.removeAttribute("aria-disabled");
    } else {
      btn.removeAttribute("href");
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("role", "button");
      const label = btn.querySelector("[data-tf-label]");
      if (label) {
        label.textContent = "TestFlight 测试即将开放";
      } else {
        btn.textContent = "TestFlight 测试即将开放";
      }
    }
  });

  document.querySelectorAll("[data-apk-link]").forEach((btn) => {
    btn.setAttribute("href", LINKS.apk);
  });

  // 2. Sticky header divider on scroll
  const header = document.querySelector(".site-header");
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // 3. Build heatmap cells cleanly
  const heatmap = document.getElementById("plan-heatmap");
  if (heatmap) {
    const pattern = [
      1, 2, 3, 2, 1, 0, 2, 3, 3, 2, 1, 2, 3, 2,
      2, 3, 2, 1, 2, 3, 3, 2, 1, 3, 2, 3, 2, 3,
      0, 2, 3, 3, 2, 2, 1, 3, 3, 2, 2, 3, 3, 3,
      1, 2, 2, 3, 3, 1, 2, 2, 3, 3, 2, 1, 2, 3,
    ];
    pattern.forEach((level, idx) => {
      const cell = document.createElement("div");
      cell.className = "hm-cell";
      cell.dataset.level = String(level);
      cell.style.transitionDelay = reducedMotion ? "0ms" : `${(idx % 14) * 32 + Math.floor(idx / 14) * 40}ms`;
      heatmap.appendChild(cell);
    });
  }

  // 4. IntersectionObserver for reveals, staggers, import line, mini timetable, heatmap
  const revealItems = document.querySelectorAll("[data-reveal]");
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    const items = group.querySelectorAll("[data-reveal]");
    items.forEach((el, index) => {
      el.style.transitionDelay = reducedMotion ? "0ms" : `${index * 70}ms`;
    });
  });

  if (reducedMotion) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
    document.querySelector(".hero-phone-wrap")?.classList.add("is-visible");
    document.querySelector(".import-wrap")?.classList.add("is-drawn");
    document.querySelectorAll(".step-card").forEach((c) => c.classList.add("is-lit"));
    document.querySelector(".mini-timetable")?.classList.add("is-filled");
    heatmap?.classList.add("is-filled");
  } else {
    const heroPhone = document.querySelector(".hero-phone-wrap");
    if (heroPhone) {
      requestAnimationFrame(() => {
        heroPhone.classList.add("is-visible");
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          target.classList.add("is-visible");

          if (target.classList.contains("import-wrap")) {
            target.classList.add("is-drawn");
            target.querySelectorAll(".step-card").forEach((card, idx) => {
              setTimeout(() => card.classList.add("is-lit"), idx * 180 + 120);
            });
          }

          if (target.classList.contains("mini-timetable")) {
            target.querySelectorAll(".mini-cell").forEach((cell, idx) => {
              cell.style.transitionDelay = `${idx * 55}ms`;
            });
            target.classList.add("is-filled");
          }

          if (target.id === "plan-heatmap") {
            target.classList.add("is-filled");
          }

          io.unobserve(target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((el) => io.observe(el));
    const importWrap = document.querySelector(".import-wrap");
    if (importWrap) io.observe(importWrap);
    const miniTimetable = document.querySelector(".mini-timetable");
    if (miniTimetable) io.observe(miniTimetable);
    if (heatmap) io.observe(heatmap);
  }

  // 5. Subtle hero parallax on scroll (rAF throttled)
  const parallaxTarget = document.querySelector(".hero-parallax");
  if (parallaxTarget && !reducedMotion) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const offset = Math.min(window.scrollY, 500) * 0.06;
          parallaxTarget.style.transform = `translateY(${offset.toFixed(1)}px)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  // 6. Gallery scroll controls
  const track = document.querySelector(".gallery-track");
  document.querySelectorAll("[data-gallery-dir]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!track) return;
      const dir = Number(btn.getAttribute("data-gallery-dir")) || 1;
      track.scrollBy({ left: dir * 320, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  // 7. Smooth accordion height for <details>
  document.querySelectorAll(".faq-item").forEach((details) => {
    const summary = details.querySelector("summary");
    const body = details.querySelector(".faq-body");
    if (!summary || !body) return;

    summary.addEventListener("click", (event) => {
      if (reducedMotion) return;
      event.preventDefault();

      if (details.open) {
        const startHeight = body.scrollHeight;
        body.style.height = `${startHeight}px`;
        body.style.opacity = "1";
        requestAnimationFrame(() => {
          body.style.height = "0px";
          body.style.opacity = "0";
        });
        body.addEventListener(
          "transitionend",
          () => {
            details.open = false;
            body.style.height = "";
            body.style.opacity = "";
          },
          { once: true }
        );
      } else {
        details.open = true;
        const endHeight = body.scrollHeight;
        body.style.height = "0px";
        body.style.opacity = "0";
        requestAnimationFrame(() => {
          body.style.height = `${endHeight}px`;
          body.style.opacity = "1";
        });
        body.addEventListener(
          "transitionend",
          () => {
            body.style.height = "";
            body.style.opacity = "";
          },
          { once: true }
        );
      }
    });
  });
});
