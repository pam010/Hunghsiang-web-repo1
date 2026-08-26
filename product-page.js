document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  const setMenuOpen = open => {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.classList.toggle('hidden', !open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    const icon = menuButton.querySelector('[data-menu-icon]');
    if (icon) icon.textContent = open ? '×' : '☰';
  };

  menuButton?.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
    setMenuOpen(false);
    menuButton.focus();
  });

  document.querySelectorAll('[data-machine-carousel]').forEach(carousel => {
    const slides = [...carousel.querySelectorAll('[data-machine-slide]')];
    const previousButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const label = carousel.querySelector('[data-carousel-label]');
    const count = carousel.querySelector('[data-carousel-count]');
    let activeIndex = 0;

    const showSlide = index => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle('hidden', !active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      if (label) label.textContent = slides[activeIndex]?.dataset.label || '';
      if (count) count.textContent = `${activeIndex + 1} / ${slides.length}`;
    };

    previousButton?.addEventListener('click', () => showSlide(activeIndex - 1));
    nextButton?.addEventListener('click', () => showSlide(activeIndex + 1));

    carousel.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
      if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
      if (event.key === 'Home') showSlide(0);
      if (event.key === 'End') showSlide(slides.length - 1);
    });

    showSlide(0);
  });

});
