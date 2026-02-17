// Import/Export and Backup Module for Contact Management System

// Export contacts to JSON file
function exportContactsToJSON() {
  try {
    const dataToExport = {
      contacts: contacts,
      groups: groups,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_export_${getFormattedDate()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('Contacts exported successfully!', 'success');
  } catch (error) {
    showAlert('Failed to export contacts. Please try again.', 'danger');
    console.error('Export error:', error);
  }
}

// Export contacts to CSV file
function exportContactsToCSV() {
  try {
    // CSV Header
    let csv = 'Name,Email,Phone,Group,Tags,Notes\n';
    
    // Add each contact as a row
    contacts.forEach(contact => {
      const groupObj = groups.find(g => g.id === contact.group);
      const groupName = groupObj ? groupObj.name : '';
      const tags = (contact.tags || []).join('; ');
      
      // Escape CSV values properly
      const row = [
        escapeCsvValue(contact.name),
        escapeCsvValue(contact.email),
        escapeCsvValue(contact.phone || ''),
        escapeCsvValue(groupName),
        escapeCsvValue(tags),
        escapeCsvValue(contact.notes || '')
      ].join(',');
      
      csv += row + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_export_${getFormattedDate()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('Contacts exported to CSV successfully!', 'success');
  } catch (error) {
    showAlert('Failed to export to CSV. Please try again.', 'danger');
    console.error('CSV export error:', error);
  }
}

// Escape CSV values to handle commas, quotes, and newlines
function escapeCsvValue(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

// Import contacts from JSON file
function importContactsFromJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      
      // Validate imported data structure
      if (!importedData.contacts || !Array.isArray(importedData.contacts)) {
        showAlert('Invalid file format. Please select a valid contacts backup file.', 'danger');
        return;
      }
      
      // Ask user if they want to merge or replace
      const shouldMerge = confirm(
        `Import ${importedData.contacts.length} contacts?\n\n` +
        `Click OK to MERGE with existing contacts.\n` +
        `Click Cancel to REPLACE all contacts.`
      );
      
      if (shouldMerge) {
        // Merge contacts - avoid duplicates by checking email
        let addedCount = 0;
        importedData.contacts.forEach(newContact => {
          const exists = contacts.some(c => c.email === newContact.email);
          if (!exists) {
            // Generate new ID to avoid conflicts
            newContact.id = generateId();
            contacts.push(newContact);
            addedCount++;
          }
        });
        
        // Merge groups
        if (importedData.groups && Array.isArray(importedData.groups)) {
          importedData.groups.forEach(newGroup => {
            const exists = groups.some(g => g.name === newGroup.name);
            if (!exists) {
              newGroup.id = generateId();
              groups.push(newGroup);
            }
          });
        }
        
        showAlert(`${addedCount} new contacts imported and merged!`, 'success');
      } else {
        // Replace all contacts
        contacts = importedData.contacts.map(c => {
          c.id = generateId(); // Regenerate IDs
          return c;
        });
        
        if (importedData.groups && Array.isArray(importedData.groups)) {
          groups = importedData.groups.map(g => {
            g.id = generateId(); // Regenerate IDs
            return g;
          });
        }
        
        showAlert(`${contacts.length} contacts imported successfully!`, 'success');
      }
      
      saveContacts();
      saveGroups();
      renderContactsAndGroups();
      updateGroupSelect();
      
    } catch (error) {
      showAlert('Failed to import contacts. Please check the file format.', 'danger');
      console.error('Import error:', error);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

// Create backup with timestamp
function createBackup() {
  try {
    const backupData = {
      contacts: contacts,
      groups: groups,
      backupDate: new Date().toISOString(),
      contactCount: contacts.length,
      groupCount: groups.length,
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_backup_${getFormattedDateTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert(`Backup created: ${contacts.length} contacts, ${groups.length} groups`, 'success');
  } catch (error) {
    showAlert('Failed to create backup. Please try again.', 'danger');
    console.error('Backup error:', error);
  }
}

// Restore from backup file
function restoreFromBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!confirm('Restoring from backup will replace ALL current data. Are you sure?')) {
    event.target.value = '';
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const backupData = JSON.parse(e.target.result);
      
      // Validate backup data
      if (!backupData.contacts || !Array.isArray(backupData.contacts)) {
        showAlert('Invalid backup file format.', 'danger');
        return;
      }
      
      // Restore contacts and groups
      contacts = backupData.contacts;
      groups = backupData.groups || [];
      
      saveContacts();
      saveGroups();
      renderContactsAndGroups();
      updateGroupSelect();
      
      const backupDate = backupData.backupDate ? new Date(backupData.backupDate).toLocaleString() : 'Unknown';
      showAlert(`Backup restored! ${contacts.length} contacts from ${backupDate}`, 'success');
      
    } catch (error) {
      showAlert('Failed to restore backup. Please check the file.', 'danger');
      console.error('Restore error:', error);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  reader.readAsText(file);
}

// Clear all data (with confirmation)
function clearAllData() {
  if (!confirm('⚠️ WARNING: This will delete ALL contacts and groups permanently!\n\nThis action cannot be undone. Are you absolutely sure?')) {
    return;
  }
  
  // Double confirmation for safety
  const confirmText = prompt('Type "DELETE ALL" to confirm deletion:');
  if (confirmText !== 'DELETE ALL') {
    showAlert('Deletion cancelled.', 'info');
    return;
  }
  
  contacts = [];
  groups = [];
  saveContacts();
  saveGroups();
  renderContactsAndGroups();
  updateGroupSelect();
  
  showAlert('All data has been deleted.', 'warning');
}

// Get formatted date for filenames (YYYY-MM-DD)
function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get formatted date and time for filenames (YYYY-MM-DD_HH-MM-SS)
function getFormattedDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Initialize backup/import event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Export buttons
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', exportContactsToJSON);
  }
  
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportContactsToCSV);
  }
  
  // Import input
  const importFileInput = document.getElementById('importFileInput');
  if (importFileInput) {
    importFileInput.addEventListener('change', importContactsFromJSON);
  }
  
  // Backup buttons
  const backupBtn = document.getElementById('backupBtn');
  if (backupBtn) {
    backupBtn.addEventListener('click', createBackup);
  }
  
  const restoreFileInput = document.getElementById('restoreFileInput');
  if (restoreFileInput) {
    restoreFileInput.addEventListener('change', restoreFromBackup);
  }
  
  // Clear data button
  const clearDataBtn = document.getElementById('clearDataBtn');
  if (clearDataBtn) {
    clearDataBtn.addEventListener('click', clearAllData);
  }
});
