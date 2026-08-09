const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', isOpen);
  menuToggle.textContent = isOpen ? '×' : '☰';
});
document.querySelectorAll('.nav-links a').forEach((link) => link.addEventListener('click', () => {
  navLinks.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰';
}));
const emailLabel = document.querySelector('label[for="email"]');
const childNameLabel = document.createElement('label');
childNameLabel.htmlFor = 'child-name';
childNameLabel.textContent = 'Numele copilului';
const childNameInput = document.createElement('input');
childNameInput.id = 'child-name';
childNameInput.type = 'text';
childNameInput.placeholder = 'Numele copilului';
childNameInput.required = true;
const phoneLabel = document.createElement('label');
phoneLabel.htmlFor = 'phone';
phoneLabel.textContent = 'Număr de telefon';
const phoneInput = document.createElement('input');
phoneInput.id = 'phone';
phoneInput.type = 'tel';
phoneInput.placeholder = '07xx xxx xxx';
phoneInput.inputMode = 'numeric';
phoneInput.minLength = 10;
phoneInput.maxLength = 10;
phoneInput.pattern = '07[0-9]{8}';
phoneInput.title = 'Introdu un număr de telefon mobil din România, format din exact 10 cifre și început cu 07.';
phoneInput.required = true;
phoneInput.addEventListener('input', () => {
  // Păstrează doar cifrele și limitează numărul la 10 caractere.
  phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
});
emailLabel.textContent = 'Adresă de e-mail';
const emailInput = document.querySelector('#email');
emailInput.type = 'email';
emailInput.placeholder = 'exemplu@email.com';
const dateLabel = document.createElement('label');
dateLabel.htmlFor = 'workshop-date';
dateLabel.textContent = 'Data dorită';
const dateInput = document.createElement('input');
dateInput.id = 'workshop-date';
dateInput.type = 'date';
dateInput.required = true;
dateInput.min = new Date().toISOString().split('T')[0];
const timeLabel = document.createElement('label');
timeLabel.htmlFor = 'workshop-time';
timeLabel.textContent = 'Ora dorită';
const timeInput = document.createElement('select');
timeInput.id = 'workshop-time';
timeInput.setAttribute('aria-label', 'Ora dorită');
timeInput.required = true;
timeInput.innerHTML = '<option value="">Alege ora</option>';
for (let hour = 8; hour <= 18; hour += 1) {
  for (let minute = 0; minute < 60; minute += 30) {
    if (hour === 18 && minute > 0) break;
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    timeInput.add(new Option(value, value));
  }
}
const childrenLabel = document.createElement('label');
childrenLabel.htmlFor = 'children-count';
childrenLabel.textContent = 'Număr copii';
const childrenInput = document.createElement('input');
childrenInput.id = 'children-count';
childrenInput.type = 'number';
childrenInput.min = '1';
childrenInput.max = '8';
childrenInput.value = '1';
childrenInput.required = true;
emailLabel.before(childNameLabel, childNameInput, phoneLabel, phoneInput, dateLabel, dateInput, childrenLabel, childrenInput);

