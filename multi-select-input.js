/**
 * Custom Multi-Select voor Webflow
 * --------------------------------
 * Attribuut-gedreven dropdown met meerdere selecties.
 * Synct de gekozen waardes naar een hidden input zodat het
 * Webflow-formulier ze als één veld submit (komma-gescheiden).
 *
 * Structuur (attributen in de Webflow designer):
 *   [data-ms="wrap"]            -> root van het component
 *     [data-ms="toggle"]        -> klikbare trigger (toont selectie)
 *       [data-ms="label"]       -> tekst met huidige selectie / placeholder
 *     [data-ms="list"]          -> dropdown panel
 *       [data-ms="option"]      -> elke optie (data-ms-value optioneel)
 *     [data-ms="input"]         -> hidden text input met een `name` (submit-veld)
 *
 * Opties op de wrap:
 *   data-ms-placeholder="Kies opties"   tekst als niets is geselecteerd
 *   data-ms-separator=", "               scheidingsteken in de label-tekst
 *   data-ms-value-separator=","          scheidingsteken in de hidden input
 *   data-ms-max="3"                      max aantal selecties (optioneel)
 *   data-ms-count="2"                    toon "X geselecteerd" vanaf X items (optioneel)
 *
 * State-classes (style je in Webflow):
 *   .is-open       op de wrap als de dropdown open is
 *   .is-selected   op een option als die geselecteerd is
 */

function initMultiSelect(root = document) {
  const wraps = root.querySelectorAll('[data-ms="wrap"]');

  wraps.forEach((wrap) => {
    // Idempotency guard (bv. bij Barba re-init)
    if (wrap.dataset.msInit === "true") return;
    wrap.dataset.msInit = "true";

    const toggle = wrap.querySelector('[data-ms="toggle"]');
    const label = wrap.querySelector('[data-ms="label"]');
    const list = wrap.querySelector('[data-ms="list"]');
    const input = wrap.querySelector('[data-ms="input"]');
    const options = Array.from(wrap.querySelectorAll('[data-ms="option"]'));

    if (!toggle || !list || !input) return;

    const placeholder = wrap.dataset.msPlaceholder || "Selecteer...";
    const sep = wrap.dataset.msSeparator || ", ";
    const valueSep = wrap.dataset.msValueSeparator || ",";
    const max = parseInt(wrap.dataset.msMax || "0", 10); // 0 = onbeperkt
    const countFrom = parseInt(wrap.dataset.msCount || "0", 10); // 0 = uit

    // ARIA basics
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-multiselectable", "true");
    toggle.setAttribute("role", "button");
    toggle.setAttribute("aria-haspopup", "listbox");
    toggle.setAttribute("aria-expanded", "false");
    if (!toggle.hasAttribute("tabindex")) toggle.setAttribute("tabindex", "0");

    const getValue = (opt) =>
      (opt.dataset.msValue ?? opt.textContent ?? "").trim();
    const getLabel = (opt) => (opt.textContent ?? "").trim();

    const open = () => {
      wrap.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      wrap.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    const isOpen = () => wrap.classList.contains("is-open");

    const sync = () => {
      const selected = options.filter((o) => o.classList.contains("is-selected"));
      const values = selected.map(getValue);
      const labels = selected.map(getLabel);

      // Hidden input -> wat het formulier submit
      input.value = values.join(valueSep);
      // Webflow / listeners laten reageren op de wijziging
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      // Label-tekst
      if (labels.length === 0) {
        label.textContent = placeholder;
      } else if (countFrom > 0 && labels.length >= countFrom) {
        label.textContent = `${labels.length} geselecteerd`;
      } else {
        label.textContent = labels.join(sep);
      }
    };

    const selectOption = (opt) => {
      const selectedCount = options.filter((o) =>
        o.classList.contains("is-selected")
      ).length;
      const already = opt.classList.contains("is-selected");

      // Max bereikt en dit is een nieuwe selectie -> negeren
      if (!already && max > 0 && selectedCount >= max) return;

      opt.classList.toggle("is-selected");
      opt.setAttribute(
        "aria-selected",
        opt.classList.contains("is-selected") ? "true" : "false"
      );
      sync();
    };

    // Option setup + clicks
    options.forEach((opt) => {
      opt.setAttribute("role", "option");
      opt.setAttribute("aria-selected", "false");
      if (!opt.hasAttribute("tabindex")) opt.setAttribute("tabindex", "0");

      opt.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectOption(opt);
      });

      opt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption(opt);
        }
      });
    });

    // Toggle open/dicht
    toggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      isOpen() ? close() : open();
    });

    toggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        isOpen() ? close() : open();
      } else if (e.key === "Escape") {
        close();
      }
    });

    // Klik buiten -> sluiten
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close();
    });

    // Init state (pikt vooraf gezette .is-selected classes op)
    sync();
  });
}

// Auto-init
if (document.readyState !== "loading") {
  initMultiSelect();
} else {
  document.addEventListener("DOMContentLoaded", () => initMultiSelect());
}

// Beschikbaar maken voor Barba-hooks o.i.d.
window.initMultiSelect = initMultiSelect;
