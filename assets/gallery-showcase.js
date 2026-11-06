/**
 * Gallery Image Showcase
 * Tour & Travel Wings
 * 
 * Handles single horizontal row drag-to-scroll, arrow navigation,
 * progress bar tracking, lightbox modal, and Shopify theme editor live sync.
 */

(function () {
  'use strict';

  class GalleryShowcase {
    constructor(sectionElement) {
      this.section = sectionElement;
      this.track = this.section.querySelector('.gallery-showcase-track');
      if (!this.track) return;

      this.cards = Array.from(this.section.querySelectorAll('.gallery-showcase-card'));
      this.prevBtn = this.section.querySelector('.gallery-showcase-prev-btn');
      this.nextBtn = this.section.querySelector('.gallery-showcase-next-btn');
      this.progressBar = this.section.querySelector('.gallery-showcase-progress-fill');

      // Lightbox elements
      this.lightbox = this.section.querySelector('.gallery-lightbox-modal');
      this.lightboxImg = this.lightbox?.querySelector('.gallery-lightbox-img');
      this.lightboxTitle = this.lightbox?.querySelector('.gallery-lightbox-title');
      this.lightboxDesc = this.lightbox?.querySelector('.gallery-lightbox-desc');
      this.lightboxClose = this.lightbox?.querySelector('.gallery-lightbox-close-btn');
      this.lightboxPrev = this.lightbox?.querySelector('.gallery-lightbox-prev-btn');
      this.lightboxNext = this.lightbox?.querySelector('.gallery-lightbox-next-btn');

      this.currentLightboxIndex = 0;
      this.isDown = false;
      this.startX = 0;
      this.scrollLeft = 0;
      this.hasDragged = false;

      this.initControls();
      this.initDragToScroll();
      this.initProgressBar();
      this.initLightbox();
      this.initAutoplay();
    }

    /* -------------------------------------------------------------
       1. ARROW NAVIGATION
       ------------------------------------------------------------- */
    initControls() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollByAmount(-1);
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.scrollByAmount(1);
        });
      }

      this.updateArrowStates();
      this.track.addEventListener('scroll', () => this.updateArrowStates(), { passive: true });
    }

    scrollByAmount(direction) {
      const card = this.cards[0];
      const scrollStep = card ? card.offsetWidth + 16 : 320;
      this.track.scrollBy({
        left: direction * scrollStep,
        behavior: 'smooth',
      });
    }

    updateArrowStates() {
      if (!this.prevBtn && !this.nextBtn) return;
      const maxScroll = this.track.scrollWidth - this.track.clientWidth - 5;
      const currentScroll = this.track.scrollLeft;

      if (this.prevBtn) {
        this.prevBtn.disabled = currentScroll <= 5;
      }
      if (this.nextBtn) {
        this.nextBtn.disabled = currentScroll >= maxScroll;
      }
    }

    /* -------------------------------------------------------------
       2. MOUSE DRAG TO SCROLL (DESKTOP)
       ------------------------------------------------------------- */
    initDragToScroll() {
      if (this.section.dataset.drag !== 'true') return;

      this.track.addEventListener('mousedown', (e) => {
        // Ignore zoom buttons or link clicks
        if (e.target.closest('.gallery-showcase-zoom-btn')) return;

        this.isDown = true;
        this.hasDragged = false;
        this.track.classList.add('is-dragging');
        this.startX = e.pageX - this.track.offsetLeft;
        this.scrollLeft = this.track.scrollLeft;
      });

      this.track.addEventListener('mouseleave', () => {
        this.isDown = false;
        this.track.classList.remove('is-dragging');
      });

      this.track.addEventListener('mouseup', () => {
        this.isDown = false;
        this.track.classList.remove('is-dragging');
      });

      this.track.addEventListener('mousemove', (e) => {
        if (!this.isDown) return;
        e.preventDefault();
        const x = e.pageX - this.track.offsetLeft;
        const walk = (x - this.startX) * 1.5; // Drag speed multiplier
        if (Math.abs(walk) > 5) {
          this.hasDragged = true;
        }
        this.track.scrollLeft = this.scrollLeft - walk;
      });

      // Prevent link clicks after dragging
      this.cards.forEach((card) => {
        const link = card.querySelector('.gallery-showcase-card-link');
        if (link) {
          link.addEventListener('click', (e) => {
            if (this.hasDragged) {
              e.preventDefault();
              e.stopPropagation();
            }
          });
        }
      });
    }

    /* -------------------------------------------------------------
       3. PROGRESS BAR / SCROLL TRACKER
       ------------------------------------------------------------- */
    initProgressBar() {
      if (!this.progressBar) return;

      const updateProgress = () => {
        const maxScroll = this.track.scrollWidth - this.track.clientWidth;
        if (maxScroll <= 0) {
          this.progressBar.style.width = '100%';
          this.progressBar.style.left = '0%';
          return;
        }

        const percentage = (this.track.scrollLeft / maxScroll) * 100;
        const barWidth = Math.max(15, (this.track.clientWidth / this.track.scrollWidth) * 100);
        const maxLeft = 100 - barWidth;
        const currentLeft = (percentage / 100) * maxLeft;

        this.progressBar.style.width = `${barWidth}%`;
        this.progressBar.style.left = `${currentLeft}%`;
      };

      this.track.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();
    }

    /* -------------------------------------------------------------
       4. INTERACTIVE LIGHTBOX MODAL
       ------------------------------------------------------------- */
    initLightbox() {
      if (!this.lightbox) return;

      this.cards.forEach((card, index) => {
        const zoomBtn = card.querySelector('.gallery-showcase-zoom-btn');
        if (zoomBtn) {
          zoomBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openLightbox(index);
          });
        } else if (this.section.dataset.lightbox === 'true') {
          // If no link, whole card opens lightbox
          const link = card.querySelector('.gallery-showcase-card-link');
          if (!link) {
            card.addEventListener('click', (e) => {
              if (!this.hasDragged) {
                this.openLightbox(index);
              }
            });
          }
        }
      });

      if (this.lightboxClose) {
        this.lightboxClose.addEventListener('click', () => this.closeLightbox());
      }

      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) {
          this.closeLightbox();
        }
      });

      if (this.lightboxPrev) {
        this.lightboxPrev.addEventListener('click', () => {
          this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.cards.length) % this.cards.length;
          this.renderLightboxContent(this.currentLightboxIndex);
        });
      }

      if (this.lightboxNext) {
        this.lightboxNext.addEventListener('click', () => {
          this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.cards.length;
          this.renderLightboxContent(this.currentLightboxIndex);
        });
      }

      document.addEventListener('keydown', (e) => {
        if (!this.lightbox.classList.contains('is-active')) return;
        if (e.key === 'Escape') this.closeLightbox();
        if (e.key === 'ArrowLeft') this.lightboxPrev?.click();
        if (e.key === 'ArrowRight') this.lightboxNext?.click();
      });
    }

    openLightbox(index) {
      this.currentLightboxIndex = index;
      this.renderLightboxContent(index);
      this.lightbox.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    renderLightboxContent(index) {
      const card = this.cards[index];
      if (!card) return;

      const fullUrl = card.dataset.fullImage || card.querySelector('img')?.src;
      const title = card.dataset.title || '';
      const desc = card.dataset.desc || '';

      if (this.lightboxImg) this.lightboxImg.src = fullUrl;
      if (this.lightboxTitle) this.lightboxTitle.textContent = title;
      if (this.lightboxDesc) this.lightboxDesc.textContent = desc;
    }

    closeLightbox() {
      this.lightbox.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    /* -------------------------------------------------------------
       5. OPTIONAL AUTO-SCROLL / AUTOPLAY
       ------------------------------------------------------------- */
    initAutoplay() {
      if (this.section.dataset.autoplay !== 'true') return;
      const speed = parseInt(this.section.dataset.speed || '4', 10) * 1000;

      let interval = setInterval(() => {
        const maxScroll = this.track.scrollWidth - this.track.clientWidth - 5;
        if (this.track.scrollLeft >= maxScroll) {
          this.track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          this.scrollByAmount(1);
        }
      }, speed);

      this.section.addEventListener('mouseenter', () => clearInterval(interval));
      this.section.addEventListener('mouseleave', () => {
        clearInterval(interval);
        interval = setInterval(() => {
          const maxScroll = this.track.scrollWidth - this.track.clientWidth - 5;
          if (this.track.scrollLeft >= maxScroll) {
            this.track.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            this.scrollByAmount(1);
          }
        }, speed);
      });
    }

    /* -------------------------------------------------------------
       6. THEME EDITOR SELECTOR
       ------------------------------------------------------------- */
    selectBlock(blockId) {
      const card = this.cards.find(
        (c) => c.dataset.blockId === blockId || c.id === `gallery-card-${blockId}`
      );
      if (card) {
        this.cards.forEach((c) => c.classList.remove('is-highlighted'));
        card.classList.add('is-highlighted');

        const offset = card.offsetLeft - this.track.offsetLeft - 32;
        this.track.scrollTo({
          left: offset,
          behavior: 'smooth',
        });
      }
    }
  }

  function initAllShowcaseGalleries() {
    const sections = document.querySelectorAll('.gallery-showcase-section');
    sections.forEach((sec) => {
      if (!sec._galleryShowcaseInstance) {
        sec._galleryShowcaseInstance = new GalleryShowcase(sec);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllShowcaseGalleries);
  } else {
    initAllShowcaseGalleries();
  }

  // Shopify Theme Customizer events
  document.addEventListener('shopify:section:load', (e) => {
    const sec = e.target.querySelector('.gallery-showcase-section') || e.target;
    if (sec && sec.classList.contains('gallery-showcase-section')) {
      sec._galleryShowcaseInstance = new GalleryShowcase(sec);
    }
  });

  document.addEventListener('shopify:block:select', (e) => {
    const block = e.target;
    const sec = block.closest('.gallery-showcase-section');
    if (sec && sec._galleryShowcaseInstance) {
      sec._galleryShowcaseInstance.selectBlock(block.dataset.blockId || block.id);
    }
  });
})();