document.querySelector('#registration-form').addEventListener('submit', (event) => {
  event.preventDefault();
  return;
  const name = document.querySelector('#parent-name').value.trim();
  const childName = document.querySelector('#child-name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const phone = document.querySelector('#phone').value.trim();
  const workshopDate = document.querySelector('#workshop-date').value;
  const childrenCount = document.querySelector('#children-count').value;
  const formattedDate = new Date(`${workshopDate}T12:00:00`).toLocaleDateString('ro-RO');
  const workshop = document.querySelector('#workshop').value;
  const childAge = document.querySelector('#child-age').value;
  const subject = `Cerere înscriere LaLyli — ${workshop}`;
  const body = [
    'Bună ziua,',
    '',
    'Doresc să înscriu copilul la un atelier LaLyli.',
    '',
    `Nume părinte: ${name}`,
    `Nume copil: ${childName}`,
    `E-mail: ${email}`,
    `Telefon: ${phone}`,
    `Data dorită: ${formattedDate}`,
    `Număr copii: ${childrenCount}`,
    `Atelier dorit: ${workshop}`,
    `Vârsta copilului: ${childAge || 'Nespecificată'}`,
    '',
    'Vă rog să reveniți cu detaliile disponibile.',
    '',
    'Mesaj trimis prin site-ul LaLyli.'
  ].join('\n');
  window.location.href = `mailto:iulianapopovici01@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const workshopSelect = document.querySelector('#workshop');
const childAgeSelect = document.querySelector('#child-age');
const workshopRanges = {
  'Unicornul fermecat': [7, 10],
  'Căluții veseli': [10, 13],
  'Girafa veselă': [7, 12],
  'Girafa poznasă': [5, 10],
  'Mașinuța Fulger': [5, 10],
  'Căpșunica veselă': [5, 7],
  'Coșul fermecat cu fructe': [7, 10],
  'Platoul cu fructe de vară': [10, 13],
  'Căsuța zânelor': [7, 10],
  'Panda cu inimă': [5, 10],
  'Ursuleț cu fustiță': [5, 10],
  'Coșulețul cu bucurii': [5, 10]
};
workshopSelect.required = true;
const filterWorkshopsByAge = () => {
  const ageRange = childAgeSelect.value.match(/\d+/g)?.map(Number);
  const selectedMinimumAge = ageRange ? ageRange[0] : null;
  [...workshopSelect.options].forEach((option) => {
    if (!option.value) { option.hidden = false; option.disabled = false; return; }
    const range = workshopRanges[option.textContent];
    const isAllowed = !selectedMinimumAge || (range && range[0] <= selectedMinimumAge);
    option.hidden = !isAllowed;
    option.disabled = !isAllowed;
  });
  const selectedOption = workshopSelect.options[workshopSelect.selectedIndex];
  if (selectedOption?.disabled) workshopSelect.value = '';
};
childAgeSelect.addEventListener('change', filterWorkshopsByAge);
filterWorkshopsByAge();

// Înscriere pentru frați: datele părintelui se completează o singură dată.
const form = document.querySelector('#registration-form');
const removedWorkshop = [...workshopSelect.options].find((option) => option.textContent.trim() === 'Coșulețul cu bucurii');
removedWorkshop?.remove();
['Unicornul fermecat', 'Căluții veseli', 'Girafa veselă', 'Girafa poznasă', 'Mașinuța Fulger'].forEach((label) => workshopSelect.add(new Option(label, label)));
const oldWorkshopOptions = [...workshopSelect.options].filter((option) => option.value).map((option) => ({ value: option.value, label: option.textContent }));
const childrenField = document.createElement('fieldset');
childrenField.className = 'children-field';
childrenField.innerHTML = '<legend>Copiii înscriși</legend><p class="children-help">Adaugă fiecare copil o singură dată. Data atelierului și datele de contact rămân comune.</p><div class="children-list"></div>';
const childrenList = childrenField.querySelector('.children-list');
const addChildButton = document.createElement('button');
addChildButton.type = 'button';
addChildButton.className = 'add-child';
addChildButton.textContent = '+ Adaugă încă un copil';
childrenField.append(addChildButton);

[childNameLabel, childNameInput, childrenLabel, childrenInput].forEach((element) => element.remove());
document.querySelector('label[for="workshop"]').remove();
workshopSelect.remove();
document.querySelector('label[for="child-age"]').remove();
childAgeSelect.remove();
phoneLabel.before(childrenField);
emailLabel.before(timeLabel, timeInput);

const ageOptions = ['5–7 ani', '7–10 ani', '10–13 ani'];
const createChildCard = () => {
  const card = document.createElement('div');
  card.className = 'child-card';
  card.innerHTML = '<div class="child-card-heading"><strong>Copil <span class="child-number"></span></strong><button type="button" class="remove-child" aria-label="Șterge copilul">Șterge</button></div>';
  const nameLabel = document.createElement('label'); nameLabel.textContent = 'Numele copilului';
  const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'child-name-field'; nameInput.placeholder = 'Numele copilului'; nameInput.required = true;
  const ageLabel = document.createElement('label'); ageLabel.textContent = 'Vârsta';
  const ageSelect = document.createElement('select'); ageSelect.className = 'child-age-field'; ageSelect.required = true;
  ageSelect.innerHTML = '<option value="">Alege vârsta</option>' + ageOptions.map((age) => `<option>${age}</option>`).join('');
  const workshopLabel = document.createElement('label'); workshopLabel.textContent = 'Atelierul dorit';
  const childWorkshop = document.createElement('select'); childWorkshop.className = 'child-workshop-field'; childWorkshop.required = true;
  childWorkshop.innerHTML = '<option value="">Alege un atelier</option>' + oldWorkshopOptions.map((option) => `<option value="${option.value}">${option.label}</option>`).join('');
  card.append(nameLabel, nameInput, ageLabel, ageSelect, workshopLabel, childWorkshop);
  const updateOptions = () => {
    const ageRange = ageSelect.value.match(/\d+/g)?.map(Number);
    const selectedMinimumAge = ageRange ? ageRange[0] : null;
    [...childWorkshop.options].forEach((option) => {
      if (!option.value) { option.hidden = false; option.disabled = false; return; }
      const range = workshopRanges[option.textContent];
      option.hidden = Boolean(selectedMinimumAge && (!range || range[0] > selectedMinimumAge));
      option.disabled = option.hidden;
    });
    if (childWorkshop.options[childWorkshop.selectedIndex]?.disabled) childWorkshop.value = '';
  };
  ageSelect.addEventListener('change', updateOptions);
  card.querySelector('.remove-child').addEventListener('click', () => { card.remove(); refreshChildCards(); });
  card._updateOptions = updateOptions;
  return card;
};
const refreshChildCards = () => {
  [...childrenList.children].forEach((card, index) => {
    card.querySelector('.child-number').textContent = index + 1;
    card.querySelector('.remove-child').hidden = index === 0;
  });
};
const addChildCard = () => { childrenList.append(createChildCard()); refreshChildCards(); };
addChildButton.addEventListener('click', addChildCard);
addChildCard();

// Rezervarea din anunț precompletează atelierul, data și ora următorului atelier.
const nextWorkshopLink = document.querySelector('.announcement a[href="#inscriere"]');
nextWorkshopLink?.addEventListener('click', () => {
  dateInput.value = nextWorkshopLink.dataset.date || '';
  timeInput.value = nextWorkshopLink.dataset.time || '';
  const firstWorkshop = childrenList.querySelector('.child-workshop-field');
  const requestedWorkshop = nextWorkshopLink.dataset.workshop;
  if (firstWorkshop && requestedWorkshop) {
    const matchingOption = [...firstWorkshop.options].find((option) => option.textContent.trim() === requestedWorkshop);
    if (matchingOption) firstWorkshop.value = matchingOption.value;
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  return;
  const parentName = document.querySelector('#parent-name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const phone = document.querySelector('#phone').value.trim();
  const workshopDate = document.querySelector('#workshop-date').value;
  const workshopTime = document.querySelector('#workshop-time').value;
  const formattedDate = new Date(`${workshopDate}T12:00:00`).toLocaleDateString('ro-RO');
  const children = [...childrenList.querySelectorAll('.child-card')].map((card, index) => ({
    index: index + 1,
    name: card.querySelector('.child-name-field').value.trim(),
    age: card.querySelector('.child-age-field').value,
    workshop: card.querySelector('.child-workshop-field').value
  }));
  const subject = `Cerere înscriere LaLyli — ${children.map((child) => child.workshop).join(', ')}`;
  const childLines = children.map((child) => `Copil ${child.index}: ${child.name} — ${child.age} — ${child.workshop}`);
  const body = [`Bună ziua, ${parentName}!`, '', 'Îți mulțumim pentru înscrierea la atelierele LaLyli.', 'Am primit cererea ta și vom reveni în curând cu confirmarea locurilor și adresa exactă.', '', 'DETALIILE CERERII', `Data dorită: ${formattedDate}`, `Ora dorită: ${workshopTime}`, `E-mail: ${email}`, `Telefon: ${phone}`, '', ...childLines, '', 'Te așteptăm cu drag să transformăm imaginația în amintiri frumoase!', '', 'Mesaj trimis prin site-ul LaLyli.'].join('\n');
  window.location.href = `mailto:iulianapopovici01@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const formMessage = document.querySelector('.form-message');
const mailRelayFrame = document.createElement('iframe');
mailRelayFrame.name = 'formsubmit-relay';
mailRelayFrame.title = 'Trimitere formular';
mailRelayFrame.hidden = true;
document.body.append(mailRelayFrame);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const parentName = document.querySelector('#parent-name').value.trim();
  const email = document.querySelector('#email').value.trim();
  const phone = document.querySelector('#phone').value.trim();
  const workshopDate = document.querySelector('#workshop-date').value;
  const workshopTime = document.querySelector('#workshop-time').value;
  const formattedDate = new Date(`${workshopDate}T12:00:00`).toLocaleDateString('ro-RO');
  const children = [...childrenList.querySelectorAll('.child-card')].map((card, index) => ({
    index: index + 1,
    name: card.querySelector('.child-name-field').value.trim(),
    age: card.querySelector('.child-age-field').value,
    workshop: card.querySelector('.child-workshop-field').value
  }));
  const childLines = children.map((child) => `Copil ${child.index}: ${child.name} — ${child.age} — ${child.workshop}`);
  const relay = document.createElement('form');
  relay.action = 'https://formsubmit.co/iulianapopovici01@gmail.com';
  relay.method = 'POST';
  relay.target = 'formsubmit-relay';
  relay.hidden = true;
  const fields = {
    _subject: `Cerere nouă LaLyli — ${children.map((child) => child.workshop).join(', ')}`,
    _template: 'table',
    _captcha: 'false',
    _replyto: email,
    _cc: email,
    email,
    'Nume părinte': parentName,
    Telefon: phone,
    'Data dorită': formattedDate,
    'Ora dorită': workshopTime,
    Copii: childLines.join('\n')
  };
  Object.entries(fields).forEach(([name, value]) => { const input = document.createElement('input'); input.type = 'hidden'; input.name = name; input.value = value; relay.append(input); });
  const responseMessage = `Bună ziua, ${parentName}! Îți mulțumim pentru înscrierea la LaLyli. Am primit cererea și revenim cu confirmarea locurilor și adresa exactă.`;
  const autoResponse = document.createElement('input'); autoResponse.type = 'hidden'; autoResponse.name = '_autoresponse'; autoResponse.value = responseMessage; relay.append(autoResponse);
  document.body.append(relay);
  relay.submit();
  formMessage.textContent = 'Înscriere reușită! Am trimis cererea și vei primi în curând confirmarea pe e-mail.';
  formMessage.classList.add('success-message');
  setTimeout(() => relay.remove(), 1500);
});

const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCounter = document.querySelector('#lightbox-counter');
const zoomItems = [...document.querySelectorAll('.logo-frame.zoomable, .catalog-card.zoomable')];
let currentImageIndex = 0;
const showImage = (index) => {
  currentImageIndex = (index + zoomItems.length) % zoomItems.length;
  const image = zoomItems[currentImageIndex].querySelector('img');
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCounter.textContent = `${currentImageIndex + 1} / ${zoomItems.length}`;
};
const openLightbox = (index) => {
  showImage(index);
  lightbox.classList.add('visible');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
};
const closeLightbox = () => {
  lightbox.classList.remove('visible');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
};
zoomItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
  item.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(index); }
  });
});
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentImageIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentImageIndex + 1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('visible')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showImage(currentImageIndex - 1);
  if (event.key === 'ArrowRight') showImage(currentImageIndex + 1);
});

const backToTop = document.querySelector('.back-to-top');
const revealItems = document.querySelectorAll('.workshop-card, footer');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
}, { threshold: 0.12 });
revealItems.forEach((item) => { item.classList.add('reveal'); observer.observe(item); });
window.addEventListener('scroll', () => backToTop.classList.toggle('show', window.scrollY > 500), { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const sections = [...document.querySelectorAll('main section[id]')];
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach((anchor) => anchor.classList.toggle('active', anchor.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => sectionObserver.observe(section));
