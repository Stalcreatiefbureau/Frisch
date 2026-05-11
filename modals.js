// ============================================
// MODAL — werkt voor zowel single modals (ID-based)
// als CMS modals (relatief binnen parent)
// ============================================
function setupModals() {
  const openTriggers = document.querySelectorAll('[data-modal-open]');

  openTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-open');
      
      let modal;
      
      if (modalId) {
        // Single modal mode (Frisch zitplaatsen)
        modal = document.querySelector(`[data-modal="${modalId}"]`);
      } else {
        // CMS mode: zoek modal binnen dichtsbijzijnde parent
        const parent = trigger.closest('[data-modal-parent]');
        if (parent) {
          modal = parent.querySelector('[data-modal]');
        }
      }
      
      if (!modal) return;
      openModal(modal);
    });
  });

  // Close triggers
  document.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('[data-modal]');
      closeModal(modal);
    });
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('[data-modal].is-active').forEach(closeModal);
    }
  });
}

function openModal(modal) {
  if (!modal) return;
  
  modal.classList.add('is-active');
  document.body.classList.add('modal-open');

  const content = modal.querySelector('.modal_content');
  const overlay = modal.querySelector('.modal_overlay');

  gsap.fromTo(overlay,
    { opacity: 0 },
    { opacity: 1, duration: 0.3, ease: 'power2.out' }
  );

  gsap.fromTo(content,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
  );
}

function closeModal(modal) {
  if (!modal) return;
  const content = modal.querySelector('.modal_content');
  const overlay = modal.querySelector('.modal_overlay');

  gsap.to(content, { opacity: 0, y: 30, duration: 0.3, ease: 'power2.in' });
  gsap.to(overlay, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: () => {
      modal.classList.remove('is-active');
      document.body.classList.remove('modal-open');
    }
  });
}

document.addEventListener('DOMContentLoaded', setupModals);
