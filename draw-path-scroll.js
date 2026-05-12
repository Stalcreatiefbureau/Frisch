// ============================================
// FRISCH DRAW PATH ON SCROLL (Osmo, Barba-compatible)
// SVG path tekent zichzelf op basis van scroll positie
// Alleen actief op tablet en groter (≥768px)
// ============================================

function initDrawPathOnScroll(container = document) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const wrappers = container.querySelectorAll('[data-draw-scroll-wrap]');
  if (!wrappers.length) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', () => {
    wrappers.forEach((wrap) => {
      // Kill bestaande timeline op deze wrapper
      if (wrap._drawTl) {
        if (wrap._drawTl.scrollTrigger) {
          wrap._drawTl.scrollTrigger.kill();
        }
        wrap._drawTl.kill();
        wrap._drawTl = null;
      }

      // Gebruik altijd de desktop SVG — mobile SVG is niet meer relevant
      const svgToUse = wrap.querySelector('[data-draw-scroll-desktop]');
      if (!svgToUse) return;

      const path = svgToUse.querySelector('[data-draw-scroll-path]');
      if (!path) return;

      const tl = gsap.timeline({
        defaults: { ease: 'linear' },
        scrollTrigger: {
          trigger: wrap,
          start: 'clamp(top center)',
          end: 'clamp(bottom center)',
          scrub: true,
          invalidateOnRefresh: true
        }
      });

      tl.fromTo(path,
        { drawSVG: 0 },
        { drawSVG: '100%', duration: 1 }
      );

      wrap._drawTl = tl;
    });

    ScrollTrigger.refresh();

    // Cleanup bij breakpoint change
    return () => {
      wrappers.forEach((wrap) => {
        if (wrap._drawTl) {
          if (wrap._drawTl.scrollTrigger) {
            wrap._drawTl.scrollTrigger.kill();
          }
          wrap._drawTl.kill();
          wrap._drawTl = null;
        }
      });
    };
  });
}

// ============================================
// CLEANUP bij page leave
// ============================================
function killDrawPathOnScroll(container = document) {
  const wrappers = container.querySelectorAll('[data-draw-scroll-wrap]');
  wrappers.forEach((wrap) => {
    if (wrap._drawTl) {
      if (wrap._drawTl.scrollTrigger) {
        wrap._drawTl.scrollTrigger.kill();
      }
      wrap._drawTl.kill();
      wrap._drawTl = null;
    }
  });
}
