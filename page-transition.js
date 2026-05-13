// -----------------------------------------
// FRISCH PAGE TRANSITIONS (Osmo + Barba)
// Centrale orchestrator — roept alle init-functies aan via Barba hooks
// -----------------------------------------

gsap.registerPlugin(CustomEase, DrawSVGPlugin);

history.scrollRestoration = "manual";

let lenis = null;
let nextPage = document;
let onceFunctionsInitialized = false;

const hasLenis = typeof window.Lenis !== "undefined";
const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

const rmMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
let reducedMotion = rmMQ.matches;
rmMQ.addEventListener?.("change", e => (reducedMotion = e.matches));
rmMQ.addListener?.(e => (reducedMotion = e.matches));

const has = (s) => !!nextPage.querySelector(s);

let staggerDefault = 0.05;
let durationDefault = 0.6;

CustomEase.create("osmo", "0.625, 0.05, 0, 1");
gsap.defaults({ ease: "osmo", duration: durationDefault });

// -----------------------------------------
// FUNCTION REGISTRY
// -----------------------------------------

function initOnceFunctions() {
  initLenis();
  if (onceFunctionsInitialized) return;
  onceFunctionsInitialized = true;
}

function initBeforeEnterFunctions(next) {
  nextPage = next || document;
}

function initAfterEnterFunctions(next) {
  nextPage = next || document;

  // ALLE container-specifieke animaties hier
  if (has('[data-accordion-css-init]')) initAccordionCSS(nextPage);
  if (has('[data-marquee-scroll-direction-target]')) initMarqueeScrollDirection(nextPage);
  if (has('[data-draggable-marquee-init]')) initDraggableMarquee(nextPage);
  if (has('.section_steps-horizontal')) initHorizontalScroll(nextPage);
  if (has('.slider_wrap')) initPortfolioSlider(nextPage);
  if (has('[data-calc="dienst"]')) initTarievenCalculator(nextPage);
  if (has('[data-form-step]')) initQuotationForm(nextPage);
  if (has('[data-modal-open]') || has('[data-modal-parent]')) setupModals(nextPage);
  if (has('[data-vimeo-bg-init]')) initVimeoBGVideo(nextPage);
  if (has('[data-draw-scroll-wrap]')) initDrawPathOnScroll(nextPage);
  if (has('.timeline_wrap')) initTimelineCards(nextPage);
  if (has('.section_gallery')) initGalleryReveal(nextPage);
  if (has('.hover-cards_grid')) initHoverCards(nextPage);
  if (has('[data-stagger]')) initStaggerReveal(nextPage);

  // Refreshes als laatste
  if (hasLenis) lenis.resize();
  if (hasScrollTrigger) ScrollTrigger.refresh();
}

// -----------------------------------------
// PAGE TRANSITIONS
// -----------------------------------------

function runPageOnceAnimation(next) {
  const tl = gsap.timeline();
  tl.call(() => { resetPage(next); }, null, 0);

  // Stagger reveal op first page load voor [data-load-stagger] wrappers
  // Alle items uit alle wrappers samengevoegd in één doorlopende stagger
  const loadStaggerWraps = next.querySelectorAll('[data-load-stagger]');
  const allItems = [];
  loadStaggerWraps.forEach((wrap) => {
    allItems.push(...wrap.children);
  });

  if (allItems.length) {
    tl.fromTo(allItems, {
      y: 30,
      autoAlpha: 0,
    }, {
      y: 0,
      autoAlpha: 1,
      ease: "power4.out",
      duration: 0.5,
      stagger: 0.06,
    }, 0);
  }

  return tl;
}

function runPageLeaveAnimation(current, next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionSVGPath = transitionWrap?.querySelectorAll("svg path");

  const tl = gsap.timeline({
    onComplete: () => { current.remove(); }
  });

  if (reducedMotion || !transitionSVGPath?.length) {
    return tl.set(current, { autoAlpha: 0 });
  }

  tl.set(next, { autoAlpha: 0 }, 0);
  tl.set(transitionSVGPath, { strokeWidth: "5%", drawSVG: '0% 0%' });
  tl.to(transitionSVGPath, { duration: 1, drawSVG: '0% 85%', ease: "Power1.easeInOut" });
  tl.to(transitionSVGPath, { strokeWidth: "30%", duration: 0.75, ease: "Power1.easeInOut" }, "< 0.25");

  return tl;
}

