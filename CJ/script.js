/* =====================================================================
   Clinton C. Jarka — Portfolio Scripts
   Vanilla JS only. No external libraries.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- Preloader ---------- */
  window.addEventListener("load", function () {
    var preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(function () {
        preloader.classList.add("done");
      }, 350);
    }
  });

  /* ---------- Theme toggle (persisted) ---------- */
  var THEME_KEY = "cj-portfolio-theme";
  var body = document.body;
  var themeToggle = document.getElementById("themeToggle");

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }
  function storeTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* storage unavailable — theme just won't persist */
    }
  }

  var savedTheme = getStoredTheme();
  if (savedTheme === "light" || savedTheme === "dark") {
    body.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
    body.setAttribute("data-theme", "light");
  }
  updateToggleLabel();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = body.getAttribute("data-theme") === "light" ? "dark" : "light";
      body.setAttribute("data-theme", current);
      storeTheme(current);
      updateToggleLabel();
    });
  }
  function updateToggleLabel() {
    if (!themeToggle) return;
    var isLight = body.getAttribute("data-theme") === "light";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    themeToggle.setAttribute("aria-pressed", String(isLight));
  }

  /* ---------- Mobile navigation ---------- */
  var hamburger = document.getElementById("hamburger");
  var navLinks = document.getElementById("navLinks");

  function closeMenu() {
    navLinks.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-menu"/></svg>';
  }
  function toggleMenu() {
    var isOpen = navLinks.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.innerHTML = isOpen
      ? '<svg class="icon" aria-hidden="true"><use href="#icon-close"/></svg>'
      : '<svg class="icon" aria-hidden="true"><use href="#icon-menu"/></svg>';
  }
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", toggleMenu);
    navLinks.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("click", function (e) {
      if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ---------- Header scroll state + active nav link ---------- */
  var header = document.getElementById("site-header");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section, .hero"));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var backToTop = document.getElementById("backToTop");

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 480);

    var scrollPos = window.scrollY + 140;
    var currentId = sections.length ? sections[0].id : null;
    sections.forEach(function (sec) {
      if (scrollPos >= sec.offsetTop) currentId = sec.id;
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle("active-link", a.getAttribute("href") === "#" + currentId);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Scroll reveal (single IntersectionObserver) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Animated stat counters ---------- */
  var statNums = document.querySelectorAll(".stat-num");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1200;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && statNums.length) {
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    statNums.forEach(function (el) {
      statObserver.observe(el);
    });
  }

  /* ---------- Animated skill bars ---------- */
  var skillFills = document.querySelectorAll(".skill-fill");
  if ("IntersectionObserver" in window && skillFills.length) {
    var skillObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var level = entry.target.getAttribute("data-level") || 0;
            entry.target.style.width = level + "%";
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillFills.forEach(function (el) {
      skillObserver.observe(el);
    });
  }

  /* ---------- Project filtering ---------- */
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".project-card");
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      var filter = btn.getAttribute("data-filter");
      projectCards.forEach(function (card) {
        var cats = (card.getAttribute("data-category") || "").split(" ");
        var show = filter === "all" || cats.indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById("contactForm");
  var formStatus = document.getElementById("formStatus");

  function setFieldError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById("err-" + fieldId);
    if (!field || !errorEl) return;
    var wrapper = field.closest(".form-field");
    if (message) {
      wrapper.classList.add("invalid");
      errorEl.textContent = message;
    } else {
      wrapper.classList.remove("invalid");
      errorEl.textContent = "";
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("fullName").value.trim();
      var email = document.getElementById("email").value.trim();
      var phone = document.getElementById("phone").value.trim();
      var subject = document.getElementById("subject").value.trim();
      var message = document.getElementById("message").value.trim();
      var valid = true;

      if (name.length < 2) {
        setFieldError("fullName", "Please enter your full name.");
        valid = false;
      } else setFieldError("fullName", "");

      if (!isValidEmail(email)) {
        setFieldError("email", "Please enter a valid email address.");
        valid = false;
      } else setFieldError("email", "");

      if (phone && !/^[0-9+\-()\s]{6,}$/.test(phone)) {
        setFieldError("phone", "Please enter a valid phone number.");
        valid = false;
      } else setFieldError("phone", "");

      if (subject.length < 3) {
        setFieldError("subject", "Please add a short subject.");
        valid = false;
      } else setFieldError("subject", "");

      if (message.length < 10) {
        setFieldError("message", "Message should be at least 10 characters.");
        valid = false;
      } else setFieldError("message", "");

      if (!valid) {
        formStatus.textContent = "Please fix the highlighted fields above.";
        formStatus.className = "form-status error";
        return;
      }

      /* No backend is connected yet — this simulates a successful send.
         Wire this up to an email service (e.g. Formspree, EmailJS, or a
         custom backend) to deliver real messages. */
      formStatus.textContent = "Thanks, " + name.split(" ")[0] + "! Your message has been noted — I'll get back to you soon.";
      formStatus.className = "form-status success";
      form.reset();
    });
  }
})();
