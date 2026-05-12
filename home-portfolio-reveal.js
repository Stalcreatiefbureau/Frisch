// ============================================
// FRISCH GALLERY REVEAL (Barba-compatible)
// ============================================
// Fullscreen hero foto zoomt uit naar center grid-item.
// Grid items faden in vanuit center, eyebrow + heading + CTA verschijnen op het laatst.
// Alleen actief op tablet en groter (≥768px) — mobile toont statische layout.
// ============================================

function initGalleryReveal(container = document) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const sections = container.querySelectorAll('.section_gallery');
  if (!sections.length) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 768px)', () => {
    sections.forEach((section) => {
      // Anti-dubbel-init
      if (section.dataset.galleryRevealInit === 'true') return;
      section.dataset.galleryRevealInit = 'true';

      const pin = section.querySelector('.gallery_pin');
      const hero = section.querySelector('.gallery_hero');
      const grid = section.querySelector('.gallery_grid');
      const items = section.querySelectorAll('.gallery_item');
      const center = section.querySelector('.gallery_center');
      const text = section.querySelector('.gallery_text');
      const heading = text?.querySelector('h2');
      const button = text?.querySelector('a');
      const eyebrow = text?.querySelector('.eyebrow_wrap');

      if (!pin || !hero || !grid || !center || !text) return;

      // Initial states
      gsap.set(items, { scale: 0.4, opacity: 0, transformOrigin: 'center center' });
      gsap.set(text, { opacity: 1 });
      if (eyebrow) gsap.set(eyebrow, { opacity: 0 });
      if (heading) gsap.set(heading, { yPercent: 100 });
      if (button) gsap.set(button, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          scrub: 1.5,
          pin: pin,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      // FASE 1: Hero zoomt uit (0% - 65%)
      tl.to(hero, {
        duration: 0.65,
        ease: 'power3.inOut',
        onUpdate: function() {
          const progress = this.progress();
          const centerRect = center.getBoundingClientRect();
          const pinRect = pin.getBoundingClientRect();

          const startWidth = window.innerWidth;
          const startHeight = window.innerHeight;
          const endWidth = centerRect.width;
          const endHeight = centerRect.height;
          const endLeft = centerRect.left - pinRect.left;
          const endTop = centerRect.top - pinRect.top;

          hero.style.width = (startWidth + (endWidth - startWidth) * progress) + 'px';
          hero.style.height = (startHeight + (endHeight - startHeight) * progress) + 'px';
          hero.style.left = (endLeft * progress) + 'px';
          hero.style.top = (endTop * progress) + 'px';
        }
      }, 0);

      // FASE 2: Grid items komen vloeiend binnen (35%)
      tl.to(items, {
        scale: 1,
        opacity: 0.4,
        duration: 0.5,
        stagger: {
          amount: 0.3,
          from: 'center',
          ease: 'power2.out'
        },
        ease: 'power3.out'
      }, 0.35);

      // FASE 3: Hero dim soepel (70%)
      tl.to(hero, {
        opacity: 0.4,
        duration: 0.2,
        ease: 'power2.inOut'
      }, 0.7);

      // FASE 4a: Eyebrow fade-in (75%)
      if (eyebrow) {
        tl.to(eyebrow, {
          opacity: 1,
          duration: 0.2,
          ease: 'power2.out'
        }, 0.75);
      }

      // FASE 4b: Heading slide-up (80%)
      if (heading) {
        tl.to(heading, {
          yPercent: 0,
          duration: 0.25,
          ease: 'power2.out'
        }, 0.8);
      }

      // FASE 5: Button fade-in (88%)
      if (button) {
        tl.to(button, {
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: 'power2.out'
        }, 0.88);
      }

      // Bewaar voor cleanup
      section._galleryRevealTl = tl;
    });

    // Cleanup bij breakpoint change (resize naar mobile)
    return () => {
      sections.forEach((section) => {
        if (section._galleryRevealTl) {
          if (section._galleryRevealTl.scrollTrigger) {
            section._galleryRevealTl.scrollTrigger.kill();
          }
          section._galleryRevealTl.kill();
          section._galleryRevealTl = null;
        }
        // Reset inline styles op alle geanimeerde elementen
        const hero = section.querySelector('.gallery_hero');
        const items = section.querySelectorAll('.gallery_item');
        const text = section.querySelector('.gallery_text');
        const heading = text?.querySelector('h2');
        const button = text?.querySelector('a');
        const eyebrow = text?.querySelector('.eyebrow_wrap');

        if (hero) gsap.set(hero, { clearProps: 'all' });
        if (items.length) gsap.set(items, { clearProps: 'all' });
        if (eyebrow) gsap.set(eyebrow, { clearProps: 'all' });
        if (heading) gsap.set(heading, { clearProps: 'all' });
        if (button) gsap.set(button, { clearProps: 'all' });

        // Reset init-flag zodat bij terug naar desktop hij weer init
        section.dataset.galleryRevealInit = '';
      });
    };
  });
}

// ============================================
// CLEANUP bij page leave
// ============================================
function killGalleryReveal(container = document) {
  const sections = container.querySelectorAll('.section_gallery');
  sections.forEach((section) => {
    if (section._galleryRevealTl) {
      if (section._galleryRevealTl.scrollTrigger) {
        section._galleryRevealTl.scrollTrigger.kill();
      }
      section._galleryRevealTl.kill();
      section._galleryRevealTl = null;
    }
  });
}
