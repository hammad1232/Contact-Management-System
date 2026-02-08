const storageKey = 'contacts_app_contacts_v1';
let contacts = [];

document.addEventListener('DOMContentLoaded', () => {
  loadContacts();
  renderContacts();

  document.getElementById('contactForm').addEventListener('submit', onFormSubmit);
  document.getElementById('addContactBtn').addEventListener('click', openAddModal);
  document.getElementById('searchInput').addEventListener('input', renderContacts);
});

function loadContacts() {
  const raw = localStorage.getItem(storageKey);
  contacts = raw ? JSON.parse(raw) : [];
}

function saveContacts() {
  localStorage.setItem(storageKey, JSON.stringify(contacts));
}

function renderContacts() {
  const tbody = document.getElementById('contactsList');
  tbody.innerHTML = '';
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const filtered = contacts.filter(c => {
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No contacts yet</td></tr>';
    return;
  }

  filtered.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone || '')}</td>
      <td>${escapeHtml(c.notes || '')}</td>
      <td>
        <button class="btn btn-sm btn-primary me-2" onclick="startEdit('${c.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteContact('${c.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Basic HTML escape
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function onFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('contactId').value;
  const contact = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    notes: document.getElementById('notes').value.trim()
  };

  if (!contact.name || !contact.email) {
    showAlert('Name and email are required.', 'danger');
    return;
  }

  if (id) {
    const idx = contacts.findIndex(c => c.id === id);
    if (idx > -1) {
      contacts[idx] = { id, ...contact };
      saveContacts();
      showAlert('Contact updated.', 'success');
    }
  } else {
    contact.id = generateId();
    contacts.push(contact);
    saveContacts();
    showAlert('Contact added.', 'success');
  }

  document.getElementById('contactForm').reset();
  const modalEl = document.getElementById('contactModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
  renderContacts();
}

function startEdit(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  document.getElementById('contactId').value = c.id;
  document.getElementById('name').value = c.name;
  document.getElementById('email').value = c.email;
  document.getElementById('phone').value = c.phone || '';
  document.getElementById('notes').value = c.notes || '';
  document.querySelector('#contactModal .modal-title').textContent = 'Edit Contact';
  const modal = new bootstrap.Modal(document.getElementById('contactModal'));
  modal.show();
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  contacts = contacts.filter(c => c.id !== id);
  saveContacts();
  renderContacts();
  showAlert('Contact deleted.', 'warning');
}

function openAddModal() {
  document.getElementById('contactForm').reset();
  document.getElementById('contactId').value = '';
  document.querySelector('#contactModal .modal-title').textContent = 'Add Contact';
}

function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

function showAlert(message, type = 'success', timeout = 2500) {
  const placeholder = document.getElementById('alertPlaceholder');
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-fade" role="alert">
      ${escapeHtml(message)}
    </div>
  `;
  placeholder.appendChild(wrapper);
  setTimeout(() => {
    wrapper.classList.add('fade');
    try { wrapper.remove(); } catch (e) {}
  }, timeout);
}