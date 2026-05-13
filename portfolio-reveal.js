// ============================================
// FRISCH PORTFOLIO REVEAL (Barba-compatible)
// ============================================
// Bij page load / page transition zoomt .portfolio_images-wrap uit
// vanaf scale 2 naar scale 1 met osmo easing.
// Alleen actief op de portfolio pagina (waar het element bestaat).
// ============================================

function initPortfolioReveal(container = document) {
  if (typeof gsap === 'undefined') return;

  const wraps = container.querySelectorAll('.portfolio_images-wrap');
  if (!wraps.length) return;

  wraps.forEach((wrap) => {
    // Anti-dubbel-init
    if (wrap.dataset.portfolioRevealInit === 'true') return;
    wrap.dataset.portfolioRevealInit = 'true';

    const tween = gsap.fromTo(wrap,
      {
        scale: 2,
        autoAlpha: 0,
      },
      {
        scale: 1,
        autoAlpha: 1,
        duration: 1.6,
        ease: 'osmo',
      }
    );

    // Bewaar voor cleanup
    wrap._portfolioRevealTween = tween;
  });
}

// ============================================
// CLEANUP bij page leave
// ============================================
function killPortfolioReveal(container = document) {
  const wraps = container.querySelectorAll('.portfolio_images-wrap');
  wraps.forEach((wrap) => {
    if (wrap._portfolioRevealTween) {
      wrap._portfolioRevealTween.kill();
      wrap._portfolioRevealTween = null;
    }
  });
}
