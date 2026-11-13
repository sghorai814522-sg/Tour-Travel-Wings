/**
 * Travel Wings AI Assistant & Concierge
 * Tour & Travel Wings
 */
(function() {
  'use strict';

  function initChatbot() {
    const widget = document.querySelector('.travel-chatbot-widget');
    if (!widget) return;

    const toggleBtn = widget.querySelector('.travel-chatbot-toggle');
    const modal = widget.querySelector('.travel-chatbot-modal');
    const minimizeBtn = widget.querySelector('.travel-chatbot-btn-minimize');
    const body = widget.querySelector('.travel-chatbot-body');
    const form = widget.querySelector('.travel-chatbot-form');
    const input = widget.querySelector('.travel-chatbot-input');
    const badge = widget.querySelector('.travel-chatbot-badge-prompt');
    const botAvatarSrc = widget.dataset.botAvatar || 'travel-bot-mascot.png';

    if (!toggleBtn || !modal) return;

    // Toggle chat open / close
    function toggleChat() {
      const isOpen = widget.classList.toggle('is-open');
      if (isOpen) {
        if (badge) badge.style.display = 'none';
        if (input) setTimeout(() => input.focus(), 150);
        scrollToBottom();
      }
    }

    toggleBtn.addEventListener('click', toggleChat);
    if (minimizeBtn) minimizeBtn.addEventListener('click', toggleChat);

    function scrollToBottom() {
      setTimeout(() => {
        body.scrollTop = body.scrollHeight;
      }, 50);
    }

    function getTimeString() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Append user message
    function appendUserMessage(text) {
      const msg = document.createElement('div');
      msg.className = 'travel-chatbot-msg user';
      msg.innerHTML = `
        <div class="travel-chatbot-bubble">${escapeHtml(text)}</div>
        <div class="travel-chatbot-msg-time">${getTimeString()}</div>
      `;
      body.appendChild(msg);
      scrollToBottom();
    }

    // Append typing indicator
    function showTyping() {
      const typing = document.createElement('div');
      typing.className = 'travel-chatbot-typing';
      typing.id = 'travel-chatbot-typing-indicator';
      typing.innerHTML = `
        <span class="travel-chatbot-dot"></span>
        <span class="travel-chatbot-dot"></span>
        <span class="travel-chatbot-dot"></span>
      `;
      body.appendChild(typing);
      scrollToBottom();
      return typing;
    }

    function removeTyping() {
      const typing = document.getElementById('travel-chatbot-typing-indicator');
      if (typing) typing.remove();
    }

    // Append bot message with optional action card and chips
    function appendBotMessage(htmlContent, ctaCardHtml, chipsArray) {
      removeTyping();

      const msg = document.createElement('div');
      msg.className = 'travel-chatbot-msg bot';

      let inner = `
        <div class="travel-chatbot-msg-author">
          <img src="${botAvatarSrc}" alt="Travel Wings AI" class="travel-chatbot-msg-avatar" width="24" height="24">
          <span class="travel-chatbot-msg-author-name">Wings AI Guide</span>
        </div>
        <div class="travel-chatbot-bubble">${htmlContent}
      `;
      if (ctaCardHtml) {
        inner += ctaCardHtml;
      }
      inner += `</div>`;
      inner += `<div class="travel-chatbot-msg-time">${getTimeString()}</div>`;

      if (chipsArray && chipsArray.length > 0) {
        inner += `<div class="travel-chatbot-chips">`;
        chipsArray.forEach(chip => {
          inner += `<button type="button" class="travel-chatbot-chip" data-query="${escapeHtml(chip.query || chip.text)}">${escapeHtml(chip.text)}</button>`;
        });
        inner += `</div>`;
      }

      msg.innerHTML = inner;
      body.appendChild(msg);
      scrollToBottom();

      // Attach click handlers to newly added chips
      msg.querySelectorAll('.travel-chatbot-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const q = btn.dataset.query;
          handleQuery(q);
        });
      });
    }

    function escapeHtml(string) {
      const div = document.createElement('div');
      div.innerText = string;
      return div.innerHTML;
    }

    // Intelligent Travel Knowledge Engine
    function getBotResponse(query) {
      const q = query.toLowerCase().trim();

      // 1. Bali
      if (q.includes('bali') || q.includes('indonesia')) {
        return {
          text: `🌺 <strong>Bali Escape Tour (7 Days / 6 Nights)</strong><br>Experience the Island of the Gods! Highlights include Ubud rice terraces, Uluwatu cliff temple, Seminyak beach clubs, and private luxury villa accommodations. Starting from <strong>$799</strong> per person.`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Bali Escape Package</span>
              <a href="/search?type=product&options%5Bprefix%5D=last&q=Bali*" class="travel-chatbot-cta-btn">View Bali Tour Package</a>
              <a href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20the%20Bali%20Escape%20Tour!" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Book via WhatsApp</a>
            </div>
          `,
          chips: [
            { text: '🏔️ Swiss Alps Tour', query: 'Swiss Alps' },
            { text: '🛕 Thailand Tour', query: 'Thailand' },
            { text: '📞 Speak to Agent', query: 'Contact support' }
          ]
        };
      }

      // 2. Switzerland / Swiss
      if (q.includes('swiss') || q.includes('switzerland') || q.includes('alps') || q.includes('zermatt')) {
        return {
          text: `🏔️ <strong>Swiss Alps Adventure (9 Days / 7 Nights)</strong><br>Breathtaking snow-capped peaks, Matterhorn views, panoramic Glacier Express train, and luxury alpine chalets. Starting from <strong>$1,299</strong> per person.`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Swiss Alps Adventure Package</span>
              <a href="/search?type=product&options%5Bprefix%5D=last&q=Swiss*" class="travel-chatbot-cta-btn">View Swiss Alps Tour</a>
              <a href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20know%20more%20about%20the%20Swiss%20Alps%20Tour!" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Book via WhatsApp</a>
            </div>
          `,
          chips: [
            { text: '🌴 Bali Package', query: 'Bali' },
            { text: '✨ Dubai Getaway', query: 'Dubai' },
            { text: '📋 View All Packages', query: 'all packages' }
          ]
        };
      }

      // 3. Thailand
      if (q.includes('thai') || q.includes('thailand') || q.includes('bangkok') || q.includes('phuket')) {
        return {
          text: `🛕 <strong>Thailand Discovery (6 Days / 5 Nights)</strong><br>Golden temples of Bangkok, turquoise limestone bays of Phuket & Krabi, vibrant night markets, and island hopping. Starting from <strong>$749</strong> per person.`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Thailand Discovery Package</span>
              <a href="/search?type=product&options%5Bprefix%5D=last&q=Thailand*" class="travel-chatbot-cta-btn">View Thailand Tour</a>
              <a href="https://wa.me/919876543210?text=Hi%2C%20tell%20me%20about%20the%20Thailand%20Discovery%20Tour!" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Book via WhatsApp</a>
            </div>
          `,
          chips: [
            { text: '⛵ Vietnam Tour', query: 'Vietnam' },
            { text: '🏝️ Maldives Paradise', query: 'Maldives' }
          ]
        };
      }

      // 4. Dubai
      if (q.includes('dubai') || q.includes('uae') || q.includes('desert safari') || q.includes('burj')) {
        return {
          text: `✨ <strong>Dubai Getaway (5 Days / 4 Nights)</strong><br>Futuristic skyline luxury, Burj Khalifa observation deck, sunset 4x4 desert dune safari with BBQ dinner, and luxury yacht cruise. Starting from <strong>$899</strong> per person.`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Dubai Luxury Getaway</span>
              <a href="/search?type=product&options%5Bprefix%5D=last&q=Dubai*" class="travel-chatbot-cta-btn">View Dubai Tour</a>
              <a href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20the%20Dubai%20Getaway!" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Book via WhatsApp</a>
            </div>
          `,
          chips: [
            { text: '🌴 Bali Package', query: 'Bali' },
            { text: '🏔️ Swiss Alps', query: 'Swiss Alps' }
          ]
        };
      }

      // 5. Maldives
      if (q.includes('maldives') || q.includes('island') || q.includes('honeymoon') || q.includes('overwater')) {
        return {
          text: `🏝️ <strong>Maldives Overwater Paradise</strong><br>Private villas above azure turquoise waters, world-class coral reef snorkeling, all-inclusive luxury dining, and sunset dolphin cruises. Perfect for romantic getaways & honeymoons!`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Maldives Luxury Collection</span>
              <a href="/search?type=product&options%5Bprefix%5D=last&q=Maldives*" class="travel-chatbot-cta-btn">View Maldives Tours</a>
              <a href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20inquiring%20about%20Maldives%20Honeymoon%20Packages!" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Chat on WhatsApp</a>
            </div>
          `,
          chips: [
            { text: '🌴 Bali Package', query: 'Bali' },
            { text: '🛕 Thailand Package', query: 'Thailand' }
          ]
        };
      }

      // 6. Vietnam
      if (q.includes('vietnam') || q.includes('ha long') || q.includes('hanoi') || q.includes('danang')) {
        return {
          text: `⛵ <strong>Vietnam Heritage & Bays</strong><br>Cruise through emerald waters in Ha Long Bay, stroll lantern-lit alleys in ancient Hoi An, and discover rich cultural heritage & street food delicacies.`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Vietnam Heritage Tour</span>
              <a href="/search?type=product&options%5Bprefix%5D=last&q=Vietnam*" class="travel-chatbot-cta-btn">View Vietnam Tour</a>
              <a href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Vietnam%20Tours!" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Book via WhatsApp</a>
            </div>
          `,
          chips: [
            { text: '🛕 Thailand', query: 'Thailand' },
            { text: '🌴 Bali', query: 'Bali' }
          ]
        };
      }

      // 7. Contact / Phone / WhatsApp / Office
      if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('whatsapp') || q.includes('office') || q.includes('address') || q.includes('email') || q.includes('support')) {
        return {
          text: `📞 <strong>We're Here for You 24/7!</strong><br><br>
            📍 <strong>Office:</strong> 123 Travel Lane, Park Street, Kolkata, WB 700016, India<br>
            📱 <strong>Phone:</strong> +91 98765 43210<br>
            💬 <strong>WhatsApp:</strong> +91 87654 32109<br>
            ✉️ <strong>Email:</strong> hello@tourandtravelwings.com<br>
            🕒 <strong>Hours:</strong> Mon - Fri 9:00 AM - 7:00 PM | Sat - Sun 10:00 AM - 5:00 PM`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Instant Support Options</span>
              <a href="https://wa.me/919876543210" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">💬 Chat on WhatsApp</a>
              <a href="tel:+919876543210" class="travel-chatbot-cta-btn">📞 Call Our Travel Experts</a>
              <a href="/pages/contact" class="travel-chatbot-cta-btn" style="background:#0a2e5c;color:#fff;">Open Contact Page</a>
            </div>
          `,
          chips: [
            { text: '📋 View All Tours', query: 'all packages' },
            { text: '🌴 Bali Package', query: 'Bali' }
          ]
        };
      }

      // 8. All Tours / Packages / Pricing / Offers
      if (q.includes('all') || q.includes('package') || q.includes('tour') || q.includes('price') || q.includes('offer') || q.includes('discount')) {
        return {
          text: `🌍 <strong>Explore All Our Curated Travel Packages!</strong><br>We offer guaranteed best prices, 24/7 on-trip assistance, full visa guidance, and customizable itineraries across Asia, Europe, and tropical island destinations. Enjoy up to <strong>20% OFF</strong> on selected tours!`,
          cta: `
            <div class="travel-chatbot-cta-card">
              <span class="travel-chatbot-cta-card-title">Browse Full Collection</span>
              <a href="/collections/all" class="travel-chatbot-cta-btn">Explore All 10 Packages</a>
              <a href="https://wa.me/919876543210?text=Hi%2C%20can%20you%20help%20me%20choose%20the%20best%20package%3F" target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Get Customized Quote</a>
            </div>
          `,
          chips: [
            { text: '🌴 Bali Escape', query: 'Bali' },
            { text: '🏔️ Swiss Alps', query: 'Swiss Alps' },
            { text: '🛕 Thailand', query: 'Thailand' },
            { text: '✨ Dubai', query: 'Dubai' }
          ]
        };
      }

      // Fallback
      return {
        text: `Thank you for reaching out! ✨ I can help you with travel packages, destination guides, pricing, and hotel bookings. Which destination would you like to explore?`,
        cta: `
          <div class="travel-chatbot-cta-card">
            <span class="travel-chatbot-cta-card-title">Explore Featured Tours</span>
            <a href="/collections/all" class="travel-chatbot-cta-btn">Browse All Tour Packages</a>
            <a href="https://wa.me/919876543210?text=Hello%20Tour%20%26%20Travel%20Wings%2C%20I%20have%20a%20query%20about%20travel%20plans." target="_blank" class="travel-chatbot-cta-btn whatsapp-btn">Chat with Travel Expert</a>
          </div>
        `,
        chips: [
          { text: '🌴 Bali', query: 'Bali' },
          { text: '🏔️ Swiss Alps', query: 'Swiss Alps' },
          { text: '🛕 Thailand', query: 'Thailand' },
          { text: '🏝️ Maldives', query: 'Maldives' },
          { text: '✨ Dubai', query: 'Dubai' },
          { text: '📞 Contact Support', query: 'Contact' }
        ]
      };
    }

    // Process user query
    function handleQuery(rawQuery) {
      const q = (rawQuery || '').trim();
      if (!q) return;

      appendUserMessage(q);
      showTyping();

      const delay = Math.min(600, 300 + Math.random() * 300);
      setTimeout(() => {
        const resp = getBotResponse(q);
        appendBotMessage(resp.text, resp.cta, resp.chips);
      }, delay);
    }

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        input.value = '';
        handleQuery(val);
      }
    });

    // Initial chips click handlers
    body.querySelectorAll('.travel-chatbot-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.dataset.query;
        handleQuery(q);
      });
    });
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();

