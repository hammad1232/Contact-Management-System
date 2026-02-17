# Contact Manager

A comprehensive contact management web app built with HTML, CSS, Bootstrap and vanilla JavaScript.

## Features ✅

### Core Features
- Add, edit, and delete contacts
- Store contact information (name, email, phone, notes)
- Search contacts across all fields
- Data persisted to browser localStorage

### 🏷️ Grouping & Tagging System
- **Create groups** to organize contacts (Family, Friends, Work, etc.)
- **Filter contacts by group** using the dropdown selector
- **Add multiple tags** to each contact for better categorization
- **Search by tags** to quickly find related contacts

### 💾 Import, Export & Backup
- **Export to JSON** - Save all contacts and groups in JSON format
- **Export to CSV** - Export contacts to spreadsheet-compatible CSV file
- **Import from JSON** - Import contacts with merge or replace options
- **Create Backup** - Generate timestamped backup files
- **Restore Backup** - Restore contacts from backup files
- **Clear All Data** - Reset the application (with safety confirmation)

## How to use 🔧

1. Open `index.html` in your browser (double-click or use Live Server)
2. Click **+ Add Contact** to create a new contact
3. Assign contacts to groups and add tags for organization
4. Use the **search bar** to find contacts instantly
5. Filter contacts by **group** using the dropdown
6. Access **Backup & Import** menu in the navbar for data management

### Managing Groups
1. Click **+ Add Contact**
2. In the Group field, click **+ New** to create a new group
3. Enter group name and description
4. Assign contacts to groups when creating or editing

### Adding Tags
1. When creating/editing a contact, enter tags in the Tags field
2. Separate multiple tags with commas
3. Click **Add Tag** to apply
4. Remove tags by clicking the × on each badge

### Backup & Data Management
1. Click **Backup & Import** in the navbar
2. Choose from available options:
   - **Export to JSON/CSV** - Download your data
   - **Import from JSON** - Upload and merge contacts
   - **Create Backup** - Save timestamped backup
   - **Restore Backup** - Load previous backup
   - **Clear All Data** - Reset application

## File Structure 📁
```
├── index.html      # Main HTML structure
├── script.js       # Core functionality (add/edit/delete/search)
├── backup.js       # Import/Export/Backup features
├── styles.css      # Custom styling
└── README.md       # Documentation
```

## Technologies Used 🛠️
- HTML5
- CSS3
- Bootstrap 5.3.2
- Vanilla JavaScript (ES6+)
- LocalStorage API
- File API (for import/export)

## Notes 💡
- No server required; everything runs in the browser
- Data is stored in `localStorage`; clearing browser data will remove contacts
- Backup files are in JSON format and can be edited manually if needed
- CSV exports are compatible with Excel, Google Sheets, and other spreadsheet applications
- Import feature allows merging with existing contacts or replacing all data

## Browser Compatibility 🌐
Works on all modern browsers that support:
- LocalStorage
- File API
- ES6 JavaScript

Enjoy! 🎉
