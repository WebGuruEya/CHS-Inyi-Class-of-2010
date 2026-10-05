const members = [
  { name: 'Eze Anita Ogechi', image: '1 (2).jpg' },
  { name: 'Ugwu Kelvin', image: '1 (3).jpg' },
  { name: 'Stan Kenneth Eke', image: '1 (4).jpg' },
  { name: 'Eke Maureen', image: '1 (5).jpg' },
  { name: 'Eze Christian', image: '1 (6).jpg' },
  { name: 'Asanya Christian Chinedu', image: '1 (7).jpg' },
  { name: 'Chekere Uba', image: '1 (8).jpg' },
  { name: 'Olu Mamah', image: '1 (9).jpg' },
  { name: 'Ojobo Kelvin', image: '1 (10).jpg' },
  { name: 'Eke Amos', image: '1 (11).jpg' },
  { name: 'Christopher Ekene', image: '1 (12).jpg' },
  { name: 'Idoko Brendan', image: '1 (13).jpg' },
  { name: 'Ugwu Stephen', image: '1 (14).jpg' },
  { name: 'Eya Michael', image: '1 (15).jpg' },
  { name: 'Mama Keran', image: '1 (16).jpg' },
  { name: 'Eke Solomon Amandi', image: '1 (17).jpg' },
  { name: 'Onoja Mathin' },
  { name: 'Chinedu Emmanuel' },
  { name: 'Mama Samson' },
  { name: 'Idoko Amos' },
  { name: 'Eya Felicia' },
  { name: 'Odo Emmanuel' },
  { name: 'Onoja Malachi' },
  { name: 'Mama Dorathy' },
  { name: 'Domnic Martina' },
  { name: 'Classmate 26' },
  { name: 'Classmate 27' },
];

const STORAGE_KEY = 'chs-inyi-class-2010-directory-v1';
const THEME_STORAGE_KEY = 'chs-inyi-color-mode';
const MAX_PHOTO_BYTES = 450_000;
const SOCIAL_PROFILES = {
  facebook: { label: 'Facebook', short: 'f', base: 'https://facebook.com/' },
  instagram: { label: 'Instagram', short: 'ig', base: 'https://instagram.com/' },
  linkedin: { label: 'LinkedIn', short: 'in', base: 'https://linkedin.com/in/' },
  x: { label: 'X', short: '𝕏', base: 'https://x.com/' },
  tiktok: { label: 'TikTok', short: 'tt', base: 'https://tiktok.com/@' },
  whatsapp: { label: 'WhatsApp', short: 'wa', base: 'https://wa.me/' },
  youtube: { label: 'YouTube', short: 'yt', base: 'https://youtube.com/@' },
  snapchat: { label: 'Snapchat', short: 'sc', base: 'https://snapchat.com/add/' },
  threads: { label: 'Threads', short: 'th', base: 'https://threads.net/@' },
  website: { label: 'Website / other', short: '↗' },
};
let pendingPhoto = '';

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch (error) {
    console.warn('Could not read the saved color mode.', error);
  }
  return 'dark';
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;
  toggle.setAttribute('aria-pressed', String(isDark));
  toggle.setAttribute('aria-label', `Switch to ${isDark ? 'day' : 'night'} mode`);
  toggle.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
}

setTheme(getInitialTheme());

function loadSavedMembers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!Array.isArray(saved)) return;
    saved.slice(0, members.length).forEach((profile, index) => {
      if (profile && typeof profile === 'object') members[index] = { ...members[index], ...profile };
    });
  } catch (error) {
    console.warn('Could not load saved alumni profiles.', error);
  }
}

loadSavedMembers();

const grid = document.querySelector('#member-grid');
const searchInput = document.querySelector('#search-input');
const resultsCount = document.querySelector('#results-count');
const emptyState = document.querySelector('#empty-state');
const filterButtons = [...document.querySelectorAll('.filter-button')];
const profileDialog = document.querySelector('#profile-dialog');
const profileForm = document.querySelector('#profile-form');
const photoInput = document.querySelector('#profile-photo');
const uploadPreview = document.querySelector('#upload-preview');
const previewImage = document.querySelector('#preview-image');
const formError = document.querySelector('#form-error');
let activeFilter = 'all';

