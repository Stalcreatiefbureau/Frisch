// ============================================
// FRISCH QUOTATION FORM
// Multi-step form met prijsberekening + kortingscode + validatie
// ============================================
//
// PRIJZEN AANPASSEN: zie het PRIJZEN object hieronder.
//
// Prijslogica (geldend per mei 2026):
// - Voorrijkosten: €60 eenmalig (bij meubel/tapijt/impregneren, NIET bij auto-interieur)
// - Meubelreiniging: €20 per zitplaats
// - Tapijtreiniging: €8,75 per m²
// - Impregneren meubels: €10/zitplaats tot 4 zitplaatsen, €5/zitplaats vanaf 5e
// - Impregneren tapijt: €2/m², GRATIS vanaf 12 m²
// - Auto-interieur: €150 vast
//
// Impregneren logica:
// - Bij meubelreiniging + impregneren → impregneren meubels
// - Bij tapijtreiniging + impregneren → impregneren tapijt
// - Bij ALLEEN impregneren (geen reiniging) → klant kiest type via stap 2 select
//   (meubels / tapijt / beide)
//
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // ============================================
  // CONFIG
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
  let validationActive = { 1: false, 2: false, 3: false, 4: false };
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
    impregneren_type: '', // 'meubels', 'tapijt', 'beide' — alleen relevant bij losstaand impregneren
    kortingscode: null
  };

  // ============================================
  // HELPERS — bepaal welke impregneren actief is
  // ============================================
  function impregneertMeubels() {
    if (!state.diensten.impregneren) return false;
    // Als meubelreiniging is gekozen, impregneren we automatisch meubels
    if (state.diensten.meubelreiniging) return true;
    // Als alleen impregneren (zonder enige reiniging), gebruik de keuze van de klant
    if (!state.diensten.tapijtreiniging) {
      return state.impregneren_type === 'meubels' || state.impregneren_type === 'beide';
    }
    return false;
  }

  function impregneertTapijt() {
    if (!state.diensten.impregneren) return false;
    if (state.diensten.tapijtreiniging) return true;
    if (!state.diensten.meubelreiniging) {
      return state.impregneren_type === 'tapijt' || state.impregneren_type === 'beide';
    }
    return false;
  }

  function isLosstaandImpregneren() {
    return state.diensten.impregneren &&
           !state.diensten.meubelreiniging &&
           !state.diensten.tapijtreiniging;
  }

  // ============================================
  // STEP NAVIGATION
  // ============================================
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

  // ============================================
  // STATE
  // ============================================
  function updateState() {
    state.diensten.meubelreiniging = !!document.querySelector('[name="dienst_meubelreiniging"]:checked');
    state.diensten.tapijtreiniging = !!document.querySelector('[name="dienst_tapijtreiniging"]:checked');
    state.diensten.impregneren = !!document.querySelector('[name="dienst_impregneren"]:checked');
    state.diensten.auto_interieur = !!document.querySelector('[name="dienst_auto_interieur"]:checked');

    const zitInput = document.querySelector('[name="zitplaatsen"]');
    const m2Input = document.querySelector('[name="m2_tapijt"]');
    const impTypeInput = document.querySelector('[name="impregneren_type"]');

    if (zitInput) state.zitplaatsen = parseInt(zitInput.value) || 1;
    if (m2Input) state.m2_tapijt = parseFloat(m2Input.value) || 0;
    if (impTypeInput) state.impregneren_type = impTypeInput.value || '';
  }

  function updateConditionalFields() {
    const zitField = document.querySelector('[data-field="zitplaatsen"]');
    const m2Field = document.querySelector('[data-field="m2_tapijt"]');
    const impTypeField = document.querySelector('[data-field="impregneren_type"]');

    // Type-keuze verschijnt alleen bij losstaand impregneren
    const showImpType = isLosstaandImpregneren();

    // Zitplaatsen: bij meubelreiniging, OF bij losstaand impregneren met type "meubels" of "beide"
    const showZit = state.diensten.meubelreiniging ||
                    (showImpType && (state.impregneren_type === 'meubels' || state.impregneren_type === 'beide'));

    // M²: bij tapijtreiniging, OF bij losstaand impregneren met type "tapijt" of "beide"
    const showM2 = state.diensten.tapijtreiniging ||
                   (showImpType && (state.impregneren_type === 'tapijt' || state.impregneren_type === 'beide'));

    if (zitField) zitField.style.display = showZit ? '' : 'none';
    if (m2Field) m2Field.style.display = showM2 ? '' : 'none';
    if (impTypeField) impTypeField.style.display = showImpType ? '' : 'none';
  }

  // ============================================
  // VALIDATIE
  // ============================================
  function showError(fieldName, inputElement) {
    const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorEl) errorEl.classList.add('is-active');
    if (inputElement) inputElement.classList.add('is-error');
  }

  function clearError(fieldName, inputElement) {
    const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorEl) errorEl.classList.remove('is-active');
    if (inputElement) inputElement.classList.remove('is-error');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePostcode(postcode, land) {
    const clean = postcode.trim().toUpperCase().replace(/\s+/g, '');
    if (land === 'België' || land === 'Belgie' || land === 'BE') {
      return /^\d{4}$/.test(clean);
    }
    return /^\d{4}[A-Z]{2}$/.test(clean);
  }

  function validateStep(stepNumber) {
    let isValid = true;
    updateState();

    if (stepNumber === 1) {
      const heeftDienst = state.diensten.meubelreiniging ||
                          state.diensten.tapijtreiniging ||
                          state.diensten.impregneren ||
                          state.diensten.auto_interieur;

      if (!heeftDienst) {
        showError('diensten');
        const wrap = document.querySelector('.form_diensten_wrap');
        if (wrap) wrap.classList.add('is-error');
        isValid = false;
      } else {
        clearError('diensten');
        const wrap = document.querySelector('.form_diensten_wrap');
        if (wrap) wrap.classList.remove('is-error');
      }
    }

    if (stepNumber === 2) {
      // Impregneren type — verplicht bij losstaand impregneren
      const impTypeField = document.querySelector('[data-field="impregneren_type"]');
      if (impTypeField && impTypeField.style.display !== 'none') {
        const impTypeInput = document.querySelector('[name="impregneren_type"]');
        if (!impTypeInput.value) {
          showError('impregneren_type', impTypeInput);
          isValid = false;
        } else {
          clearError('impregneren_type', impTypeInput);
        }
      }

      // Zitplaatsen
      const zitField = document.querySelector('[data-field="zitplaatsen"]');
      if (zitField && zitField.style.display !== 'none') {
        const zitInput = document.querySelector('[name="zitplaatsen"]');
        if (!zitInput.value) {
          showError('zitplaatsen', zitInput);
          isValid = false;
        } else {
          clearError('zitplaatsen', zitInput);
        }
      }

      // m2
      const m2Field = document.querySelector('[data-field="m2_tapijt"]');
      if (m2Field && m2Field.style.display !== 'none') {
        const m2Input = document.querySelector('[name="m2_tapijt"]');
        const m2Value = parseFloat(m2Input.value);
        if (!m2Input.value || isNaN(m2Value) || m2Value <= 0) {
          showError('m2_tapijt', m2Input);
          isValid = false;
        } else {
          clearError('m2_tapijt', m2Input);
        }
      }

      const dagInput = document.querySelector('[name="voorkeur_dag"]');
      if (dagInput && !dagInput.value) {
        showError('voorkeur_dag', dagInput);
        isValid = false;
      } else if (dagInput) {
        clearError('voorkeur_dag', dagInput);
      }
    }

    if (stepNumber === 4) {
      const verplicht = [
        { name: 'voornaam', minLength: 2 },
        { name: 'achternaam', minLength: 2 },
        { name: 'telefoonnummer', minLength: 8 },
        { name: 'email', isEmail: true },
        { name: 'straat', minLength: 3 },
        { name: 'plaats', minLength: 2 },
        { name: 'postcode', isPostcode: true },
        { name: 'land', minLength: 1 }
      ];

      const landInput = document.querySelector('[name="land"]');
      const landValue = landInput ? landInput.value : '';

      verplicht.forEach(veld => {
        const input = document.querySelector(`[name="${veld.name}"]`);
        if (!input) return;

        const value = input.value.trim();
        let veldValid = true;

        if (!value) {
          veldValid = false;
        } else if (veld.minLength && value.length < veld.minLength) {
          veldValid = false;
        } else if (veld.isEmail && !validateEmail(value)) {
          veldValid = false;
        } else if (veld.isPostcode && !validatePostcode(value, landValue)) {
          veldValid = false;
        }

        if (veldValid) {
          clearError(veld.name, input);
        } else {
          showError(veld.name, input);
          isValid = false;
        }
      });
    }

    return isValid;
  }

  function setupLiveValidation() {
    document.addEventListener('input', (e) => {
      if (!validationActive[currentStep]) return;
      const target = e.target;
      const name = target.name;
      if (!name) return;
      revalidateField(name, target);
    });

    document.addEventListener('change', (e) => {
      if (!validationActive[currentStep]) return;

      if (e.target.matches('[name^="dienst_"]')) {
        validateStep(1);
        return;
      }

      const target = e.target;
      const name = target.name;
      if (!name) return;
      revalidateField(name, target);
    });
  }

  function revalidateField(name, input) {
    const value = input.value.trim();
    const landInput = document.querySelector('[name="land"]');
    const landValue = landInput ? landInput.value : '';

    let valid = true;

    if (name === 'email') {
      valid = !!value && validateEmail(value);
    } else if (name === 'postcode') {
      valid = !!value && validatePostcode(value, landValue);
    } else if (name === 'voorkeur_dag' || name === 'land' || name === 'impregneren_type') {
      valid = !!value;
    } else if (name === 'zitplaatsen') {
      valid = !!value;
    } else if (name === 'm2_tapijt') {
      const num = parseFloat(value);
      valid = !!value && !isNaN(num) && num > 0;
    } else if (name === 'telefoonnummer') {
      valid = !!value && value.length >= 8;
    } else {
      valid = !!value && value.length >= 2;
    }

    if (valid) {
      clearError(name, input);
    } else {
      showError(name, input);
    }
  }

  // ============================================
  // PRIJSBEREKENING
  // ============================================
  function berekenPrijzen() {
    const lijst = [];

    // Voorrijkosten bij elke dienst behalve alleen auto-interieur
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

    // Impregneren meubels — actief bij meubelreiniging, of bij losstaand impregneren met type meubels/beide
    if (impregneertMeubels()) {
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

    // Impregneren tapijt — actief bij tapijtreiniging, of bij losstaand impregneren met type tapijt/beide
    if (impregneertTapijt()) {
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

  // ============================================
  // KORTINGSCODE
  // ============================================
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

  // ============================================
  // EVENT LISTENERS
  // ============================================
  document.addEventListener('change', (e) => {
    if (e.target.matches('[name^="dienst_"]') ||
        e.target.matches('[name="zitplaatsen"]') ||
        e.target.matches('[name="m2_tapijt"]') ||
        e.target.matches('[name="impregneren_type"]')) {
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
      validationActive[currentStep] = true;
      if (!validateStep(currentStep)) return;
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

  const form = document.querySelector('form');
  const submitBtn = form?.querySelector('input[type="submit"], button[type="submit"]');

  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      validationActive[4] = true;
      if (!validateStep(4)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      validationActive[4] = true;
      if (!validateStep(4)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);
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
  setupLiveValidation();
});
