/**
 * Tour & Travel Wings - Custom Footer Script
 */
(function () {
  'use strict';

  function initTravelFooter() {
    var footers = document.querySelectorAll('.travel-footer');
    if (!footers.length) return;

    footers.forEach(function (footer) {
      if (footer.dataset.footerInitialized) return;
      footer.dataset.footerInitialized = 'true';

      var form = footer.querySelector('.travel-footer__newsletter-form');
      if (!form) return;

      var emailInput = form.querySelector('.travel-footer__input');
      var submitBtn = form.querySelector('.travel-footer__submit-btn');

      form.addEventListener('submit', function (e) {
        if (!emailInput) return;

        var emailValue = emailInput.value.trim();
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailValue)) {
          e.preventDefault();
          emailInput.focus();
          emailInput.style.outline = '2px solid #ef4444';
          setTimeout(function () {
            emailInput.style.outline = '';
          }, 2500);
          return false;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.75';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTravelFooter);
  } else {
    initTravelFooter();
  }

  // Support Shopify section rendering API in Theme Editor
  document.addEventListener('shopify:section:load', function (e) {
    if (e.target.classList.contains('travel-footer') || e.target.querySelector('.travel-footer')) {
      initTravelFooter();
    }
  });
})();