function createMemberCard(member, index) {
  const card = document.createElement('article');
  const hasPhoto = Boolean(member.photoData || member.image);
  card.className = `member-card${hasPhoto ? '' : ' is-needed'}`;
  card.dataset.name = member.name.toLowerCase();

  const photoWrap = document.createElement('div');
  photoWrap.className = `member-photo-wrap${hasPhoto ? '' : ' photo-needed'}`;

  if (hasPhoto) {
    const image = document.createElement('img');
    image.className = 'member-photo';
    image.src = member.photoData || `Img/${encodeURIComponent(member.image)}`;
    image.alt = `${member.name}, Comprehensive High School Inyi Class of 2010`;
    image.loading = 'lazy';
    image.onerror = () => {
      photoWrap.classList.add('photo-needed');
      image.remove();
      addPhotoPlaceholder(photoWrap, index);
      card.classList.add('is-needed');
      updateResults();
    };
    photoWrap.append(image);
    const badge = document.createElement('span');
    badge.className = 'member-badge';
    badge.textContent = 'Class of 2010';
    photoWrap.append(badge);
  } else {
    addPhotoPlaceholder(photoWrap, index);
    const badge = document.createElement('span');
    badge.className = 'member-badge';
    badge.textContent = 'Photo needed';
    photoWrap.append(badge);
  }

  const info = document.createElement('div');
  info.className = 'member-info';
  const number = document.createElement('span');
  number.className = 'member-number';
  number.textContent = `ALUMNI · ${String(index + 1).padStart(2, '0')}`;
  const name = document.createElement('h3');
  name.textContent = member.name;
  const meta = document.createElement('div');
  meta.className = 'member-meta';
  meta.append(createMeta('⌖', member.location || 'Location to be added'));
  meta.append(createMeta('↗', member.occupation || 'Occupation to be added'));
  info.append(number, name, meta, createContactLinks(member));
  const editButton = document.createElement('button');
  editButton.className = 'edit-profile';
  editButton.type = 'button';
  editButton.dataset.editIndex = String(index);
  editButton.innerHTML = 'Edit profile <span aria-hidden="true">↗</span>';
  info.append(editButton);
  card.append(photoWrap, info);
  return card;
}

function addPhotoPlaceholder(container, index) {
  const placeholder = document.createElement('span');
  placeholder.className = 'photo-placeholder';
  placeholder.setAttribute('aria-label', 'Profile photo to be added');
  placeholder.textContent = String(index + 1).padStart(2, '0');
  container.append(placeholder);
}

function createMeta(iconText, text) {
  const row = document.createElement('span');
  const icon = document.createElement('span');
  icon.className = 'meta-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = iconText;
  row.append(icon, document.createTextNode(text));
  return row;
}