function runPageEnterAnimation(next) {
  const transitionWrap = document.querySelector("[data-transition-wrap]");
  const transitionSVGPath = transitionWrap?.querySelectorAll("svg path");

  const tl = gsap.timeline();

  if (reducedMotion || !transitionSVGPath?.length) {
    tl.set(next, { autoAlpha: 1 });
    tl.add("pageReady");
    tl.call(resetPage, [next], "pageReady");
    return new Promise(resolve => tl.call(resolve, null, "pageReady"));
  }

  tl.add("startEnter", 1);
  tl.set(next, { autoAlpha: 1 }, "startEnter");
  tl.set(transitionSVGPath, { drawSVG: '0% 100%' });
  tl.to(transitionSVGPath, {
    duration: 1.25,
    drawSVG: '100% 100%',
    strokeWidth: "5%",
    ease: "Power1.easeInOut",
  }, "startEnter");

  // Stagger reveal voor wrappers met [data-load-stagger]
  // Alle items uit alle wrappers samengevoegd in één doorlopende stagger
  const loadStaggerWraps = next.querySelectorAll('[data-load-stagger]');
  const allItems = [];
  loadStaggerWraps.forEach((wrap) => {
    allItems.push(...wrap.children);
  });

  if (allItems.length) {
    tl.fromTo(allItems, {
      y: 30,
      autoAlpha: 0,
    }, {
      y: 0,
      autoAlpha: 1,
      ease: "power4.out",
      duration: 0.5,
      stagger: 0.06,
    }, "< 0.75");
  }

  tl.add("pageReady");
  tl.call(resetPage, [next], "pageReady");

  return new Promise(resolve => {
    tl.call(resolve, null, "pageReady");
  });
}

// -----------------------------------------
// BARBA HOOKS + INIT
// -----------------------------------------

barba.hooks.beforeEnter(data => {
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0, left: 0, right: 0,
  });

  if (lenis && typeof lenis.stop === "function") {
    lenis.stop();
  }

  // Sluit alle open Webflow nav-dropdowns en mobiele menu
  closeAllNavDropdowns();

  initBeforeEnterFunctions(data.next.container);
  applyThemeFrom(data.next.container);
});

barba.hooks.afterLeave((data) => {
  if (hasScrollTrigger) {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }
  killPageAnimations(data.current.container);
});

barba.hooks.enter(data => {
  initBarbaNavUpdate(data);
});

barba.hooks.afterEnter(data => {
  initAfterEnterFunctions(data.next.container);

  // Re-init Webflow's eigen JS (dropdowns, navigatie, IX2, sliders, etc)
  resetWebflow(data);

  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
  if (hasScrollTrigger) {
    ScrollTrigger.refresh();
  }
});

barba.init({
  debug: true,
  timeout: 7000,
  preventRunning: true,
  transitions: [
    {
      name: "default",
      sync: true,

      async once(data) {
        initOnceFunctions();
        initAfterEnterFunctions(data.next.container);
        return runPageOnceAnimation(data.next.container);
      },

      async leave(data) {
        return runPageLeaveAnimation(data.current.container, data.next.container);
      },

      async enter(data) {
        return runPageEnterAnimation(data.next.container);
      }
    }
  ],
});

// -----------------------------------------
// CLEANUP HELPER
// -----------------------------------------

function killPageAnimations(container) {
  if (!container) return;

  // Kill marquees
  container.querySelectorAll('[data-draggable-marquee-init], [data-marquee-scroll-direction-target]').forEach(el => {
    if (el._marqueeAnimation) {
      el._marqueeAnimation.kill();
      el._marqueeAnimation = null;
    }
    if (el._marqueeLoop) {
      el._marqueeLoop.kill();
      el._marqueeLoop = null;
    }
    if (el._marqueeObserver) {
      el._marqueeObserver.kill();
      el._marqueeObserver = null;
    }
  });

  // Kill portfolio slider
  const sliderTrack = container.querySelector('.slider_track');
  if (sliderTrack && sliderTrack._draggable) {
    sliderTrack._draggable.forEach(d => d.kill());
    sliderTrack._draggable = null;
  }
  const sliderWrap = container.querySelector('.slider_wrap');
  if (sliderWrap && sliderWrap._sliderAutoplay) {
    clearInterval(sliderWrap._sliderAutoplay);
    sliderWrap._sliderAutoplay = null;
  }

  // Kill draw path on scroll
  if (typeof killDrawPathOnScroll === 'function') killDrawPathOnScroll(container);

  // Kill timeline cards
  if (typeof killTimelineCards === 'function') killTimelineCards(container);

  // Kill gallery reveal
  if (typeof killGalleryReveal === 'function') killGalleryReveal(container);

  // Kill Vimeo bg players
  if (typeof killVimeoBGVideo === 'function') killVimeoBGVideo(container);

  // Kill Hover cards
  if (typeof killHoverCards === 'function') killHoverCards(container);

  // Kill stagger reveal
  if (typeof killStaggerReveal === 'function') killStaggerReveal(container);
}

