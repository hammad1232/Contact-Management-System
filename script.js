const storageKey = 'contacts_app_contacts_v1';
const groupsStorageKey = 'contacts_app_groups_v1';
let contacts = [];
let groups = [];
let currentTags = [];

document.addEventListener('DOMContentLoaded', () => {
  loadContacts();
  loadGroups();
  renderContactsAndGroups();

  document.getElementById('contactForm').addEventListener('submit', onFormSubmit);
  document.getElementById('addContactBtn').addEventListener('click', openAddModal);
  document.getElementById('searchInput').addEventListener('input', renderContactsAndGroups);
  document.getElementById('groupFilter').addEventListener('change', renderContactsAndGroups);
  document.getElementById('saveGroupBtn').addEventListener('click', onSaveGroup);
  document.getElementById('addTagBtn').addEventListener('click', addTagToForm);
  
  updateGroupSelect();
});

// Load contacts from localStorage
function loadContacts() {
  const raw = localStorage.getItem(storageKey);
  contacts = raw ? JSON.parse(raw) : [];
}

// Load groups from localStorage
function loadGroups() {
  const raw = localStorage.getItem(groupsStorageKey);
  groups = raw ? JSON.parse(raw) : [];
}

// Save contacts to localStorage
function saveContacts() {
  localStorage.setItem(storageKey, JSON.stringify(contacts));
}

// Save groups to localStorage
function saveGroups() {
  localStorage.setItem(groupsStorageKey, JSON.stringify(groups));
}

// Update group select dropdown
function updateGroupSelect() {
  const groupSelects = document.querySelectorAll('#group, #groupFilter');
  groupSelects.forEach(select => {
    const currentValue = select.value;
    const options = select.querySelectorAll('option[data-group="true"]');
    options.forEach(opt => opt.remove());
    
    groups.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      opt.setAttribute('data-group', 'true');
      select.appendChild(opt);
    });
  });
}

// Render contacts based on search and group filter
function renderContactsAndGroups() {
  const tbody = document.getElementById('contactsList');
  tbody.innerHTML = '';
  
  const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
  const groupFilterId = document.getElementById('groupFilter').value;
  
  let filtered = contacts.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery) ||
      (c.email || '').toLowerCase().includes(searchQuery) ||
      (c.phone || '').toLowerCase().includes(searchQuery) ||
      (c.notes || '').toLowerCase().includes(searchQuery) ||
      (c.tags || []).some(tag => tag.toLowerCase().includes(searchQuery));
    
    const matchesGroup = !groupFilterId || c.group === groupFilterId;
    
    return matchesSearch && matchesGroup;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No contacts found</td></tr>';
    return;
  }

  filtered.forEach(c => {
    const groupObj = groups.find(g => g.id === c.group);
    const groupName = groupObj ? groupObj.name : '—';
    const tagsHtml = (c.tags || []).length > 0 
      ? c.tags.map(tag => `<span class="badge bg-info">${escapeHtml(tag)}</span>`).join(' ')
      : '—';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone || '')}</td>
      <td>${escapeHtml(groupName)}</td>
      <td>${tagsHtml}</td>
      <td>${escapeHtml(c.notes || '')}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="startEdit('${c.id}')">Edit</button>
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

// Add tag to form display
function addTagToForm() {
  const input = document.getElementById('tagInput');
  const tags = input.value.split(',').map(t => t.trim()).filter(t => t && !currentTags.includes(t));
  currentTags = [...new Set([...currentTags, ...tags])];
  input.value = '';
  renderTagsList();
}

// Render tags display in form
function renderTagsList() {
  const tagsList = document.getElementById('tagsList');
  tagsList.innerHTML = '';
  
  currentTags.forEach(tag => {
    const badge = document.createElement('span');
    badge.className = 'badge bg-secondary me-2 mb-2';
    badge.innerHTML = `${escapeHtml(tag)} <button type="button" class="btn-close btn-close-white ms-1" onclick="removeTag('${tag}')"></button>`;
    tagsList.appendChild(badge);
  });
}

// Remove tag from form display
function removeTag(tag) {
  currentTags = currentTags.filter(t => t !== tag);
  renderTagsList();
}

// Handle form submission
function onFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('contactId').value;
  const contact = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    group: document.getElementById('group').value.trim() || null,
    tags: currentTags,
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
  currentTags = [];
  renderTagsList();
  const modalEl = document.getElementById('contactModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
  renderContactsAndGroups();
}

// Start editing a contact
function startEdit(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  
  document.getElementById('contactId').value = c.id;
  document.getElementById('name').value = c.name;
  document.getElementById('email').value = c.email;
  document.getElementById('phone').value = c.phone || '';
  document.getElementById('group').value = c.group || '';
  document.getElementById('notes').value = c.notes || '';
  currentTags = [...(c.tags || [])];
  renderTagsList();
  
  document.querySelector('#contactModal .modal-title').textContent = 'Edit Contact';
  const modal = new bootstrap.Modal(document.getElementById('contactModal'));
  modal.show();
}

// Delete a contact
function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  contacts = contacts.filter(c => c.id !== id);
  saveContacts();
  renderContactsAndGroups();
  showAlert('Contact deleted.', 'warning');
}

// Open add contact modal
function openAddModal() {
  document.getElementById('contactForm').reset();
  document.getElementById('contactId').value = '';
  currentTags = [];
  renderTagsList();
  document.querySelector('#contactModal .modal-title').textContent = 'Add Contact';
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

// Save a new group
function onSaveGroup() {
  const name = document.getElementById('groupName').value.trim();
  const description = document.getElementById('groupDescription').value.trim();
  
  if (!name) {
    showAlert('Group name is required.', 'danger');
    return;
  }
  
  const newGroup = {
    id: generateId(),
    name: name,
    description: description
  };
  
  groups.push(newGroup);
  saveGroups();
  updateGroupSelect();
  showAlert('Group created.', 'success');
  
  document.getElementById('groupName').value = '';
  document.getElementById('groupDescription').value = '';
  
  const modal = bootstrap.Modal.getInstance(document.getElementById('groupModal'));
  if (modal) modal.hide();
}

// Show alert notification
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