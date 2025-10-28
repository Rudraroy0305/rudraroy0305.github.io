// Inject header/footer partials, set active link, and footer year
(async function loadPartials() {
  async function inject(sel, url) {
    const host = document.querySelector(sel);
    if (!host) return;
    const res = await fetch(url, { cache: "no-store" });
    host.innerHTML = await res.text();
  }

  await Promise.all([
    inject('[data-include="header"]', '/partials/header.html'),
    inject('[data-include="footer"]', '/partials/footer.html'),
  ]);

  // After injection: set active nav item
  const path = location.pathname.replace(/\/+$/, '') || '/index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '/' && href.endsWith('index.html'))) {
      a.classList.add('active');
    }
  });

  // Footer year
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();