function getSocialHref(platform, value) {
  const entry = SOCIAL_PROFILES[platform];
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!entry || !raw) return '';
  try {
    let url;
    if (/^https?:\/\//i.test(raw)) {
      url = new URL(raw);
    } else if (platform === 'website') {
      if (!/^[\w-]+(?:\.[\w-]+)+(?:[/:?#].*)?$/i.test(raw)) return '';
      url = new URL(`https://${raw}`);
    } else if (platform === 'whatsapp') {
      const digits = raw.replace(/\D/g, '');
      if (digits.length < 7) return '';
      url = new URL(`${entry.base}${digits}`);
    } else {
      const handle = raw.replace(/^@/, '').replace(/^\/+|\/+$/g, '');
      if (!handle || /\s/.test(handle)) return '';
      url = new URL(`${entry.base}${encodeURIComponent(handle)}`);
    }
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function createContactLinks(member) {
  const contacts = document.createElement('details');
  contacts.className = 'member-contacts';
  const summary = document.createElement('summary');
  summary.textContent = 'Phone & social media';
  contacts.append(summary);

  const rows = document.createElement('div');
  rows.className = 'contact-detail-list';
  const phoneRow = document.createElement('div');
  phoneRow.className = 'contact-detail';
  const phoneLabel = document.createElement('span');
  phoneLabel.textContent = 'Phone';
  const phoneValue = member.phone ? document.createElement('a') : document.createElement('span');
  phoneValue.className = member.phone ? 'contact-value' : 'contact-value is-missing';
  phoneValue.textContent = member.phone || 'Not added';
  if (member.phone) {
    phoneValue.href = `tel:${member.phone.replace(/[^\d+]/g, '')}`;
    phoneValue.setAttribute('aria-label', `Call ${member.name} at ${member.phone}`);
  }
  phoneRow.append(phoneLabel, phoneValue);
  rows.append(phoneRow);

  Object.entries(SOCIAL_PROFILES).forEach(([platform, entry]) => {
    const value = member.socials?.[platform] || '';
    const href = getSocialHref(platform, value);
    const row = document.createElement('div');
    row.className = 'contact-detail';
    const label = document.createElement('span');
    label.textContent = entry.label;
    const profile = href ? document.createElement('a') : document.createElement('span');
    profile.className = href ? 'contact-value' : 'contact-value is-missing';
    profile.textContent = value || 'Not added';
    if (href) {
      profile.href = href;
      profile.target = '_blank';
      profile.rel = 'noopener noreferrer';
    }
    row.append(label, profile);
    rows.append(row);
  });
  contacts.append(rows);
  return contacts;
}

function updateResults() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  [...grid.children].forEach((card, index) => {
    const member = members[index];
    const hasPhoto = Boolean(member.image || member.photoData) && !card.classList.contains('is-needed');
    const matchesSearch = !query || member.name.toLowerCase().includes(query);
    const matchesFilter = activeFilter === 'all'
      || (activeFilter === 'photo' && hasPhoto)
      || (activeFilter === 'needed' && !hasPhoto);
    const show = matchesSearch && matchesFilter;
    card.hidden = !show;
    if (show) visible += 1;
  });

  resultsCount.textContent = `${visible} ${visible === 1 ? 'classmate' : 'classmates'}`;
  emptyState.hidden = visible !== 0;
}

function renderMembers() {
  grid.replaceChildren(...members.map(createMemberCard));
  document.querySelector('#member-count').textContent = String(members.length);
  document.querySelector('#photo-count').textContent = String(members.filter((member) => member.image || member.photoData).length);
  document.querySelector('[data-filter="all"] span').textContent = String(members.length);
  document.querySelector('[data-filter="photo"] span').textContent = String(members.filter((member) => member.image || member.photoData).length);
  document.querySelector('[data-filter="needed"] span').textContent = String(members.filter((member) => !member.image && !member.photoData).length);
  updateResults();
}

function openProfileEditor(index) {
  const member = members[index];
  if (!member) return;
  profileForm.reset();
  document.querySelector('#profile-id').value = String(index);
  document.querySelector('#profile-name').value = member.name.startsWith('Classmate ') ? '' : member.name;
  document.querySelector('#profile-location').value = member.location || '';
  document.querySelector('#profile-occupation').value = member.occupation || '';
  document.querySelector('#profile-phone').value = member.phone || '';
  document.querySelectorAll('[data-social]').forEach((field) => {
    field.value = member.socials?.[field.dataset.social] || '';
  });
  pendingPhoto = member.photoData || (member.image ? `Img/${encodeURIComponent(member.image)}` : '');
  if (pendingPhoto) {
    previewImage.src = pendingPhoto;
    uploadPreview.hidden = false;
  } else {
    uploadPreview.hidden = true;
    previewImage.removeAttribute('src');
  }
  formError.hidden = true;
  profileDialog.showModal();
}

function persistMembers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

function prepareProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Choose a valid image file.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
      image.onload = () => {
        const maxSide = 800;
        const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        let quality = 0.84;
        let result = canvas.toDataURL('image/jpeg', quality);
        while (result.length * 0.75 > MAX_PHOTO_BYTES && quality > 0.4) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        if (result.length * 0.75 > MAX_PHOTO_BYTES) {
          reject(new Error('This photo is too large. Please choose a smaller image.'));
          return;
        }
        resolve(result);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

grid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-edit-index]');
  if (button) openProfileEditor(Number(button.dataset.editIndex));
});

photoInput.addEventListener('change', async () => {
  const file = photoInput.files[0];
  if (!file) return;
  formError.hidden = true;
  try {
    pendingPhoto = await prepareProfilePhoto(file);
    previewImage.src = pendingPhoto;
    uploadPreview.hidden = false;
  } catch (error) {
    formError.textContent = error.message;
    formError.hidden = false;
    photoInput.value = '';
  }
});

document.querySelector('#remove-photo').addEventListener('click', () => {
  pendingPhoto = '';
  photoInput.value = '';
  previewImage.removeAttribute('src');
  uploadPreview.hidden = true;
});

function closeProfileEditor() {
  profileDialog.close();
}
document.querySelector('.dialog-close').addEventListener('click', closeProfileEditor);
document.querySelector('.cancel-edit').addEventListener('click', closeProfileEditor);

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const index = Number(document.querySelector('#profile-id').value);
  const phone = document.querySelector('#profile-phone').value.trim();
  if (phone && phone.replace(/\D/g, '').length < 7) {
    formError.textContent = 'Enter a valid phone number with at least 7 digits.';
    formError.hidden = false;
    return;
  }
  const socials = {};
  for (const field of document.querySelectorAll('[data-social]')) {
    const platform = field.dataset.social;
    const value = field.value.trim();
    if (value && !getSocialHref(platform, value)) {
      formError.textContent = `Enter a valid ${SOCIAL_PROFILES[platform].label} username or profile URL.`;
      formError.hidden = false;
      field.focus();
      return;
    }
    if (value) socials[platform] = value;
  }
  formError.hidden = true;
  const previous = { ...members[index] };
  members[index] = {
    ...members[index],
    name: document.querySelector('#profile-name').value.trim(),
    location: document.querySelector('#profile-location').value.trim(),
    occupation: document.querySelector('#profile-occupation').value.trim(),
    phone,
    socials,
    photoData: pendingPhoto.startsWith('data:image/') ? pendingPhoto : '',
    image: pendingPhoto.startsWith('data:image/') ? '' : (pendingPhoto.startsWith('Img/') ? members[index].image || '' : ''),
  };
  try {
    persistMembers();
    renderMembers();
    closeProfileEditor();
  } catch (error) {
    members[index] = previous;
    formError.textContent = 'Could not save changes in this browser. Try a smaller photo or clear some browser storage.';
    formError.hidden = false;
  }
});

