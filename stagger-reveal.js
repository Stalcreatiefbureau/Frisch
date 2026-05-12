// ============================================
// FRISCH STAGGER REVEAL (Barba-compatible)
// ============================================
// Generic stagger fade-in animatie voor elementen die in beeld scrollen.
//
// USAGE:
//   <div data-stagger>
//     <div data-stagger-item>Item 1</div>
//     <div data-stagger-item>Item 2</div>
//   </div>
//
// Of zonder data-stagger-item, dan worden direct-children gebruikt.
//
// OPTIONELE ATTRIBUTES op de wrapper:
//   data-stagger-amount    Spreiding over items in seconden (default: 0.15)
//   data-stagger-duration  Duur per item in seconden (default: 0.5)
//   data-stagger-y         Y-offset start in pixels (default: 30)
//   data-stagger-ease      GSAP easing (default: power4.out)
//   data-stagger-start     ScrollTrigger start (default: top 70%)
//   data-stagger-from      Vanaf welk item: start/end/center/random (default: start)
//   data-stagger-target    Custom CSS selector voor items
// ============================================

function initStaggerReveal(container = document) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const wrappers = container.querySelectorAll('[data-stagger]');
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    // Anti-dubbel-init
    if (wrapper.dataset.staggerInit === 'true') return;
    wrapper.dataset.staggerInit = 'true';

    // Bepaal welke items te animeren
    let items;
    const customTarget = wrapper.getAttribute('data-stagger-target');

    if (customTarget) {
      items = wrapper.querySelectorAll(customTarget);
    } else {
      const explicit = wrapper.querySelectorAll(':scope > [data-stagger-item]');
      if (explicit.length) {
        items = explicit;
      } else {
        const nested = wrapper.querySelectorAll('[data-stagger-item]');
        if (nested.length) {
          items = nested;
        } else {
          items = wrapper.querySelectorAll(':scope > *');
        }
      }
    }

    if (!items.length) return;

    // Parse attributes met defaults
    const amount = parseFloat(wrapper.getAttribute('data-stagger-amount')) || 0.15;
    const duration = parseFloat(wrapper.getAttribute('data-stagger-duration')) || 0.5;
    const yOffset = parseFloat(wrapper.getAttribute('data-stagger-y')) || 30;
    const ease = wrapper.getAttribute('data-stagger-ease') || 'power4.out';
    const startPos = wrapper.getAttribute('data-stagger-start') || 'top 70%';
    const from = wrapper.getAttribute('data-stagger-from') || 'start';

    // Animatie: items komen van yOffset naar 0
    const tween = gsap.fromTo(items,
      {
        opacity: 0,
        y: yOffset
      },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        ease: ease,
        stagger: {
          amount: amount,
          from: from
        },
        scrollTrigger: {
          trigger: wrapper,
          start: startPos,
          toggleActions: 'play none none none',
          once: true
        }
      }
    );

    // Bewaar voor cleanup
    wrapper._staggerTween = tween;
  });
}

// ============================================
// CLEANUP bij page leave
// ============================================
function killStaggerReveal(container = document) {
  const wrappers = container.querySelectorAll('[data-stagger]');
  wrappers.forEach((wrapper) => {
    if (wrapper._staggerTween) {
      if (wrapper._staggerTween.scrollTrigger) {
        wrapper._staggerTween.scrollTrigger.kill();
      }
      wrapper._staggerTween.kill();
      wrapper._staggerTween = null;
    }
  });
}
