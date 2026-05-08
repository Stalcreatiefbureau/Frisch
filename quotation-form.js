document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // CONFIG — pas hier de prijzen aan
  // ============================================
  const PRIJZEN = {
    voorrijkosten: 60,
    meubelreiniging: { perZitplaats: 20 },
    tapijtreiniging: { perM2: 8.75 },
    impregneren_meubels: { perZitplaatsTot4: 10, perZitplaatsNa4: 5 },
    impregneren_tapijt: { perM2: 2, gratisVanafM2: 12 },
    auto_interieur: { vast: 150 }
  };
 
  const fadeDuration = 0.4;
  const slideDistance = 30;
 
  const steps = document.querySelectorAll('[data-form-step]');
  const tabs = document.querySelectorAll('[data-form-tab]');
  const nextButtons = document.querySelectorAll('[data-form-action="next"]');
  const prevButtons = document.querySelectorAll('[data-form-action="prev"]');
 
  if (!steps.length) return;
 
  let currentStep = 1;
  let isAnimating = false;
  const totalSteps = steps.length;
 
  const state = {
    diensten: {
      meubelreiniging: false,
      tapijtreiniging: false,
      impregneren: false,
      auto_interieur: false
    },
    zitplaatsen: 1,
    m2_tapijt: 0,
    kortingscode: null
  };
 
  function getStepElement(stepNumber) {
    return document.querySelector(`[data-form-step="${stepNumber}"]`);
  }
 
  function showStep(newStep) {
    if (isAnimating || newStep === currentStep) return;
    isAnimating = true;
 
    const oldStepEl = getStepElement(currentStep);
    const newStepEl = getStepElement(newStep);
    const goingForward = newStep > currentStep;
    const oldExitX = goingForward ? -slideDistance : slideDistance;
    const newEnterX = goingForward ? slideDistance : -slideDistance;
 
    gsap.to(oldStepEl, {
      opacity: 0,
      x: oldExitX,
      duration: fadeDuration,
      ease: 'power2.out',
      onComplete: () => {
        oldStepEl.classList.remove('is-active');
        gsap.set(oldStepEl, { x: 0 });
 
        newStepEl.classList.add('is-active');
 
        if (newStep === 3) {
          renderSummary();
        }
 
        gsap.fromTo(newStepEl,
          { opacity: 0, x: newEnterX },
          {
            opacity: 1, x: 0,
            duration: fadeDuration,
            ease: 'power2.out',
            onComplete: () => { isAnimating = false; }
          }
        );
      }
    });
 
    tabs.forEach(tab => {
      const tabNumber = parseInt(tab.dataset.formTab);
      tab.classList.toggle('is-active', tabNumber === newStep);
      tab.classList.toggle('is-completed', tabNumber < newStep);
    });
 
    currentStep = newStep;
  }
 
  function updateState() {
    state.diensten.meubelreiniging = !!document.querySelector('[name="dienst_meubelreiniging"]:checked');
    state.diensten.tapijtreiniging = !!document.querySelector('[name="dienst_tapijtreiniging"]:checked');
    state.diensten.impregneren = !!document.querySelector('[name="dienst_impregneren"]:checked');
    state.diensten.auto_interieur = !!document.querySelector('[name="dienst_auto_interieur"]:checked');
 
    const zitInput = document.querySelector('[name="zitplaatsen"]');
    const m2Input = document.querySelector('[name="m2_tapijt"]');
 
    if (zitInput) state.zitplaatsen = parseInt(zitInput.value) || 1;
    if (m2Input) state.m2_tapijt = parseFloat(m2Input.value) || 0;
  }
 
  function updateConditionalFields() {
    const zitField = document.querySelector('[data-field="zitplaatsen"]');
    const m2Field = document.querySelector('[data-field="m2_tapijt"]');
 
    const showZit = state.diensten.meubelreiniging ||
                    (state.diensten.impregneren && state.diensten.meubelreiniging);
    const showM2 = state.diensten.tapijtreiniging;
 
    toggleField(zitField, showZit);
    toggleField(m2Field, showM2);
  }
 
  function toggleField(wrapper, show) {
    if (!wrapper) return;
    wrapper.style.display = show ? '' : 'none';
 
    const inputs = wrapper.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (show) {
        if (input.dataset.wasRequired === 'true') {
          input.required = true;
        }
      } else {
        if (input.required) {
          input.dataset.wasRequired = 'true';
        }
        input.required = false;
      }
    });
  }
 
  function berekenPrijzen() {
    const lijst = [];
 
    const heeftHoofddienst = state.diensten.meubelreiniging ||
                              state.diensten.tapijtreiniging ||
                              state.diensten.impregneren;
 
    if (heeftHoofddienst) {
      lijst.push({
        titel: 'Voorrijkosten',
        subtitel: 'Eenmalig',
        prijs: PRIJZEN.voorrijkosten
      });
    }
 
    if (state.diensten.meubelreiniging) {
      const zit = state.zitplaatsen;
      const prijs = zit * PRIJZEN.meubelreiniging.perZitplaats;
      lijst.push({
        titel: 'Meubelreiniging',
        subtitel: `${zit} ${zit === 1 ? 'zitplaats' : 'zitplaatsen'}`,
        prijs: prijs
      });
    }
 
    if (state.diensten.tapijtreiniging) {
      const m2 = state.m2_tapijt;
      const prijs = m2 * PRIJZEN.tapijtreiniging.perM2;
      lijst.push({
        titel: 'Tapijtreiniging',
        subtitel: `${m2} m²`,
        prijs: prijs
      });
    }
 
    if (state.diensten.impregneren) {
      if (state.diensten.meubelreiniging) {
        const zit = state.zitplaatsen;
        let prijs = 0;
        if (zit <= 4) {
          prijs = zit * PRIJZEN.impregneren_meubels.perZitplaatsTot4;
        } else {
          prijs = 4 * PRIJZEN.impregneren_meubels.perZitplaatsTot4 +
                  (zit - 4) * PRIJZEN.impregneren_meubels.perZitplaatsNa4;
        }
        lijst.push({
          titel: 'Impregneren meubels',
          subtitel: `${zit} ${zit === 1 ? 'zitplaats' : 'zitplaatsen'}`,
          prijs: prijs
        });
      }
      if (state.diensten.tapijtreiniging) {
        const m2 = state.m2_tapijt;
        const prijs = m2 >= PRIJZEN.impregneren_tapijt.gratisVanafM2
          ? 0
          : m2 * PRIJZEN.impregneren_tapijt.perM2;
        lijst.push({
          titel: 'Impregneren tapijt',
          subtitel: m2 >= PRIJZEN.impregneren_tapijt.gratisVanafM2
            ? `${m2} m² (gratis vanaf 12 m²)`
            : `${m2} m²`,
          prijs: prijs
        });
      }
    }
 
    if (state.diensten.auto_interieur) {
      lijst.push({
        titel: 'Auto-interieur',
        subtitel: 'Vaste prijs',
        prijs: PRIJZEN.auto_interieur.vast
      });
    }
 
    return lijst;
  }
 
  function formatPrijs(bedrag) {
    return `€${bedrag.toLocaleString('nl-NL', {
      minimumFractionDigits: bedrag % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })}`;
  }
 
  function renderSummary() {
    updateState();
    const cardsContainer = document.querySelector('[data-summary="cards"]');
    const totalEl = document.querySelector('[data-summary="total"]');
    const template = document.querySelector('.summary_card.is-template');
 
    if (!cardsContainer || !template || !totalEl) return;
 
    cardsContainer.querySelectorAll('.summary_card:not(.is-template)').forEach(c => c.remove());
 
    const items = berekenPrijzen();
    let subtotaal = 0;
 
    items.forEach(item => {
      const card = template.cloneNode(true);
      card.classList.remove('is-template');
      card.style.display = '';
      card.querySelector('.summary_card_title').textContent = item.titel;
      card.querySelector('.summary_card_subtitle').textContent = item.subtitel;
      card.querySelector('.summary_card_price').textContent = formatPrijs(item.prijs);
      cardsContainer.appendChild(card);
      subtotaal += item.prijs;
    });
 
    let totaal = subtotaal;
    if (state.kortingscode) {
      if (state.kortingscode.type === 'Percentage') {
        totaal = subtotaal * (1 - state.kortingscode.waarde / 100);
      } else {
        totaal = Math.max(0, subtotaal - state.kortingscode.waarde);
      }
    }
 
    totalEl.textContent = formatPrijs(totaal);
  }
 
  function getKortingscodes() {
    const items = document.querySelectorAll('[data-discount-code]');
    return Array.from(items).map(item => ({
      code: item.querySelector('[data-discount-field="code"]')?.textContent.trim().toUpperCase() || '',
      type: item.querySelector('[data-discount-field="type"]')?.textContent.trim() || 'Percentage',
      waarde: parseFloat(item.querySelector('[data-discount-field="waarde"]')?.textContent.trim()) || 0
    }));
  }
 
  function applyDiscount() {
    const input = document.querySelector('[name="kortingscode"]');
    const messageEl = document.querySelector('[data-summary="discount-message"]');
    if (!input || !messageEl) return;
 
    const ingevoerd = input.value.trim().toUpperCase();
    if (!ingevoerd) {
      state.kortingscode = null;
      messageEl.className = '';
      messageEl.textContent = '';
      renderSummary();
      return;
    }
 
    const codes = getKortingscodes();
    const match = codes.find(c => c.code === ingevoerd);
 
    if (match) {
      state.kortingscode = match;
      const display = match.type === 'Percentage'
        ? `${match.waarde}% korting toegepast`
        : `€${match.waarde} korting toegepast`;
      messageEl.className = 'is-success';
      messageEl.textContent = `✓ ${display}`;
    } else {
      state.kortingscode = null;
      messageEl.className = 'is-error';
      messageEl.textContent = '✗ Ongeldige kortingscode';
    }
 
    renderSummary();
  }
 
  document.addEventListener('change', (e) => {
    if (e.target.matches('[name^="dienst_"]') ||
        e.target.matches('[name="zitplaatsen"]') ||
        e.target.matches('[name="m2_tapijt"]')) {
      updateState();
      updateConditionalFields();
    }
  });
 
  document.addEventListener('input', (e) => {
    if (e.target.matches('[name="m2_tapijt"]')) {
      updateState();
    }
  });
 
  nextButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep < totalSteps) showStep(currentStep + 1);
    });
  });
 
  prevButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) showStep(currentStep - 1);
    });
  });
 
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetStep = parseInt(tab.dataset.formTab);
      if (targetStep < currentStep) showStep(targetStep);
    });
  });
 
  const discountBtn = document.querySelector('[data-form-action="apply-discount"]');
  if (discountBtn) {
    discountBtn.addEventListener('click', (e) => {
      e.preventDefault();
      applyDiscount();
    });
  }
 
  steps.forEach(step => {
    if (parseInt(step.dataset.formStep) !== 1) {
      step.classList.remove('is-active');
    }
  });
  tabs.forEach(tab => {
    tab.classList.toggle('is-active', parseInt(tab.dataset.formTab) === 1);
  });
 
  updateState();
  updateConditionalFields();
});
