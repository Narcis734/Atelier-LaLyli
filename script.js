(function() {
  'use strict';

  /* ----- header / menu ----- */
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const setMenuOpen = (isOpen) => menuToggle.setAttribute('aria-expanded', String(isOpen));

  menuToggle.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  header.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  });
  document.addEventListener('pointerdown', (e) => {
    if (!header.contains(e.target)) setMenuOpen(false);
  });

  /* ----- workshop data ----- */
  const workshops = [...document.querySelectorAll('.catalog-card[data-workshop]')].map((card) => ({
    title: card.dataset.workshop,
    minAge: Number(card.dataset.ageMin),
  }));

  /* ----- form ----- */
  const form = document.querySelector('#registration-form');
  const formMessage = form.querySelector('.form-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const dateInput = form.querySelector('#workshop-date');
  const timeInput = form.querySelector('#workshop-time');
  const childrenList = form.querySelector('.children-list');
  const addChildButton = form.querySelector('.add-child');
  const childTemplate = document.querySelector('#child-card-template');
  const phoneInput = form.querySelector('#phone');

  const MAX_CHILDREN = 8;
  const CONTACT_EMAIL = 'iulianapopovici01@gmail.com';
  const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
  const dateFormatter = new Intl.DateTimeFormat('ro-RO', { dateStyle: 'long' });

  const toISODate = (date) =>
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  dateInput.min = toISODate(new Date());

  // --- elimină automat +40 din câmpul de telefon ---
  phoneInput.addEventListener('input', function() {
    let val = this.value.trim();
    if (val.startsWith('+40')) {
      val = val.slice(3); // elimină +40
      // păstrăm doar cifrele rămase
      this.value = val.replace(/\D/g, '').slice(0, 10);
    }
    // dacă utilizatorul a introdus 0040...? nu tratăm, dar putem simplifica
    // de asemenea, dacă a introdus 040...? nu tratăm, dar poate fi adăugat
    // dar cerința a fost doar pentru +40
  });

  const filterWorkshopsByAge = (ageSelect, workshopSelect) => {
    const selectedMinAge = Number(ageSelect.selectedOptions[0]?.dataset.minAge ?? 0);
    for (const option of workshopSelect.options) {
      if (!option.value) continue;
      const workshop = workshops.find((item) => item.title === option.value);
      const isAllowed = !selectedMinAge || (workshop && workshop.minAge <= selectedMinAge);
      option.hidden = !isAllowed;
      option.disabled = !isAllowed;
    }
    if (workshopSelect.selectedOptions[0]?.disabled) workshopSelect.value = '';
  };

  const createChildCard = () => {
    const card = childTemplate.content.firstElementChild.cloneNode(true);
    const ageSelect = card.querySelector('.child-age-field');
    const workshopSelect = card.querySelector('.child-workshop-field');

    workshopSelect.append(
      ...workshops.map((w) => new Option(w.title, w.title))
    );
    ageSelect.addEventListener('change', () =>
      filterWorkshopsByAge(ageSelect, workshopSelect)
    );
    card.querySelector('.remove-child').addEventListener('click', () => {
      card.remove();
      refreshChildCards();
    });
    return card;
  };

  const refreshChildCards = () => {
    const cards = [...childrenList.children];
    cards.forEach((card, index) => {
      card.querySelector('.child-number').textContent = index + 1;
      const removeButton = card.querySelector('.remove-child');
      removeButton.hidden = cards.length === 1;
      removeButton.setAttribute('aria-label', `Șterge copilul ${index + 1}`);
    });
    addChildButton.disabled = cards.length >= MAX_CHILDREN;
  };

  const addChildCard = () => {
    childrenList.append(createChildCard());
    refreshChildCards();
  };

  addChildButton.addEventListener('click', addChildCard);
  addChildCard();

  /* ----- prefill from announcement ----- */
  const nextWorkshopLink = document.querySelector('.announcement a[href="#inscriere"]');
  nextWorkshopLink?.addEventListener('click', () => {
    const { prefillDate = '', prefillTime = '', prefillWorkshop = '' } = nextWorkshopLink.dataset;
    dateInput.value = prefillDate;
    timeInput.value = prefillTime;

    const firstCard = childrenList.firstElementChild;
    const workshop = workshops.find((item) => item.title === prefillWorkshop);
    if (!firstCard || !workshop) return;

    const ageSelect = firstCard.querySelector('.child-age-field');
    const matchingAge = [...ageSelect.options].find(
      (opt) => Number(opt.dataset.minAge) >= workshop.minAge
    );
    if (matchingAge) ageSelect.value = matchingAge.value;

    const workshopSelect = firstCard.querySelector('.child-workshop-field');
    filterWorkshopsByAge(ageSelect, workshopSelect);
    workshopSelect.value = workshop.title;
  });

  /* ----- submit ----- */
  const setMessage = (text, state) => {
    formMessage.textContent = text;
    formMessage.classList.toggle('is-success', state === 'success');
    formMessage.classList.toggle('is-error', state === 'error');
  };

  const collectChildren = () =>
    [...childrenList.children].map((card, index) => ({
      index: index + 1,
      name: card.querySelector('.child-name-field').value.trim(),
      age: card.querySelector('.child-age-field').value,
      workshop: card.querySelector('.child-workshop-field').value,
    }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const parentName = form.elements['parent-name'].value.trim();
    const children = collectChildren();
    const childLines = children.map(
      (c) => `Copil ${c.index}: ${c.name} — ${c.age} — ${c.workshop}`
    );

    const payload = {
      _subject: `Cerere nouă LaLyli — ${children.map((c) => c.workshop).join(', ')}`,
      _template: 'table',
      _captcha: 'false',
      _replyto: form.elements.email.value.trim(),
      _cc: form.elements.email.value.trim(),
      _autoresponse: `Bună ziua, ${parentName}! Îți mulțumim pentru înscrierea la LaLyli. Am primit cererea și revenim cu confirmarea locurilor și adresa exactă.`,
      'Nume părinte': parentName,
      email: form.elements.email.value.trim(),
      Telefon: form.elements.phone.value.trim(),
      'Data dorită': dateFormatter.format(new Date(`${dateInput.value}T12:00:00`)),
      'Ora dorită': timeInput.value,
      Copii: childLines.join('\n'),
    };

    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    setMessage('Se trimite cererea…');

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Serverul a răspuns cu ${response.status}`);

      setMessage(
        'Înscriere reușită! Am trimis cererea și vei primi în curând confirmarea pe e-mail.',
        'success'
      );
      form.reset();
      childrenList.replaceChildren();
      addChildCard();
    } catch (err) {
      console.error('Trimiterea formularului a eșuat:', err);
      setMessage(
        `Nu am putut trimite cererea. Te rugăm să încerci din nou sau să ne scrii direct la ${CONTACT_EMAIL}.`,
        'error'
      );
    } finally {
      submitButton.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });

  /* ----- lightbox ----- */
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightbox-image');
  const lightboxCounter = document.querySelector('#lightbox-counter');
  const zoomButtons = [...document.querySelectorAll('.zoom-button')];
  let currentIndex = 0;

  const showImage = (index) => {
    currentIndex = (index + zoomButtons.length) % zoomButtons.length;
    const image = zoomButtons[currentIndex].querySelector('img');
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCounter.textContent = `${currentIndex + 1} / ${zoomButtons.length}`;
  };

  zoomButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      showImage(index);
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', (e) => {
    showImage(currentIndex - 1);
    e.currentTarget.blur();
  });
  lightbox.querySelector('.lightbox-next').addEventListener('click', (e) => {
    showImage(currentIndex + 1);
    e.currentTarget.blur();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });

  /* ----- reveal on scroll ----- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    }, { threshold: 0.12 }
  );
  document.querySelectorAll('.catalog-card, .step, footer').forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  /* ----- back to top ----- */
  const backToTop = document.querySelector('.back-to-top');
  new IntersectionObserver(
    ([entry]) => backToTop.classList.toggle('show', !entry.isIntersecting), { threshold: 0 }
  ).observe(document.querySelector('.hero'));

  /* ----- nav active state ----- */
  const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const anchor of navAnchors) {
          anchor.classList.toggle(
            'active',
            anchor.getAttribute('href') === `#${entry.target.id}`
          );
        }
      }
    }, { rootMargin: '-35% 0px -55% 0px' }
  );
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
})();
