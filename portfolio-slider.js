// ============================================
// FRISCH PORTFOLIO SLIDER (Barba-compatible)
// Draggable centered slider met clones + autoplay
// ============================================

function initPortfolioSlider(container = document) {
  const wrap = container.querySelector('.slider_wrap');
  if (!wrap) return;

  // Anti-dubbel-init
  if (wrap.dataset.sliderInit === 'true') return;
  wrap.dataset.sliderInit = 'true';

  const track = wrap.querySelector('.slider_track');
  const originalSlides = gsap.utils.toArray('.slider_slide', track);

  gsap.registerPlugin(Draggable, InertiaPlugin);

  // === CLONE SETUP ===
  const cloneSets = 2;
  const totalOriginals = originalSlides.length;

  for (let i = 0; i < cloneSets; i++) {
    originalSlides.forEach(slide => {
      const cloneBefore = slide.cloneNode(true);
      const cloneAfter = slide.cloneNode(true);
      cloneBefore.classList.add('is-clone');
      cloneAfter.classList.add('is-clone');
      track.insertBefore(cloneBefore, track.firstChild);
      track.appendChild(cloneAfter);
    });
  }

  const allSlides = gsap.utils.toArray('.slider_slide', track);
  const cloneCount = cloneSets * totalOriginals;

  let currentIndex = cloneCount;
  let autoplayTimer;
  let isAnimating = false;
  const autoplayDelay = 4000;
  const transitionDuration = 0.9;

  // === HELPERS ===
  function getOffset(index) {
    const slide = allSlides[index];
    const wrapWidth = wrap.offsetWidth;
    const slideWidth = slide.offsetWidth;
    const slideLeft = slide.offsetLeft;
    return -(slideLeft - (wrapWidth - slideWidth) / 2);
  }

  function getSnapPositions() {
    return allSlides.map((slide) => {
      const wrapWidth = wrap.offsetWidth;
      const slideWidth = slide.offsetWidth;
      return -(slide.offsetLeft - (wrapWidth - slideWidth) / 2);
    });
  }

  function updateSlidesByPosition() {
    const wrapCenter = wrap.offsetWidth / 2;
    const trackX = gsap.getProperty(track, 'x');

    allSlides.forEach((slide) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2 + trackX;
      const distance = Math.abs(slideCenter - wrapCenter);
      const maxDistance = slide.offsetWidth;

      // Grotere deadzone (30px) — slides die "ongeveer in het midden" zijn worden volledig actief
      const adjustedDistance = Math.max(0, distance - 30);
      const progress = Math.min(adjustedDistance / maxDistance, 1);

      const scale = 1 - (0.15 * progress);
      const opacity = 1 - (0.6 * progress);
      const zIndex = Math.round(100 - distance);

      gsap.set(slide, { scale, opacity, zIndex });
    });
  }

  function normalizeIndex() {
    const realStart = cloneCount;
    const realEnd = cloneCount + totalOriginals;

    let shift = 0;
    if (currentIndex >= realEnd) shift = -totalOriginals;
    else if (currentIndex < realStart) shift = totalOriginals;

    if (shift !== 0) {
      gsap.killTweensOf(track);

      const oldOffset = getOffset(currentIndex);
      currentIndex += shift;
      const newOffset = getOffset(currentIndex);
      const currentX = gsap.getProperty(track, 'x');
      const correctedX = currentX + (newOffset - oldOffset);

      gsap.set(track, { x: correctedX });
      updateSlidesByPosition();
    }
  }

  function goToSlide(index, duration = transitionDuration) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = index;

    gsap.to(track, {
      x: getOffset(index),
      duration: duration,
      ease: 'power3.inOut',
      onUpdate: updateSlidesByPosition,
      onComplete: () => {
        isAnimating = false;
        requestAnimationFrame(() => { normalizeIndex(); });
      }
    });
  }

  function syncCurrentIndex() {
    const wrapCenter = wrap.offsetWidth / 2;
    const trackX = gsap.getProperty(track, 'x');

    let closestIndex = currentIndex;
    let closestDistance = Infinity;

    allSlides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2 + trackX;
      const distance = Math.abs(slideCenter - wrapCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    currentIndex = closestIndex;
  }

  function nextSlide() { goToSlide(currentIndex + 1); }

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, autoplayDelay);
    wrap._sliderAutoplay = autoplayTimer;
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  // === DRAG ===
  const draggables = Draggable.create(track, {
    type: 'x',
    inertia: true,
    cursor: 'grab',
    activeCursor: 'grabbing',
    dragResistance: 0.6,
    snap: {
      x: function(value) {
        const positions = getSnapPositions();
        return positions.reduce((prev, curr) =>
          Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        );
      }
    },
    onPress: function() {
      stopAutoplay();
      track.classList.add('is-dragging');
      gsap.killTweensOf(track);
      isAnimating = false;
    },
    onDrag: updateSlidesByPosition,
    onThrowUpdate: updateSlidesByPosition,
    onThrowComplete: function() {
      track.classList.remove('is-dragging');
      syncCurrentIndex();
      requestAnimationFrame(() => {
        normalizeIndex();
        startAutoplay();
      });
    },
    onRelease: function() {
      if (!this.tween || !this.tween.isActive()) {
        track.classList.remove('is-dragging');
        syncCurrentIndex();
        requestAnimationFrame(() => {
          normalizeIndex();
          startAutoplay();
        });
      }
    }
  });

  // Bewaar voor cleanup bij page leave
  track._draggable = draggables;

  // === HOVER PAUSE ===
  wrap.addEventListener('mouseenter', stopAutoplay);
  wrap.addEventListener('mouseleave', startAutoplay);

  // === RESIZE ===
  let resizeTimer;
  const resizeHandler = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      gsap.set(track, { x: getOffset(currentIndex) });
      updateSlidesByPosition();
    }, 150);
  };
  window.addEventListener('resize', resizeHandler);
  wrap._resizeHandler = resizeHandler;

  // === INIT ===
  gsap.set(track, { x: getOffset(currentIndex) });

  // Wacht 2 frames zodat alle DOM dimensies correct zijn berekend
  // voordat we de actieve slide bepalen en autoplay starten
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      gsap.set(track, { x: getOffset(currentIndex) });
      updateSlidesByPosition();
      startAutoplay();
    });
  });
}
