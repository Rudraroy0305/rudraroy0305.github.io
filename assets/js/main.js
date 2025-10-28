// ------------ Footer year ------------
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
});

// ------------ Active nav highlight on scroll ------------
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

// ========================================================
// Projects: render from JSON (assets/data/projects.json)
// ========================================================
(async function renderProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;

  try {
    const res = await fetch('assets/data/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load projects.json');
    const projects = await res.json();

    const frag = document.createDocumentFragment();
    projects.forEach((p) => {
      const card = document.createElement('article');

      const h3 = document.createElement('h3');
      h3.textContent = p.title || 'Untitled Project';

      const sub = document.createElement('p');
      sub.className = 'muted';
      sub.textContent = p.subtitle || '';

      const sum = document.createElement('p');
      sum.textContent = p.summary || '';

      card.appendChild(h3);
      card.appendChild(sub);
      card.appendChild(sum);

      if (Array.isArray(p.links) && p.links.length) {
        const linksWrap = document.createElement('p');
        p.links.forEach((lnk, i) => {
          if (!lnk || !lnk.href) return;
          const a = document.createElement('a');
          a.href = lnk.href;
          a.textContent = lnk.label || 'Link';
          a.target = '_blank';
          a.rel = 'noopener';
          a.style.textDecoration = 'none';
          a.className = 'btn';
          if (i) a.style.marginLeft = '8px';
          linksWrap.appendChild(a);
        });
        card.appendChild(linksWrap);
      }

      frag.appendChild(card);
    });

    container.textContent = '';
    container.appendChild(frag);
  } catch (err) {
    container.innerHTML = `<article><h3>Projects unavailable</h3><p class="muted">Couldn’t load project data right now. Please refresh.</p></article>`;
    console.error(err);
  }
})();

// =====================================================================
// Publications: render from JSON + modal (assets/data/publications.json)
// =====================================================================
(async function renderPublications() {
  const wrap = document.getElementById('pubs-list');
  const modal = document.getElementById('pub-modal');
  if (!wrap || !modal) return;

  // Modal nodes
  const img = document.getElementById('pub-modal-img');
  const title = document.getElementById('pub-modal-title');
  const venue = document.getElementById('pub-modal-venue');
  const desc = document.getElementById('pub-modal-desc');
  const links = document.getElementById('pub-modal-links');

  // Open/close helpers
  function openModal(data) {
    img.src = data.img || '';
    img.alt = data.title || '';
    title.textContent = data.title || '';
    venue.textContent = data.venue || '';
    desc.textContent = data.desc || '';
    links.innerHTML = `
      <a class="btn" href="${data.doi || '#'}" target="_blank" rel="noopener">DOI</a>
      <a class="btn" href="${data.scholar || '#'}" target="_blank" rel="noopener">Google Scholar</a>
    `;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  modal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]') || e.target.classList.contains('modal__backdrop')) {
      closeModal();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  try {
    const res = await fetch('assets/data/publications.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load publications.json');
    const pubs = await res.json();

    const frag = document.createDocumentFragment();
    pubs.forEach((p) => {
      const card = document.createElement('article');

      // Thumb
      const thumb = document.createElement('img');
      thumb.src = p.img || '';
      thumb.alt = p.title || '';
      Object.assign(thumb.style, {
        width: '100%',
        height: '140px',
        objectFit: 'cover',
        borderRadius: '10px',
        border: '1px solid #eee',
        marginBottom: '8px'
      });

      const h3 = document.createElement('h3');
      h3.textContent = p.title || 'Untitled Publication';

      const sub = document.createElement('p');
      sub.className = 'muted';
      sub.textContent = p.venue || '';

      const brief = document.createElement('p');
      brief.textContent = p.desc || '';

      const actions = document.createElement('p');
      const openBtn = document.createElement('a');
      openBtn.href = 'javascript:void(0)';
      openBtn.className = 'btn';
      openBtn.textContent = 'View details';
      openBtn.addEventListener('click', () => openModal(p));

      const doiBtn = document.createElement('a');
      doiBtn.className = 'btn';
      doiBtn.style.marginLeft = '8px';
      doiBtn.href = p.doi || '#';
      doiBtn.target = '_blank';
      doiBtn.rel = 'noopener';
      doiBtn.textContent = 'DOI';

      actions.appendChild(openBtn);
      actions.appendChild(doiBtn);

      card.appendChild(thumb);
      card.appendChild(h3);
      card.appendChild(sub);
      card.appendChild(brief);
      card.appendChild(actions);

      frag.appendChild(card);
    });

    wrap.textContent = '';
    wrap.appendChild(frag);
  } catch (err) {
    wrap.innerHTML = `<article><h3>Publications unavailable</h3><p class="muted">Couldn’t load the list right now.</p></article>`;
    console.error(err);
  }
})();
