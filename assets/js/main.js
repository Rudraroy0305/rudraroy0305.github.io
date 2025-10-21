// Footer year
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
});

// Active nav highlight on scroll
(() => {
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const OFFSET = 120; // header height + padding

  function setActive() {
    let current = sections[0]?.id;
    for (const sec of sections) {
      const top = sec.getBoundingClientRect().top;
      if (top - OFFSET <= 0) current = sec.id;
    }
    navLinks.forEach(a => {
      const isActive = a.getAttribute('href') === '#' + current;
      a.classList.toggle('active', isActive);
    });
  }

  window.addEventListener('load', setActive);
  window.addEventListener('scroll', setActive, { passive: true });
})();