document.querySelector('#export-updates').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ version: 1, members }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'chs-inyi-class-2010-directory.json';
  link.click();
  URL.revokeObjectURL(url);
});

const importFile = document.querySelector('#import-file');
document.querySelector('#import-updates').addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (imported.version !== 1 || !Array.isArray(imported.members) || imported.members.length !== members.length) {
      throw new Error('This file does not match the class directory format.');
    }
    const updated = imported.members.map((profile, index) => {
      if (!profile || typeof profile.name !== 'string') throw new Error('The update file contains an invalid profile.');
      return {
        ...members[index],
        name: profile.name.slice(0, 80),
        location: typeof profile.location === 'string' ? profile.location.slice(0, 100) : '',
        occupation: typeof profile.occupation === 'string' ? profile.occupation.slice(0, 100) : '',
        phone: typeof profile.phone === 'string' ? profile.phone.slice(0, 30) : '',
        socials: profile.socials && typeof profile.socials === 'object'
          ? Object.fromEntries(Object.entries(profile.socials).filter(([key, value]) => SOCIAL_PROFILES[key] && typeof value === 'string').map(([key, value]) => [key, value.slice(0, 200)]))
          : {},
        image: typeof profile.image === 'string' ? profile.image : '',
        photoData: typeof profile.photoData === 'string' && profile.photoData.startsWith('data:image/') ? profile.photoData : '',
      };
    });
    const oldMembers = members.slice();
    members.splice(0, members.length, ...updated);
    try {
      persistMembers();
      renderMembers();
      window.alert('Directory updates imported successfully in this browser.');
    } catch (error) {
      members.splice(0, members.length, ...oldMembers);
      throw new Error('Could not save those updates in this browser. The photo data may be too large.');
    }
  } catch (error) {
    window.alert(error.message || 'Could not import that directory file.');
  } finally {
    importFile.value = '';
  }
});

renderMembers();
searchInput.addEventListener('input', updateResults);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    updateResults();
  });
});

document.querySelector('.clear-search').addEventListener('click', () => {
  searchInput.value = '';
  activeFilter = 'all';
  filterButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.filter === 'all'));
  updateResults();
  searchInput.focus();
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const themeToggle = document.querySelector('#theme-toggle');
themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (error) {
    console.warn('Could not save the selected color mode.', error);
  }
});

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  mainNav.classList.toggle('is-open', !isOpen);
});
mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  });
});
