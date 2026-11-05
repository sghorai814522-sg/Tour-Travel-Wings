/**
 * Travel Promo Banner & Customer Reviews
 * Tour & Travel Wings
 * 
 * Handles mobile swipe carousel, dot navigation, and theme editor live preview.
 */

(function () {
  'use strict';

  class TravelPromoReviews {
    constructor(sectionElement) {
      this.section = sectionElement;
      this.grid = this.section.querySelector('.travel-reviews-grid');
      this.cards = Array.from(this.section.querySelectorAll('.travel-review-card'));
      this.dotsContainer = this.section.querySelector('.travel-reviews-slider-dots');
      this.dots = Array.from(this.section.querySelectorAll('.travel-reviews-dot'));

      if (!this.grid || this.cards.length === 0) return;

      this.initMobileSlider();
    }

    initMobileSlider() {
      if (!this.dotsContainer || this.dots.length === 0) return;

      // Scroll listener to update active dot
      let scrollTimeout;
      this.grid.addEventListener(
        'scroll',
        () => {
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => this.updateActiveDot(), 60);
        },
        { passive: true }
      );

      // Dot click handler
      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollToIndex(index);
        });
      });
    }

    updateActiveDot() {
      const scrollLeft = this.grid.scrollLeft;
      const cardWidth = this.cards[0]?.offsetWidth || 300;
      const activeIndex = Math.round(scrollLeft / (cardWidth + 16));

      this.dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('is-active');
        } else {
          dot.classList.remove('is-active');
        }
      });
    }

    scrollToIndex(index) {
      if (!this.cards[index]) return;
      const card = this.cards[index];
      const offset = card.offsetLeft - this.grid.offsetLeft - 16;
      this.grid.scrollTo({
        left: offset,
        behavior: 'smooth',
      });
    }

    selectBlock(blockId) {
      const cardIndex = this.cards.findIndex(
        (card) => card.dataset.blockId === blockId || card.id === `review-${blockId}`
      );
      if (cardIndex !== -1) {
        this.scrollToIndex(cardIndex);
        this.cards.forEach((c) => c.classList.remove('is-highlighted'));
        this.cards[cardIndex].classList.add('is-highlighted');
      }
    }
  }

  function initAllPromoReviews() {
    const sections = document.querySelectorAll('.travel-promo-reviews-section');
    sections.forEach((sec) => {
      if (!sec._promoReviewsInstance) {
        sec._promoReviewsInstance = new TravelPromoReviews(sec);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPromoReviews);
  } else {
    initAllPromoReviews();
  }

  // Shopify Theme Customizer events
  document.addEventListener('shopify:section:load', (e) => {
    const sec = e.target.querySelector('.travel-promo-reviews-section') || e.target;
    if (sec && sec.classList.contains('travel-promo-reviews-section')) {
      sec._promoReviewsInstance = new TravelPromoReviews(sec);
    }
  });

  document.addEventListener('shopify:block:select', (e) => {
    const block = e.target;
    const sec = block.closest('.travel-promo-reviews-section');
    if (sec && sec._promoReviewsInstance) {
      sec._promoReviewsInstance.selectBlock(block.dataset.blockId || block.id);
    }
  });
})();

