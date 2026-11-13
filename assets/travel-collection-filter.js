/**
 * Automatic Tour Collection Filtering by Search Parameters
 * Tour & Travel Wings
 */
(function() {
  'use strict';

  function initCollectionFilter() {
    const params = new URLSearchParams(window.location.search);
    const destination = (params.get('destination') || params.get('q') || '').trim();
    const dateStart = params.get('date_start') || '';
    const dateEnd = params.get('date_end') || '';
    const adults = params.get('adults') || '';
    const children = params.get('children') || '';
    const rooms = params.get('rooms') || '';

    if (!destination && !dateStart && !dateEnd) return;

    // Find the product grid container
    const gridContainer = document.querySelector('.product-grid, results-list ul, ul[ref="grid"]');
    if (!gridContainer) return;

    const cards = Array.from(gridContainer.querySelectorAll('li.product-grid__item, li[ref="cards[]"], [data-product-id]'));
    if (cards.length === 0) return;

    const searchTerm = destination.toLowerCase().trim();
    let matchCount = 0;

    cards.forEach(card => {
      const title = (card.dataset.productTitle || card.querySelector('.product-card__title, h3, a')?.textContent || '').toLowerCase();
      const vendor = (card.dataset.productVendor || '').toLowerCase();
      const type = (card.dataset.productType || '').toLowerCase();
      const allText = card.innerText.toLowerCase();

      // Check match: title, vendor, product type, or card text
      let isMatch = false;
      if (!searchTerm) {
        isMatch = true;
      } else if (title.includes(searchTerm) || vendor.includes(searchTerm) || type.includes(searchTerm) || allText.includes(searchTerm)) {
        isMatch = true;
      } else {
        // Special synonyms (e.g. "swiss" <-> "switzerland", "thailand" <-> "thai", "uae" <-> "dubai")
        if (searchTerm.includes('swiss') && (title.includes('switzerland') || allText.includes('switzerland'))) isMatch = true;
        if (searchTerm.includes('switzerland') && (title.includes('swiss') || allText.includes('swiss'))) isMatch = true;
        if (searchTerm.includes('thai') && (title.includes('thailand') || allText.includes('thailand'))) isMatch = true;
        if (searchTerm.includes('dubai') && (title.includes('uae') || allText.includes('uae'))) isMatch = true;
        if (searchTerm.includes('bali') && (title.includes('indonesia') || allText.includes('indonesia'))) isMatch = true;
      }

      if (isMatch) {
        card.style.display = '';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Remove any previously inserted filter bar
    const existingBar = document.getElementById('travel-active-filter-bar');
    if (existingBar) existingBar.remove();

    // Construct filter bar HTML
    const filterBar = document.createElement('div');
    filterBar.id = 'travel-active-filter-bar';

    let detailsHtml = '';
    if (destination) {
      detailsHtml += `<span>📍 Destination: <strong>${escapeHtml(destination)}</strong></span>`;
    }
    if (dateStart) {
      const datesLabel = dateEnd ? `${dateStart} to ${dateEnd}` : dateStart;
      detailsHtml += `<span class="travel-filter-dot">•</span><span>📅 ${escapeHtml(datesLabel)}</span>`;
    }
    if (adults) {
      let guestLabel = `${adults} Adults`;
      if (children && children !== '0') guestLabel += `, ${children} Children`;
      if (rooms && rooms !== '1') guestLabel += ` (${rooms} Rooms)`;
      detailsHtml += `<span class="travel-filter-dot">•</span><span>👥 ${escapeHtml(guestLabel)}</span>`;
    }

    if (matchCount > 0) {
      filterBar.className = 'travel-filter-active-bar';
      filterBar.innerHTML = `
        <div class="travel-filter-active-info">
          ${detailsHtml}
          <span class="travel-filter-count-badge">${matchCount} Tour${matchCount > 1 ? 's' : ''} Found</span>
        </div>
        <button type="button" class="travel-filter-reset-btn" id="travel-filter-reset">
          ✕ Clear Filter (Show All ${cards.length})
        </button>
      `;
    } else {
      // No direct match: show alert and restore all cards so user sees all options
      cards.forEach(card => card.style.display = '');
      filterBar.className = 'travel-filter-empty-alert';
      filterBar.innerHTML = `
        <div>
          No specific tours matched <strong>"${escapeHtml(destination)}"</strong>. Showing all <strong>${cards.length} available world tours</strong> below:
        </div>
        <button type="button" class="travel-filter-reset-btn" id="travel-filter-reset" style="background:#0a2e5c;color:#fff;">
          ✕ Clear Notice
        </button>
      `;
    }

    // Insert bar right above gridContainer
    gridContainer.parentNode.insertBefore(filterBar, gridContainer);

    // Reset button handler
    const resetBtn = filterBar.querySelector('#travel-filter-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        cards.forEach(c => c.style.display = '');
        filterBar.remove();
        // Clean URL query parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    // Smoothly scroll down to results
    setTimeout(() => {
      filterBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  }

  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollectionFilter);
  } else {
    initCollectionFilter();
  }
})();

