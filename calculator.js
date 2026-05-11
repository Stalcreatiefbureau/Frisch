// ============================================
// FRISCH TARIEVEN CALCULATOR (Barba-compatible)
// Snelle prijsindicatie op tarievenpagina (geen submit, live update)
// ============================================

function initTarievenCalculator(container = document) {
  const PRIJZEN = {
    voorrijkosten: 60,
    meubelreiniging: { perZitplaats: 20 },
    tapijtreiniging: { perM2: 8.75 },
    impregneren_meubels: { perZitplaatsTot4: 10, perZitplaatsNa4: 5 },
    impregneren_tapijt: { perM2: 2, gratisVanafM2: 12 },
    auto_interieur: { vast: 150 }
  };

  const dienstSelect = container.querySelector('[data-calc="dienst"]');
  if (!dienstSelect) return;

  // Anti-dubbel-init
  if (dienstSelect.dataset.calcInit === 'true') return;
  dienstSelect.dataset.calcInit = 'true';

  const zitSelect = container.querySelector('[data-calc="zitplaatsen"]');
  const m2Input = container.querySelector('[data-calc="m2_tapijt"]');
  const zitField = container.querySelector('[data-calc-field="zitplaatsen"]');
  const m2Field = container.querySelector('[data-calc-field="m2_tapijt"]');
  const resultWrap = container.querySelector('.calculator_result');

  const voorrijEl = container.querySelector('[data-calc-result="voorrijkosten"]');
  const dienstNaamEl = container.querySelector('[data-calc-result="dienstnaam"]');
  const dienstPrijsEl = container.querySelector('[data-calc-result="dienstprijs"]');
  const totaalEl = container.querySelector('[data-calc-result="totaal"]');

  const ZITPLAATSEN_DIENSTEN = ['meubelreiniging', 'impregneren_meubels', 'auto_interieur'];
  const M2_DIENSTEN = ['tapijtreiniging', 'impregneren_tapijt'];
  const VOORRIJKOSTEN_DIENSTEN = ['meubelreiniging', 'tapijtreiniging', 'impregneren_meubels', 'impregneren_tapijt'];
  const VASTE_PRIJS_DIENSTEN = ['auto_interieur'];

  function formatPrijs(bedrag) {
    return `€${bedrag.toLocaleString('nl-NL', {
      minimumFractionDigits: bedrag % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })}`;
  }

  function getDienstLabel(dienst) {
    const labels = {
      meubelreiniging: 'Meubelreiniging',
      tapijtreiniging: 'Tapijtreiniging',
      impregneren_meubels: 'Impregneren meubels',
      impregneren_tapijt: 'Impregneren tapijt',
      auto_interieur: 'Auto-interieur'
    };
    return labels[dienst] || '';
  }

  function berekenDienstprijs(dienst, hoeveelheid) {
    if (dienst === 'meubelreiniging') return hoeveelheid * PRIJZEN.meubelreiniging.perZitplaats;
    if (dienst === 'tapijtreiniging') return hoeveelheid * PRIJZEN.tapijtreiniging.perM2;
    if (dienst === 'impregneren_meubels') {
      const zit = hoeveelheid;
      if (zit <= 4) return zit * PRIJZEN.impregneren_meubels.perZitplaatsTot4;
      return 4 * PRIJZEN.impregneren_meubels.perZitplaatsTot4 +
             (zit - 4) * PRIJZEN.impregneren_meubels.perZitplaatsNa4;
    }
    if (dienst === 'impregneren_tapijt') {
      return hoeveelheid >= PRIJZEN.impregneren_tapijt.gratisVanafM2
        ? 0
        : hoeveelheid * PRIJZEN.impregneren_tapijt.perM2;
    }
    if (dienst === 'auto_interieur') return PRIJZEN.auto_interieur.vast;
    return 0;
  }

  function updateFields() {
    const dienst = dienstSelect.value;

    if (zitField) zitField.classList.remove('is-active');
    if (m2Field) m2Field.classList.remove('is-active');

    if (!dienst) { hideResult(); return; }

    if (VASTE_PRIJS_DIENSTEN.includes(dienst)) { bereken(); return; }

    if (ZITPLAATSEN_DIENSTEN.includes(dienst)) {
      if (zitField) zitField.classList.add('is-active');
    } else if (M2_DIENSTEN.includes(dienst)) {
      if (m2Field) m2Field.classList.add('is-active');
    }

    bereken();
  }

  function bereken() {
    const dienst = dienstSelect.value;
    if (!dienst) { hideResult(); return; }

    let hoeveelheid = 0;

    if (VASTE_PRIJS_DIENSTEN.includes(dienst)) {
      hoeveelheid = 1;
    } else if (ZITPLAATSEN_DIENSTEN.includes(dienst)) {
      hoeveelheid = parseInt(zitSelect?.value) || 0;
      if (!hoeveelheid) { hideResult(); return; }
    } else if (M2_DIENSTEN.includes(dienst)) {
      hoeveelheid = parseFloat(m2Input?.value) || 0;
      if (hoeveelheid <= 0) { hideResult(); return; }
    }

    const dienstprijs = berekenDienstprijs(dienst, hoeveelheid);
    const voorrij = VOORRIJKOSTEN_DIENSTEN.includes(dienst) ? PRIJZEN.voorrijkosten : 0;
    const totaal = dienstprijs + voorrij;

    showResult(dienst, dienstprijs, voorrij, totaal);
  }

  function showResult(dienst, dienstprijs, voorrij, totaal) {
    if (resultWrap) resultWrap.classList.add('is-active');
    if (voorrijEl) voorrijEl.textContent = formatPrijs(voorrij);
    if (dienstNaamEl) dienstNaamEl.textContent = getDienstLabel(dienst);
    if (dienstPrijsEl) dienstPrijsEl.textContent = formatPrijs(dienstprijs);
    if (totaalEl) totaalEl.textContent = formatPrijs(totaal);

    const voorrijRegel = container.querySelector('.calculator_result_voorrijkosten');
    if (voorrijRegel) {
      voorrijRegel.style.display = voorrij > 0 ? '' : 'none';
    }
  }

  function hideResult() {
    if (resultWrap) resultWrap.classList.remove('is-active');
  }

  dienstSelect.addEventListener('change', updateFields);
  if (zitSelect) zitSelect.addEventListener('change', bereken);
  if (m2Input) {
    m2Input.addEventListener('input', bereken);
    m2Input.addEventListener('change', bereken);
  }

  updateFields();
}
