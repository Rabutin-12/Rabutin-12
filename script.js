/* =====================================================================
   Portfolio — Ernesto Rabutin
   JavaScript vanilla uniquement.
   Fonctionnalités :
     1. Mode clair/sombre avec mémorisation (localStorage + préf. système)
     2. Effet machine à écrire sur le rôle
     3. Apparition des éléments au scroll (Intersection Observer)
     4. Navigation : état « scrollé » + menu mobile
     5. Bouton « Retour en haut »
     6. Année automatique dans le footer
   ===================================================================== */

(function () {
  "use strict";

  /* Respecte la préférence de mouvement réduit pour certaines animations JS */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     1. THÈME CLAIR / SOMBRE (avec mémorisation)
  --------------------------------------------------------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const STORAGE_KEY = "portfolio-theme";

  /* Lit le thème sauvegardé ; sinon suit la préférence système.
     Le try/catch protège les contextes où localStorage est indisponible. */
  function getInitialTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) { /* stockage inaccessible : on ignore */ }
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) themeToggle.setAttribute("aria-pressed", String(theme === "light"));
  }

  applyTheme(getInitialTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------------------------------------------------------------
     2. EFFET MACHINE À ÉCRIRE
     Fait défiler les technologies réelles du CV après « Développeur Full-Stack ».
  --------------------------------------------------------------- */
  const typeEl = document.getElementById("typewriter");
  const words = ["Laravel", "Symfony", "React.js", "Next.js", "PHP"];

  if (typeEl) {
    if (prefersReducedMotion) {
      /* Sans animation : on affiche simplement le premier terme */
      typeEl.textContent = "· " + words[0];
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      function typeLoop() {
        const current = words[wordIndex];
        // Ajoute ou retire un caractère selon la phase
        charIndex += deleting ? -1 : 1;
        typeEl.textContent = "· " + current.substring(0, charIndex);

        let delay = deleting ? 55 : 110;

        if (!deleting && charIndex === current.length) {
          // Mot complet : pause avant l'effacement
          delay = 1400;
          deleting = true;
        } else if (deleting && charIndex === 0) {
          // Mot effacé : passe au suivant
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 350;
        }
        setTimeout(typeLoop, delay);
      }
      typeLoop();
    }
  }

  /* ---------------------------------------------------------------
     3. APPARITION AU SCROLL (Intersection Observer)
     Ajoute la classe .is-visible quand l'élément entre dans le viewport.
  --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // une seule fois par élément
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    /* Repli : navigateurs sans IntersectionObserver */
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------
     4. NAVIGATION
  --------------------------------------------------------------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");

  /* État « scrollé » : fond translucide dès qu'on quitte le haut de page */
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 40);
    toggleToTop();
  }

  /* Menu mobile : ouverture / fermeture */
  function closeMenu() {
    if (!navLinks || !burger) return;
    navLinks.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Ouvrir le menu");
  }

  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
      burger.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
    });
    // Ferme le menu après un clic sur un lien
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ---------------------------------------------------------------
     5. BOUTON « RETOUR EN HAUT »
  --------------------------------------------------------------- */
  const toTop = document.getElementById("toTop");

  function toggleToTop() {
    if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 600);
  }

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* Écoute optimisée du scroll (requestAnimationFrame pour la performance) */
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  onScroll(); // état initial

  /* ---------------------------------------------------------------
     6. ANNÉE AUTOMATIQUE (footer)
  --------------------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
