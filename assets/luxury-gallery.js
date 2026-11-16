/**
 * THE GRAND TRAVEL GALLERY - LUXURY EDITION JS
 * Tour & Travel Wings
 */

(function () {
  'use strict';

  function initLuxuryGallery() {
    const gallerySection = document.querySelector('[data-section-type="luxury-gallery"]');
    if (!gallerySection) return;

    // Elements
    const grid = gallerySection.querySelector('#lgGrid');
    const cards = Array.from(gallerySection.querySelectorAll('.lg-card'));
    const filterBtns = Array.from(gallerySection.querySelectorAll('.lg-filter-btn'));
    const searchInput = gallerySection.querySelector('#lgSearchInput');
    const searchClear = gallerySection.querySelector('#lgSearchClear');
    const layoutBtns = Array.from(gallerySection.querySelectorAll('.lg-layout-btn'));
    const loadMoreBtn = gallerySection.querySelector('#lgLoadMoreBtn');
    const loadMoreWrap = gallerySection.querySelector('#lgLoadMoreWrap');
    const progressFill = gallerySection.querySelector('#lgProgressFill');
    const progressText = gallerySection.querySelector('#lgProgressText');
    const viewStatus = gallerySection.querySelector('#lgViewStatus');
    const emptyState = gallerySection.querySelector('#lgEmptyState');
    const emptyResetBtn = gallerySection.querySelector('#lgEmptyResetBtn');

    // Lightbox Elements
    const lightbox = document.getElementById('lgLightbox');
    if (!lightbox) return;

    const lbImg = lightbox.querySelector('#lgLbImg');
    const lbCounter = lightbox.querySelector('#lgLbCounter');
    const lbTitle = lightbox.querySelector('#lgLbTitle');
    const lbCategory = lightbox.querySelector('#lgLbCategory');
    const lbLocation = lightbox.querySelector('#lgLbLocation');
    const lbDesc = lightbox.querySelector('#lgLbDesc');
    const lbInquireBtn = lightbox.querySelector('#lgLbInquireBtn');
    const lbClose = lightbox.querySelector('#lgLbClose');
    const lbPrev = lightbox.querySelector('#lgLbPrev');
    const lbNext = lightbox.querySelector('#lgLbNext');
    const lbZoom = lightbox.querySelector('#lgLbZoom');
    const lbStage = lightbox.querySelector('.lg-lb-stage');
    const lbImgWrap = lightbox.querySelector('.lg-lb-img-wrap');

    // State
    const BATCH_SIZE = 16;
    let currentLimit = Math.min(BATCH_SIZE, cards.length);
    let activeCategory = 'all';
    let searchQuery = '';
    let visibleCards = [];
    let currentLbIndex = 0;
    let isZoomed = false;

    // Build data objects from card attributes
    const cardData = cards.map((card, idx) => {
      return {
        element: card,
        index: idx,
        category: card.getAttribute('data-category') || 'all',
        title: card.getAttribute('data-title') || '',
        location: card.getAttribute('data-location') || '',
        desc: card.getAttribute('data-desc') || '',
        imgUrl: card.getAttribute('data-full-img') || card.querySelector('img')?.src || '',
        link: card.getAttribute('data-link') || '/pages/contact'
      };
    });

    // 1. FILTER & SEARCH LOGIC
    function applyFilters(resetLimit = false) {
      if (resetLimit) {
        currentLimit = BATCH_SIZE;
      }

      const q = searchQuery.toLowerCase().trim();

      // Filter matched cards
      const matched = cardData.filter((item) => {
        const matchCat = activeCategory === 'all' || item.category === activeCategory;
        const matchSearch =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q);
        return matchCat && matchSearch;
      });

      // Update visible items slice
      const displayed = matched.slice(0, currentLimit);
      visibleCards = displayed;

      // Hide all first, show displayed
      cardData.forEach((item) => {
        item.element.style.display = 'none';
      });

      displayed.forEach((item, i) => {
        item.element.style.display = '';
        item.element.style.animationDelay = `${Math.min(i * 0.03, 0.4)}s`;
      });

      // Empty State
      if (matched.length === 0) {
        emptyState.style.display = 'block';
      } else {
        emptyState.style.display = 'none';
      }

      // Update Status Counts
      if (viewStatus) {
        viewStatus.innerHTML = `Showing <strong>${displayed.length}</strong> of <strong>${matched.length}</strong> escapes`;
      }

      // Progress & Load More Button
      if (loadMoreWrap) {
        if (displayed.length >= matched.length) {
          loadMoreWrap.style.display = 'none';
        } else {
          loadMoreWrap.style.display = 'flex';
          const pct = Math.round((displayed.length / matched.length) * 100);
          if (progressFill) progressFill.style.width = `${pct}%`;
          if (progressText) {
            progressText.textContent = `Revealed ${displayed.length} of ${matched.length} wonders`;
          }
        }
      }
    }

    // Category Tabs Click
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-filter') || 'all';
        applyFilters(true);
      });
    });

    // Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        if (searchClear) {
          searchClear.style.display = searchQuery ? 'block' : 'none';
        }
        applyFilters(true);
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        searchClear.style.display = 'none';
        applyFilters(true);
      });
    }

    if (emptyResetBtn) {
      emptyResetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        searchQuery = '';
        if (searchClear) searchClear.style.display = 'none';
        activeCategory = 'all';
        filterBtns.forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
        });
        applyFilters(true);
      });
    }

    // Load More Click
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        currentLimit += BATCH_SIZE;
        applyFilters(false);
      });
    }

    // Layout Toggles (Cols 3 / Cols 4)
    layoutBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        layoutBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const cols = btn.getAttribute('data-cols');
        if (grid) {
          grid.classList.remove('cols-2', 'cols-3', 'cols-4');
          if (cols === '3') grid.classList.add('cols-3');
          else if (cols === '2') grid.classList.add('cols-2');
        }
      });
    });

    // 2. LIGHTBOX LOGIC
    function openLightbox(indexInVisible) {
      if (!visibleCards[indexInVisible]) return;
      currentLbIndex = indexInVisible;
      updateLightboxContent();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      resetZoom();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      resetZoom();
    }

    function updateLightboxContent() {
      const item = visibleCards[currentLbIndex];
      if (!item) return;

      lbImg.style.opacity = '0.3';
      lbImg.src = item.imgUrl;
      lbImg.alt = item.title;

      lbImg.onload = () => {
        lbImg.style.opacity = '1';
      };

      if (lbCounter) {
        lbCounter.textContent = `${currentLbIndex + 1} / ${visibleCards.length}`;
      }
      if (lbTitle) lbTitle.textContent = item.title;
      if (lbLocation) {
        lbLocation.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${item.location}`;
      }
      if (lbCategory) {
        lbCategory.textContent = item.category.toUpperCase();
      }
      if (lbDesc) lbDesc.textContent = item.desc;
      if (lbInquireBtn) {
        lbInquireBtn.href = `${item.link}?destination=${encodeURIComponent(item.location)}&title=${encodeURIComponent(item.title)}`;
      }
    }

    function nextLb() {
      if (currentLbIndex < visibleCards.length - 1) {
        currentLbIndex++;
      } else {
        currentLbIndex = 0; // wrap around
      }
      resetZoom();
      updateLightboxContent();
    }

    function prevLb() {
      if (currentLbIndex > 0) {
        currentLbIndex--;
      } else {
        currentLbIndex = visibleCards.length - 1; // wrap around
      }
      resetZoom();
      updateLightboxContent();
    }

    function toggleZoom() {
      isZoomed = !isZoomed;
      if (isZoomed) {
        lbImgWrap.style.transform = 'scale(1.4)';
        lbImgWrap.style.cursor = 'zoom-out';
      } else {
        resetZoom();
      }
    }

    function resetZoom() {
      isZoomed = false;
      if (lbImgWrap) {
        lbImgWrap.style.transform = 'scale(1)';
        lbImgWrap.style.cursor = 'zoom-in';
      }
    }

    // Card Clicks to Open Lightbox
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const visibleIdx = visibleCards.findIndex((v) => v.element === card);
        if (visibleIdx !== -1) {
          openLightbox(visibleIdx);
        }
      });
    });

    // Lightbox Controls
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    if (lbNext) lbNext.addEventListener('click', nextLb);
    if (lbPrev) lbPrev.addEventListener('click', prevLb);
    if (lbZoom) lbZoom.addEventListener('click', toggleZoom);
    if (lbImgWrap) lbImgWrap.addEventListener('click', toggleZoom);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLb();
      if (e.key === 'ArrowLeft') prevLb();
    });

    // Touch Swipe Support for Lightbox
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      },
      { passive: true }
    );

    function handleSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) {
          nextLb(); // Swiped left -> next
        } else {
          prevLb(); // Swiped right -> prev
        }
      }
    }

    // Initial Execution
    applyFilters(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryGallery);
  } else {
    initLuxuryGallery();
  }
})();
