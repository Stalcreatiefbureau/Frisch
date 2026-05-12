// ============================================
// FRISCH TIMELINE CARDS — scroll-based rotation (Barba-compatible)
// ============================================
// Cards in de werkwijze sectie roteren tijdens scroll:
// - Even index (links): rotatie +10° → -10°
// - Oneven index (rechts): rotatie -10° → +10°
// ============================================

function initTimelineCards(container = document) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const wraps = container.querySelectorAll('.timeline_wrap');
  if (!wraps.length) return;

  wraps.forEach((wrap) => {
    // Anti-dubbel-init
    if (wrap.dataset.timelineCardsInit === 'true') return;
    wrap.dataset.timelineCardsInit = 'true';

    const cards = wrap.querySelectorAll('.timeline_row .card_component');
    if (!cards.length) return;

    const cardTweens = [];

    cards.forEach((card, index) => {
      const isLeft = index % 2 === 0;
      const targetRotation = isLeft ? -10 : 10;
      const startRotation = -targetRotation;

      const tween = gsap.fromTo(card,
        { rotation: startRotation },
        {
          rotation: targetRotation,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true
          }
        }
      );

      cardTweens.push(tween);
    });

    // Bewaar voor cleanup
    wrap._timelineCardTweens = cardTweens;
  });
}

// ============================================
// CLEANUP — kill triggers bij page leave
// ============================================
function killTimelineCards(container = document) {
  const wraps = container.querySelectorAll('.timeline_wrap');
  wraps.forEach((wrap) => {
    if (wrap._timelineCardTweens) {
      wrap._timelineCardTweens.forEach(tween => {
        if (tween.scrollTrigger) tween.scrollTrigger.kill();
        tween.kill();
      });
      wrap._timelineCardTweens = null;
    }
  });
}
