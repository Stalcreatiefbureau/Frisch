// ============================================
// FRISCH HOVER CARDS — fan hover effect (Barba-compatible)
// ============================================
// Cards staan in een fan-layout (gestapeld met rotatie).
// Hover beweegt cursor binnen de container → de card onder de cursor
// komt recht naar voren, de andere cards waaieren weg.
// Alleen actief op desktop (≥992px).
// ============================================

function initHoverCards(container = document) {
  if (typeof gsap === 'undefined') return;

  const wrappers = container.querySelectorAll('.hover-cards_grid');
  if (!wrappers.length) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 992px)', () => {
    wrappers.forEach((wrapper) => {
      // Anti-dubbel-init
      if (wrapper.dataset.hoverCardsInit === 'true') return;
      wrapper.dataset.hoverCardsInit = 'true';

      const cards = wrapper.querySelectorAll('.hover_card');
      if (!cards.length) return;

      const cardsLength = cards.length;
      const cardContent = cards; // hier dezelfde nodes — script gebruikt beide
      let currentPortion = 0;

      // Initial scatter
      cards.forEach(card => {
        gsap.set(card, {
          xPercent: (Math.random() - 0.5) * 10,
          yPercent: (Math.random() - 0.5) * 10,
          rotation: (Math.random() - 0.5) * 20,
        });
      });

      // Event handlers — bewaar referenties voor cleanup
      const onMouseMove = (e) => {
        const containerW = wrapper.clientWidth;
        const mouseX = e.clientX - wrapper.getBoundingClientRect().left;
        const percentage = mouseX / containerW;
        const activePortion = Math.ceil(percentage * cardsLength);

        if (
          currentPortion !== activePortion &&
          activePortion > 0 &&
          activePortion <= cardsLength
        ) {
          if (currentPortion !== 0) { resetPortion(currentPortion - 1); }
          currentPortion = activePortion;
          newPortion(currentPortion - 1);
        }
      };

      const onMouseLeave = () => {
        if (currentPortion > 0) {
          resetPortion(currentPortion - 1);
        }
        currentPortion = 0;
        gsap.to(cardContent, {
          xPercent: 0,
          ease: 'elastic.out(1, 0.75)',
          duration: 0.8
        });
      };

      function resetPortion(index) {
        gsap.to(cards[index], {
          xPercent: (Math.random() - 0.5) * 10,
          yPercent: (Math.random() - 0.5) * 10,
          rotation: (Math.random() - 0.5) * 20,
          scale: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.75)',
        });
      }

      function newPortion(i) {
        gsap.to(cards[i], {
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          duration: 0.8,
          scale: 1.1,
          ease: 'elastic.out(1, 0.75)'
        });

        cardContent.forEach((content, index) => {
          if (index !== i) {
            gsap.to(content, {
              xPercent: 60 / (index - i),
              ease: 'elastic.out(1, 0.75)',
              duration: 0.8
            });
          } else {
            gsap.to(content, {
              xPercent: 0,
              ease: 'elastic.out(1, 0.75)',
              duration: 0.8
            });
          }
        });
      }

      wrapper.addEventListener('mousemove', onMouseMove);
      wrapper.addEventListener('mouseleave', onMouseLeave);

      // Bewaar voor cleanup
      wrapper._hoverCardsHandlers = { onMouseMove, onMouseLeave };
    });

    // Cleanup bij breakpoint change (resize naar tablet/mobile)
    return () => {
      wrappers.forEach((wrapper) => {
        if (wrapper._hoverCardsHandlers) {
          wrapper.removeEventListener('mousemove', wrapper._hoverCardsHandlers.onMouseMove);
          wrapper.removeEventListener('mouseleave', wrapper._hoverCardsHandlers.onMouseLeave);
          wrapper._hoverCardsHandlers = null;
        }
        // Reset alle cards naar originele staat
        const cards = wrapper.querySelectorAll('.hover_card');
        cards.forEach(card => gsap.set(card, { clearProps: 'all' }));
        // Reset init-flag
        wrapper.dataset.hoverCardsInit = '';
      });
    };
  });
}

// ============================================
// CLEANUP bij page leave
// ============================================
function killHoverCards(container = document) {
  const wrappers = container.querySelectorAll('.hover-cards_grid');
  wrappers.forEach((wrapper) => {
    if (wrapper._hoverCardsHandlers) {
      wrapper.removeEventListener('mousemove', wrapper._hoverCardsHandlers.onMouseMove);
      wrapper.removeEventListener('mouseleave', wrapper._hoverCardsHandlers.onMouseLeave);
      wrapper._hoverCardsHandlers = null;
    }
  });
}
