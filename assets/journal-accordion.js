document.addEventListener("DOMContentLoaded", () => {
  const accordions = document.querySelectorAll('.journal-accordion-wrapper');

  accordions.forEach(accordion => {
    const items = accordion.querySelectorAll('.journal-item');
    
    if (items.length === 0) return;

    // Initialize first item as active
    items[0].classList.add('active');

    items.forEach(item => {
      // Add hover interaction for desktop
      item.addEventListener('mouseenter', () => {
        if (window.innerWidth > 767) {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      });

      // Add click interaction for mobile and touch devices
      item.addEventListener('click', () => {
        if (!item.classList.contains('active')) {
          items.forEach(i => i.classList.remove('active'));
          item.classList.add('active');
        }
      });
    });
  });
});
