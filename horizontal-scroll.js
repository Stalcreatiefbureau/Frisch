// ============================================
// FRISCH HORIZONTAL SCROLL (Barba-compatible)
// ScrollTrigger pinned horizontal scroll voor stappen-sectie
// ============================================

function initHorizontalScroll(container = document) {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.matchMedia({
    "(min-width: 768px)": function() {
      const section = container.querySelector('.section_steps-horizontal');
      const track = section?.querySelector('.content_slider.is-pin-track');
      const pin = section?.querySelector('.layout_vertical.is-pin');

      if (!section || !track || !pin) return;

      // Anti-dubbel-init
      if (section.dataset.horizontalScrollInit === 'true') return;
      section.dataset.horizontalScrollInit = 'true';

      function getScrollDistance() {
        return track.scrollWidth - track.parentElement.offsetWidth;
      }

      function setSectionHeight() {
        const distance = getScrollDistance();
        section.style.height = `${distance + window.innerHeight}px`;
      }

      setSectionHeight();

      // Resize listener — bewaar voor eventuele cleanup
      const resizeHandler = () => setSectionHeight();
      window.addEventListener('resize', resizeHandler);
      section._resizeHandler = resizeHandler;

      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }
  });
}
