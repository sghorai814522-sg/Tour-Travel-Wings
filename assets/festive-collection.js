/**
 * festive-collection.js
 * Interactive logic for Season Finest: Festive Collection section
 */

class FestiveCollection {
  constructor(sectionElement) {
    this.section = sectionElement;
    this.init();
  }

  init() {
    if (!this.section) return;
    this.initTouchSupport();
  }

  initTouchSupport() {
    const cards = this.section.querySelectorAll('.fc-card');

    cards.forEach((card) => {
      card.addEventListener('touchstart', () => {
        cards.forEach((c) => {
          if (c !== card) c.classList.remove('is-active');
        });
        card.classList.toggle('is-active');
      }, { passive: true });
    });
  }
}

// Global Init Helper
function initFestiveCollectionSections() {
  document.querySelectorAll('[data-section-type="festive-collection"]').forEach((section) => {
    if (!section.dataset.initialized) {
      new FestiveCollection(section);
      section.dataset.initialized = 'true';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFestiveCollectionSections);
} else {
  initFestiveCollectionSections();
}

// Shopify Theme Editor Integration
document.addEventListener('shopify:section:load', (event) => {
  const section = event.target.querySelector('[data-section-type="festive-collection"]');
  if (section) {
    new FestiveCollection(section);
  }
});
