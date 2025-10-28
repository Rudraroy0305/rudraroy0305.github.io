/* ===============================
   Global UI scripts for the site
   =============================== */

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

/* ========================================================
   Projects: JSON -> square card grid
   Expects:
   - <div id="projects-list" class="work-grid"></div>
   - assets/data/projects.json
   - Optional image per item: item.img
   ======================================================== */
(async function renderProjects() {
  const container = document.getElementById('projects-list');
  if (!container) return;

  try {
    const res = await fetch('assets/data/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load projects.json');
    const items = await res.json();

    const frag = document.createDocumentFragment();
    items.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';

      // Square visual
      const img = document.createElement('div');
      img.className = 'card__img';
      if (p.img) img.style.backgroundImage = `url('${p.img}')`;

      // Body
      const body = document.createElement('div');
      body.className = 'card__body';

      const title = document.createElement('h3');
      title.className = 'card__title';
      title.textContent = p.title || 'Untitled Project';

      const sub = document.createElement('p');
      sub.className = 'card__subtitle';
      sub.textContent = p.subtitle || '';

      // Optional tags
      if (Array.isArray(p.tags) && p.tags.length) {
        const chips = document.createElement('div');
        chips.className = 'chips';
        p.tags.forEach(t => {
          const c = document.createElement('span');
          c.className = 'chip';
          c.textContent = t;
          chips.appendChild(c);
        });
        body.appendChild(chips);
      }

      const desc = document.createElement('p');
      desc.className = 'card__desc';
      desc.textContent = p.summary || '';

      const actions = document.createElement('p');
      actions.className = 'card__actions';
      if (Array.isArray(p.links)) {
        p.links.forEach((lnk, i) => {
          if (!lnk || !lnk.href) return;
          const a = document.createElement('a');
          a.href = lnk.href;
          a.target = '_blank';
          a.rel = 'noopener';
          a.className = 'btn';
          a.textContent = lnk.label || 'Link';
          if (i) a.style.marginLeft = '8px';
          actions.appendChild(a);
        });
      }

      body.appendChild(title);
      body.appendChild(sub);
      body.appendChild(desc);
      if (actions.childNodes.length) body.appendChild(actions);

      card.appendChild(img);
      card.appendChild(body);
      frag.appendChild(card);
    });

    container.textContent = '';
    container.appendChild(frag);
  } catch (e) {
    container.innerHTML = `
      <article class="card">
        <div class="card__body">
          <h3 class="card__title">Projects unavailable</h3>
          <p class="card__desc muted">Couldn’t load project data right now.</p>
        </div>
      </article>`;
    console.error(e);
  }
})();

/* =====================================================================
   Publications: JSON -> square card grid + modal popup
   Expects:
   - <div id="pubs-list" class="work-grid"></div>
   - Modal markup with IDs: pub-modal, pub-modal-img, pub-modal-title,
     pub-modal-venue, pub-modal-desc, pub-modal-links
   - assets/data/publications.json
   ===================================================================== */
(async function renderPublications() {
  const wrap  = document.getElementById('pubs-list');
  const modal = document.getElementById('pub-modal');
  if (!wrap || !modal) return;

  // Modal nodes
  const img   = document.getElementById('pub-modal-img');
  const title = document.getElementById('pub-modal-title');
  const venue = document.getElementById('pub-modal-venue');
  const desc  = document.getElementById('pub-modal-desc');
  const links = document.getElementById('pub-modal-links');

  // Open/close helpers
  function openModal(data) {
    img.src = data.img || '';
    img.alt = data.title || '';
    title.textContent = data.title || '';
    venue.textContent = data.venue || '';
    desc.textContent  = data.desc || '';
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
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  try {
    const res = await fetch('assets/data/publications.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load publications.json');
    const pubs = await res.json();

    const frag = document.createDocumentFragment();
    pubs.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';

      // Square visual tile (uses CSS aspect-ratio)
      const imgBox = document.createElement('div');
      imgBox.className = 'card__img';
      if (p.img) imgBox.style.backgroundImage = `url('${p.img}')`;

      const body = document.createElement('div');
      body.className = 'card__body';

      const h3 = document.createElement('h3');
      h3.className = 'card__title';
      h3.textContent = p.title || 'Untitled Publication';

      const sub = document.createElement('p');
      sub.className = 'card__subtitle';
      sub.textContent = p.venue || '';

      const brief = document.createElement('p');
      brief.className = 'card__desc';
      brief.textContent = p.desc || '';

      const actions = document.createElement('p');
      actions.className = 'card__actions';

      const viewBtn = document.createElement('a');
      viewBtn.href = 'javascript:void(0)';
      viewBtn.className = 'btn';
      viewBtn.textContent = 'View details';
      viewBtn.addEventListener('click', () => openModal(p));

      const doiBtn = document.createElement('a');
      doiBtn.className = 'btn';
      doiBtn.style.marginLeft = '8px';
      doiBtn.href = p.doi || '#';
      doiBtn.target = '_blank';
      doiBtn.rel = 'noopener';
      doiBtn.textContent = 'DOI';

      actions.appendChild(viewBtn);
      actions.appendChild(doiBtn);

      body.appendChild(h3);
      body.appendChild(sub);
      body.appendChild(brief);
      body.appendChild(actions);

      card.appendChild(imgBox);
      card.appendChild(body);
      frag.appendChild(card);
    });

    wrap.textContent = '';
    wrap.appendChild(frag);
  } catch (e) {
    wrap.innerHTML = `
      <article class="card">
        <div class="card__body">
          <h3 class="card__title">Publications unavailable</h3>
          <p class="card__desc muted">Couldn’t load the list right now.</p>
        </div>
      </article>`;
    console.error(e);
  }
})();
