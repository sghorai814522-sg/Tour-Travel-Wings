/**
 * Travel Hero Slider & Dynamic Search Bar
 * Tour & Travel Wings
 * 
 * Fully responsive carousel with automatic sliding, touch swipe,
 * dynamic destination autocomplete, interactive calendar range picker,
 * and traveler counter.
 */

(function () {
  'use strict';

  class TravelHeroSlider {
    constructor(sectionElement) {
      this.section = sectionElement;
      this.slider = this.section.querySelector('.travel-hero-slider');
      if (!this.slider) return;

      this.slides = Array.from(this.slider.querySelectorAll('.travel-hero-slide'));
      this.dots = Array.from(this.slider.querySelectorAll('.travel-hero-dot'));
      this.prevBtn = this.slider.querySelector('.travel-hero-prev-btn');
      this.nextBtn = this.slider.querySelector('.travel-hero-next-btn');

      this.currentIndex = 0;
      this.totalSlides = this.slides.length;
      this.autoplay = this.slider.dataset.autoplay === 'true';
      this.intervalDuration = parseInt(this.slider.dataset.interval || '5', 10) * 1000;
      this.timer = null;
      this.isInteractingWithSearch = false;

      // Init subcomponents
      this.initSlider();
      this.initTouchSwipe();
      this.initSearchBar();
    }

    /* -------------------------------------------------------------
       SLIDER CORE
       ------------------------------------------------------------- */
    initSlider() {
      if (this.totalSlides <= 1) return;

      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.prevSlide();
          this.resetAutoplay();
        });
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.nextSlide();
          this.resetAutoplay();
        });
      }

      this.dots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          this.goToSlide(index);
          this.resetAutoplay();
        });
      });

      // Pause on hover
      this.slider.addEventListener('mouseenter', () => this.pauseAutoplay());
      this.slider.addEventListener('mouseleave', () => {
        if (!this.isInteractingWithSearch) {
          this.startAutoplay();
        }
      });

      this.startAutoplay();
    }

    goToSlide(index) {
      if (index === this.currentIndex) return;

      this.slides[this.currentIndex].classList.remove('is-active');
      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.remove('is-active');
      }

      this.currentIndex = (index + this.totalSlides) % this.totalSlides;

      this.slides[this.currentIndex].classList.add('is-active');
      if (this.dots[this.currentIndex]) {
        this.dots[this.currentIndex].classList.add('is-active');
      }
    }

    nextSlide() {
      this.goToSlide(this.currentIndex + 1);
    }

    prevSlide() {
      this.goToSlide(this.currentIndex - 1);
    }

    startAutoplay() {
      if (!this.autoplay || this.totalSlides <= 1) return;
      this.pauseAutoplay();
      this.timer = setInterval(() => {
        if (!this.isInteractingWithSearch) {
          this.nextSlide();
        }
      }, this.intervalDuration);
    }

    pauseAutoplay() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }

    resetAutoplay() {
      this.pauseAutoplay();
      this.startAutoplay();
    }

    /* -------------------------------------------------------------
       TOUCH SWIPE (MOBILE / TABLET)
       ------------------------------------------------------------- */
    initTouchSwipe() {
      let touchStartX = 0;
      let touchEndX = 0;
      let touchStartY = 0;
      let touchEndY = 0;

      this.slider.addEventListener(
        'touchstart',
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        },
        { passive: true }
      );

      this.slider.addEventListener(
        'touchend',
        (e) => {
          touchEndX = e.changedTouches[0].screenX;
          touchEndY = e.changedTouches[0].screenY;
          this.handleGesture(touchStartX, touchEndX, touchStartY, touchEndY);
        },
        { passive: true }
      );
    }

    handleGesture(startX, endX, startY, endY) {
      const diffX = endX - startX;
      const diffY = endY - startY;

      // Only horizontal swipes
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX < 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
        this.resetAutoplay();
      }
    }

    /* -------------------------------------------------------------
       DYNAMIC SEARCH & BOOKING BAR
       ------------------------------------------------------------- */
    initSearchBar() {
      const form = this.section.querySelector('.travel-search-form');
      if (!form) return;

      const backdrop = this.section.querySelector('.travel-popover-backdrop');
      const allPopovers = Array.from(this.section.querySelectorAll('.travel-popover'));
      const allFields = Array.from(this.section.querySelectorAll('.travel-search-field'));

      const closeAllPopovers = () => {
        allPopovers.forEach((p) => p.classList.remove('is-visible'));
        allFields.forEach((f) => f.classList.remove('is-open'));
        if (backdrop) backdrop.classList.remove('is-active');
        this.isInteractingWithSearch = false;
        this.startAutoplay();
      };

      if (backdrop) {
        backdrop.addEventListener('click', closeAllPopovers);
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllPopovers();
      });

      const openPopover = (field, popover) => {
        const isOpen = popover.classList.contains('is-visible');
        closeAllPopovers();
        if (!isOpen) {
          popover.classList.add('is-visible');
          field.classList.add('is-open');
          if (backdrop) backdrop.classList.add('is-active');
          this.isInteractingWithSearch = true;
          this.pauseAutoplay();
        }
      };

      // 1. Destination Field
      this.initDestinationField(form, openPopover, closeAllPopovers);

      // 2. Calendar Field
      this.initCalendarField(form, openPopover, closeAllPopovers);

      // 3. Travelers Field
      this.initTravelersField(form, openPopover, closeAllPopovers);

      // 4. Form Submission
      form.addEventListener('submit', (e) => {
        this.handleFormSubmit(e, form);
      });
    }

    /* -------------------------------------------------------------
       1. DESTINATION AUTOCOMPLETE / SELECTOR
       ------------------------------------------------------------- */
    initDestinationField(form, openPopover, closeAllPopovers) {
      const field = form.querySelector('[data-search-field="destination"]');
      const popover = form.querySelector('.travel-dest-popover');
      if (!field || !popover) return;

      const valueEl = field.querySelector('.travel-search-value');
      const hiddenInput = form.querySelector('#travel-input-destination');
      const queryInput = form.querySelector('#travel-search-query-input');
      const searchInput = popover.querySelector('.travel-dest-search-input');
      const items = Array.from(popover.querySelectorAll('.travel-dest-item'));
      const emptyState = popover.querySelector('.travel-dest-empty');

      field.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(field, popover);
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 80);
        }
      });

      // Destination search filter
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          const term = searchInput.value.trim().toLowerCase();
          let visibleCount = 0;

          items.forEach((item) => {
            const name = (item.dataset.name || '').toLowerCase();
            const country = (item.dataset.country || '').toLowerCase();
            if (name.includes(term) || country.includes(term)) {
              item.style.display = 'flex';
              visibleCount++;
            } else {
              item.style.display = 'none';
            }
          });

          if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
          }
        });

        // Allow pressing Enter in destination search input to choose directly
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const customVal = searchInput.value.trim();
            if (customVal) {
              setDestination(customVal, customVal);
              closeAllPopovers();
            }
          }
        });
      }

      const setDestination = (displayName, queryValue) => {
        if (valueEl) valueEl.textContent = displayName;
        if (hiddenInput) hiddenInput.value = queryValue;
        if (queryInput) queryInput.value = queryValue;
        field.classList.add('has-selection');

        items.forEach((item) => {
          if (item.dataset.name === displayName) {
            item.classList.add('is-selected');
          } else {
            item.classList.remove('is-selected');
          }
        });
      };

      items.forEach((item) => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const name = item.dataset.name;
          const country = item.dataset.country;
          const display = `${name}, ${country}`;
          setDestination(display, `${name} ${country}`);
          closeAllPopovers();
        });
      });
    }

    /* -------------------------------------------------------------
       2. INTERACTIVE CALENDAR DATE RANGE PICKER
       ------------------------------------------------------------- */
    initCalendarField(form, openPopover, closeAllPopovers) {
      const field = form.querySelector('[data-search-field="calendar"]');
      const popover = form.querySelector('.travel-calendar-popover');
      if (!field || !popover) return;

      const valueEl = field.querySelector('.travel-search-value');
      const inputStart = form.querySelector('#travel-input-date-start');
      const inputEnd = form.querySelector('#travel-input-date-end');

      const monthTitle = popover.querySelector('.travel-cal-month-title');
      const daysGrid = popover.querySelector('.travel-cal-days-grid');
      const prevMonthBtn = popover.querySelector('.travel-cal-prev-btn');
      const nextMonthBtn = popover.querySelector('.travel-cal-next-btn');
      const btnClear = popover.querySelector('.travel-cal-btn-clear');
      const btnApply = popover.querySelector('.travel-cal-btn-apply');
      const presets = Array.from(popover.querySelectorAll('.travel-cal-preset-btn'));

      field.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(field, popover);
      });

      // Calendar state
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentViewYear = today.getFullYear();
      let currentViewMonth = today.getMonth();

      let selectedStartDate = null;
      let selectedEndDate = null;

      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const renderCalendar = () => {
        if (!monthTitle || !daysGrid) return;
        monthTitle.textContent = `${months[currentViewMonth]} ${currentViewYear}`;
        daysGrid.innerHTML = '';

        const firstDayIndex = new Date(currentViewYear, currentViewMonth, 1).getDay();
        const totalDays = new Date(currentViewYear, currentViewMonth + 1, 0).getDate();

        // Empty slots before 1st of month
        for (let i = 0; i < firstDayIndex; i++) {
          const empty = document.createElement('div');
          empty.className = 'travel-cal-day is-empty';
          daysGrid.appendChild(empty);
        }

        // Days
        for (let day = 1; day <= totalDays; day++) {
          const dateObj = new Date(currentViewYear, currentViewMonth, day);
          dateObj.setHours(0, 0, 0, 0);

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'travel-cal-day';
          btn.textContent = day;

          if (dateObj < today) {
            btn.classList.add('is-disabled');
          } else {
            if (dateObj.getTime() === today.getTime()) {
              btn.classList.add('is-today');
            }

            const time = dateObj.getTime();
            const startTime = selectedStartDate ? selectedStartDate.getTime() : null;
            const endTime = selectedEndDate ? selectedEndDate.getTime() : null;

            if (startTime && time === startTime) {
              btn.classList.add('is-selected-start');
              if (endTime) btn.classList.add('has-range');
            } else if (endTime && time === endTime) {
              btn.classList.add('is-selected-end');
              btn.classList.add('has-range');
            } else if (startTime && endTime && time > startTime && time < endTime) {
              btn.classList.add('is-in-range');
            }

            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              handleDayClick(dateObj);
            });
          }

          daysGrid.appendChild(btn);
        }
      };

      const handleDayClick = (dateObj) => {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
          selectedStartDate = dateObj;
          selectedEndDate = null;
        } else if (selectedStartDate && !selectedEndDate) {
          if (dateObj < selectedStartDate) {
            selectedStartDate = dateObj;
          } else {
            selectedEndDate = dateObj;
          }
        }
        renderCalendar();
        updateDisplayPreview();
      };

      const formatDateShort = (d) => {
        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${d.getDate()} ${shortMonths[d.getMonth()]}`;
      };

      const formatISODate = (d) => {
        return d.toISOString().split('T')[0];
      };

      const updateDisplayPreview = () => {
        if (selectedStartDate && selectedEndDate) {
          const text = `${formatDateShort(selectedStartDate)} - ${formatDateShort(selectedEndDate)}`;
          if (valueEl) valueEl.textContent = text;
          if (inputStart) inputStart.value = formatISODate(selectedStartDate);
          if (inputEnd) inputEnd.value = formatISODate(selectedEndDate);
          field.classList.add('has-selection');
        } else if (selectedStartDate) {
          const text = formatDateShort(selectedStartDate);
          if (valueEl) valueEl.textContent = text;
          if (inputStart) inputStart.value = formatISODate(selectedStartDate);
          if (inputEnd) inputEnd.value = '';
          field.classList.add('has-selection');
        } else {
          if (valueEl) valueEl.textContent = 'Select dates';
          if (inputStart) inputStart.value = '';
          if (inputEnd) inputEnd.value = '';
          field.classList.remove('has-selection');
        }
      };

      if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentViewMonth--;
          if (currentViewMonth < 0) {
            currentViewMonth = 11;
            currentViewYear--;
          }
          renderCalendar();
        });
      }

      if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          currentViewMonth++;
          if (currentViewMonth > 11) {
            currentViewMonth = 0;
            currentViewYear++;
          }
          renderCalendar();
        });
      }

      if (btnClear) {
        btnClear.addEventListener('click', (e) => {
          e.stopPropagation();
          selectedStartDate = null;
          selectedEndDate = null;
          updateDisplayPreview();
          renderCalendar();
        });
      }

      if (btnApply) {
        btnApply.addEventListener('click', (e) => {
          e.stopPropagation();
          updateDisplayPreview();
          closeAllPopovers();
        });
      }

      // Quick preset buttons
      presets.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const preset = btn.dataset.preset;
          const now = new Date(today);

          if (preset === 'weekend') {
            // Find next Friday & Sunday
            const dayOfWeek = now.getDay();
            const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
            selectedStartDate = new Date(now);
            selectedStartDate.setDate(now.getDate() + daysUntilFriday);
            selectedEndDate = new Date(selectedStartDate);
            selectedEndDate.setDate(selectedStartDate.getDate() + 2);
          } else if (preset === 'next_week') {
            selectedStartDate = new Date(now);
            selectedStartDate.setDate(now.getDate() + 7);
            selectedEndDate = new Date(selectedStartDate);
            selectedEndDate.setDate(selectedStartDate.getDate() + 7);
          } else if (preset === 'next_month') {
            selectedStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            selectedEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 8);
          } else if (preset === 'flexible') {
            selectedStartDate = null;
            selectedEndDate = null;
            if (valueEl) valueEl.textContent = 'Flexible Dates';
            field.classList.add('has-selection');
            closeAllPopovers();
            return;
          }

          currentViewYear = selectedStartDate.getFullYear();
          currentViewMonth = selectedStartDate.getMonth();
          renderCalendar();
          updateDisplayPreview();
          closeAllPopovers();
        });
      });

      // Initial calendar render
      renderCalendar();
    }

    /* -------------------------------------------------------------
       3. TRAVELERS COUNTER SELECTOR
       ------------------------------------------------------------- */
    initTravelersField(form, openPopover, closeAllPopovers) {
      const field = form.querySelector('[data-search-field="travelers"]');
      const popover = form.querySelector('.travel-travelers-popover');
      if (!field || !popover) return;

      const valueEl = field.querySelector('.travel-search-value');
      const inputAdults = form.querySelector('#travel-input-adults');
      const inputChildren = form.querySelector('#travel-input-children');
      const inputRooms = form.querySelector('#travel-input-rooms');
      const btnDone = popover.querySelector('.travel-travelers-btn-done');

      let counts = {
        adults: 2,
        children: 0,
        infants: 0,
        rooms: 1,
      };

      field.addEventListener('click', (e) => {
        e.stopPropagation();
        openPopover(field, popover);
      });

      const updateSummary = () => {
        let parts = [];
        if (counts.adults > 0) {
          parts.push(`${counts.adults} Adult${counts.adults > 1 ? 's' : ''}`);
        }
        if (counts.children > 0) {
          parts.push(`${counts.children} Child${counts.children > 1 ? 'ren' : ''}`);
        }
        if (counts.infants > 0) {
          parts.push(`${counts.infants} Infant${counts.infants > 1 ? 's' : ''}`);
        }

        let summary = parts.join(', ');
        if (counts.rooms > 1) {
          summary += ` (${counts.rooms} Rooms)`;
        }

        if (valueEl) valueEl.textContent = summary || '1 Adult';
        if (inputAdults) inputAdults.value = counts.adults;
        if (inputChildren) inputChildren.value = counts.children;
        if (inputRooms) inputRooms.value = counts.rooms;

        field.classList.add('has-selection');
      };

      const rows = Array.from(popover.querySelectorAll('.travel-guest-row'));
      rows.forEach((row) => {
        const type = row.dataset.type;
        const minusBtn = row.querySelector('.travel-counter-minus');
        const plusBtn = row.querySelector('.travel-counter-plus');
        const valEl = row.querySelector('.travel-counter-value');
        const min = parseInt(row.dataset.min || '0', 10);
        const max = parseInt(row.dataset.max || '10', 10);

        const checkDisabled = () => {
          if (minusBtn) minusBtn.disabled = counts[type] <= min;
          if (plusBtn) plusBtn.disabled = counts[type] >= max;
        };

        if (minusBtn) {
          minusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (counts[type] > min) {
              counts[type]--;
              if (valEl) valEl.textContent = counts[type];
              checkDisabled();
              updateSummary();
            }
          });
        }

        if (plusBtn) {
          plusBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (counts[type] < max) {
              counts[type]++;
              if (valEl) valEl.textContent = counts[type];
              checkDisabled();
              updateSummary();
            }
          });
        }

        checkDisabled();
      });

      if (btnDone) {
        btnDone.addEventListener('click', (e) => {
          e.stopPropagation();
          updateSummary();
          closeAllPopovers();
        });
      }

      updateSummary();
    }

    /* -------------------------------------------------------------
       4. FORM SUBMISSION & TOUR SEARCH REDIRECT
       ------------------------------------------------------------- */
    handleFormSubmit(e, form) {
      e.preventDefault();

      const submitBtn = form.querySelector('.travel-search-submit-btn');
      if (submitBtn) submitBtn.classList.add('is-loading');

      const destination = (form.querySelector('#travel-input-destination')?.value || '').trim();
      const dateStart = form.querySelector('#travel-input-date-start')?.value || '';
      const dateEnd = form.querySelector('#travel-input-date-end')?.value || '';
      const adults = form.querySelector('#travel-input-adults')?.value || '2';
      const children = form.querySelector('#travel-input-children')?.value || '0';
      const rooms = form.querySelector('#travel-input-rooms')?.value || '1';

      // Save recent search in localStorage for convenience
      try {
        localStorage.setItem(
          'lastTourSearch',
          JSON.stringify({
            destination,
            dateStart,
            dateEnd,
            adults,
            children,
            rooms,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        // Storage might be disabled
      }

      // Dispatch custom event for theme analytics or third-party apps
      const searchEvent = new CustomEvent('travel:search', {
        detail: { destination, dateStart, dateEnd, adults, children, rooms },
        bubbles: true,
      });
      this.section.dispatchEvent(searchEvent);

      // Construct Shopify Search Query URL
      let queryTerms = [];
      if (destination) {
        queryTerms.push(destination);
      } else {
        queryTerms.push('Tour');
      }

      const queryString = encodeURIComponent(queryTerms.join(' '));
      const targetUrl = `/search?type=product&q=${queryString}&options%5Bprefix%5D=last`;

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 350);
    }
  }

  /* -------------------------------------------------------------
     SHOPIFY THEME EDITOR INTEGRATION & INITIALIZATION
     ------------------------------------------------------------- */
  function initAllTravelSliders() {
    const sections = document.querySelectorAll('.travel-hero-section');
    sections.forEach((sec) => {
      if (!sec._travelSliderInstance) {
        sec._travelSliderInstance = new TravelHeroSlider(sec);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllTravelSliders);
  } else {
    initAllTravelSliders();
  }

  // Shopify Theme Customizer Live Events
  document.addEventListener('shopify:section:load', (e) => {
    const sec = e.target.querySelector('.travel-hero-section') || e.target;
    if (sec && sec.classList.contains('travel-hero-section')) {
      sec._travelSliderInstance = new TravelHeroSlider(sec);
    }
  });

  document.addEventListener('shopify:block:select', (e) => {
    const block = e.target;
    const sliderSec = block.closest('.travel-hero-section');
    if (sliderSec && sliderSec._travelSliderInstance) {
      const instance = sliderSec._travelSliderInstance;
      const index = instance.slides.findIndex((s) => s.dataset.blockId === block.dataset.blockId || s.id === block.id);
      if (index !== -1) {
        instance.goToSlide(index);
        instance.pauseAutoplay();
      }
    }
  });

  document.addEventListener('shopify:block:deselect', (e) => {
    const sliderSec = e.target.closest('.travel-hero-section');
    if (sliderSec && sliderSec._travelSliderInstance) {
      sliderSec._travelSliderInstance.startAutoplay();
    }
  });
})();