// -----------------------------------------
// WEBFLOW RE-INIT — voor dropdowns, IX2, navigatie na page transition
// -----------------------------------------

function resetWebflow(data) {
  if (typeof Webflow === 'undefined') return;

  // Pak het nieuwe HTML van de Barba data en lees het data-wf-page attribuut
  const parser = new DOMParser();
  const dom = parser.parseFromString(data.next.html, 'text/html');
  const webflowPageId = dom.querySelector('html').getAttribute('data-wf-page');

  if (webflowPageId) {
    document.documentElement.setAttribute('data-wf-page', webflowPageId);
  }

  // Destroy en re-init Webflow's eigen modules
  Webflow.destroy();
  Webflow.ready();
  Webflow.require('ix2')?.init();
}

// -----------------------------------------
// NAV CLEANUP — sluit dropdowns + mobile menu
// -----------------------------------------

function closeAllNavDropdowns() {
  // Webflow dropdowns (hover + click)
  document.querySelectorAll('.w-dropdown.w--open').forEach(dropdown => {
    dropdown.classList.remove('w--open');
    const toggle = dropdown.querySelector('.w-dropdown-toggle');
    const list = dropdown.querySelector('.w-dropdown-list');
    if (toggle) {
      toggle.classList.remove('w--open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    if (list) list.classList.remove('w--open');
  });

  document.querySelectorAll('.w-dropdown-toggle.w--open').forEach(toggle => {
    toggle.classList.remove('w--open');
    toggle.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.w-dropdown-list.w--open').forEach(list => {
    list.classList.remove('w--open');
  });

  document.querySelectorAll('.w-nav-button.w--open').forEach(btn => {
    btn.classList.remove('w--open');
    btn.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.w-nav-overlay').forEach(overlay => {
    overlay.style.display = 'none';
  });
  document.querySelectorAll('.w-nav-menu.w--open').forEach(menu => {
    menu.classList.remove('w--open');
  });

  document.body.classList.remove('w--nav-menu-open');
}

// -----------------------------------------
// GENERIC + HELPERS
// -----------------------------------------

const themeConfig = {
  light: { nav: "dark", transition: "light" },
  dark: { nav: "light", transition: "dark" }
};

function applyThemeFrom(container) {
  const pageTheme = container?.dataset?.pageTheme || "light";
  const config = themeConfig[pageTheme] || themeConfig.light;

  document.body.dataset.pageTheme = pageTheme;
  const transitionEl = document.querySelector('[data-theme-transition]');
  if (transitionEl) transitionEl.dataset.themeTransition = config.transition;

  const nav = document.querySelector('[data-theme-nav]');
  if (nav) nav.dataset.themeNav = config.nav;
}

function initLenis() {
  if (lenis) return;
  if (!hasLenis) return;

  lenis = new Lenis({
    lerp: 0.165,
    wheelMultiplier: 1.25,
  });

  if (hasScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
  }

  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
}

function resetPage(container) {
  window.scrollTo(0, 0);
  gsap.set(container, { clearProps: "position,top,left,right" });

  if (hasLenis) {
    lenis.resize();
    lenis.start();
  }
}

function initBarbaNavUpdate(data) {
  const tpl = document.createElement('template');
  tpl.innerHTML = data.next.html.trim();
  const nextNodes = tpl.content.querySelectorAll('[data-barba-update]');
  const currentNodes = document.querySelectorAll('nav [data-barba-update]');

  currentNodes.forEach((curr, index) => {
    const next = nextNodes[index];
    if (!next) return;

    const newStatus = next.getAttribute('aria-current');
    if (newStatus !== null) {
      curr.setAttribute('aria-current', newStatus);
    } else {
      curr.removeAttribute('aria-current');
    }

    const newClassList = next.getAttribute('class') || '';
    curr.setAttribute('class', newClassList);
  });
}
