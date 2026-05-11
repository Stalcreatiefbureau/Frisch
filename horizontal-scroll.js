window.addEventListener('load', () => {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.matchMedia({
    "(min-width: 768px)": function() {
      const section = document.querySelector('.section_steps-horizontal');
      const track = section?.querySelector('.content_slider.is-pin-track');
      const pin = section?.querySelector('.layout_vertical.is-pin');
      
      if (!section || !track || !pin) return;

      function getScrollDistance() {
        return track.scrollWidth - track.parentElement.offsetWidth;
      }

      // Section hoogte = scroll-afstand + 1 viewport voor de pin
      function setSectionHeight() {
        const distance = getScrollDistance();
        section.style.height = `${distance + window.innerHeight}px`;
      }

      setSectionHeight();
      window.addEventListener('resize', setSectionHeight);

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
});
