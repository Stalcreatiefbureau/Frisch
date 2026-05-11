// ============================================
// FRISCH ACCORDION (CSS-based, Barba-compatible)
// ============================================
 
function initAccordionCSS(container = document) {
  container.querySelectorAll('[data-accordion-css-init]').forEach((accordion) => {
    if (accordion.dataset.accordionInit === 'true') return;
 
    const closeSiblings = accordion.getAttribute('data-accordion-close-siblings') === 'true';
 
    accordion.addEventListener('click', (event) => {
      const toggle = event.target.closest('[data-accordion-toggle]');
      if (!toggle) return;
      const singleAccordion = toggle.closest('[data-accordion-status]');
      if (!singleAccordion) return;
      const isActive = singleAccordion.getAttribute('data-accordion-status') === 'active';
      singleAccordion.setAttribute('data-accordion-status', isActive ? 'not-active' : 'active');
 
      if (closeSiblings && !isActive) {
        accordion.querySelectorAll('[data-accordion-status="active"]').forEach((sibling) => {
          if (sibling !== singleAccordion) sibling.setAttribute('data-accordion-status', 'not-active');
        });
      }
    });
 
    accordion.dataset.accordionInit = 'true';
  });
}
