// ============================================
// FRISCH MODAL — werkt voor zowel single modals (ID-based)
// als CMS modals (relatief binnen parent) (Barba-compatible)
// ============================================
// Bij openen wordt de modal verplaatst naar document.body om problemen
// met parent containing blocks (transform, filter, will-change) te voorkomen.
// Bij sluiten wordt de modal teruggeplaatst naar zijn originele parent.
// ============================================

function setupModals(container = document) {
  const openTriggers = container.querySelectorAll('[data-modal-open]');
  openTriggers.forEach(trigger => {
    if (trigger.dataset.modalTriggerInit === 'true') return;
    trigger.dataset.modalTriggerInit = 'true';

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute('data-modal-open');
      let modal;

      if (modalId) {
        // Single modal mode (Frisch zitplaatsen)
        modal = container.querySelector(`[data-modal="${modalId}"]`)
             || document.querySelector(`[data-modal="${modalId}"]`);
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

  // Close triggers binnen deze container
  container.querySelectorAll('[data-modal-close]').forEach(closeBtn => {
    if (closeBtn.dataset.modalCloseInit === 'true') return;
    closeBtn.dataset.modalCloseInit = 'true';

    closeBtn.addEventListener('click', () => {
      const modal = closeBtn.closest('[data-modal]');
      closeModal(modal);
    });
  });

  // Escape key — alleen één keer global binden
  if (!window._modalEscapeBound) {
    window._modalEscapeBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('[data-modal].is-active').forEach(closeModal);
      }
    });
  }
}

function openModal(modal) {
  if (!modal) return;

  // Bewaar originele parent + positie zodat we de modal kunnen teruggeven
  if (!modal._originalParent) {
    modal._originalParent = modal.parentElement;
    modal._originalNextSibling = modal.nextElementSibling;
  }

  // Verplaats modal naar body zodat geen enkele parent een containing block kan zijn
  if (modal.parentElement !== document.body) {
    document.body.appendChild(modal);
  }

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

      // Plaats modal terug naar zijn originele plek in de DOM
      if (modal._originalParent) {
        if (modal._originalNextSibling && modal._originalParent.contains(modal._originalNextSibling)) {
          modal._originalParent.insertBefore(modal, modal._originalNextSibling);
        } else {
          modal._originalParent.appendChild(modal);
        }
        // Reset zodat de bewaarde refs niet stale worden na page transition
        modal._originalParent = null;
        modal._originalNextSibling = null;
      }
    }
  });
}
