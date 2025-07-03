/**
 * Folder Manager
 * Handles folder organization and permissions
 */

import { CONSTANTS } from '../config/constants.js';
import { generateId } from './utils.js';

export class FolderManager {
    constructor(storage, ui, eventBus) {
        this.storage = storage;
        this.ui = ui;
        this.eventBus = eventBus;
        
        this.folders = [];
        this.adminAuthenticated = false;
        this.pendingAction = null;
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Admin actions
        this.eventBus.on('admin:manageFolders', () => {
            this.attemptManageFolders();
        });
        
        this.eventBus.on('admin:openOffers', () => {
            this.attemptOpenOffers();
        });
        
        // Folder navigation
        this.eventBus.on('navigate:folder', (folderName) => {
            this.openFolder(folderName);
        });
        
        // Folder CRUD
        this.eventBus.on('folder:create', () => {
            this.showCreateFolderDialog();
        });
        
        this.eventBus.on('folder:edit', (index) => {
            this.showEditFolderDialog(index);
        });
        
        this.eventBus.on('folder:delete', (index) => {
            this.deleteFolder(index);
        });
        
        this.eventBus.on('folder:toggleVisibility', (index) => {
            this.toggleFolderVisibility(index);
        });
    }
    
    /**
     * Initialize with folders data
     */
    initialize(folders) {
        // Ensure default folders exist
        const defaultFolders = [
            { name: 'Offers', special: true, icon: 'offers', available: true }
        ];
        
        // Merge with existing folders
        this.folders = [...defaultFolders];
        
        folders.forEach(folder => {
            if (!this.folders.find(f => f.name === folder.name)) {
                this.folders.push({
                    ...folder,
                    id: folder.id || generateId(),
                    available: folder.available !== false
                });
            }
        });
    }
    
    /**
     * Get all folders
     */
    getAll() {
        return this.folders;
    }
    
    /**
     * Get available folders (visible to users)
     */
    getAvailable() {
        return this.folders.filter(f => f.available !== false);
    }
    
    /**
     * Get folder by name
     */
    getByName(name) {
        return this.folders.find(f => f.name === name);
    }
    
    /**
     * Get folder count
     */
    getCount() {
        return this.folders.filter(f => f.name !== 'Offers').length;
    }
    
    /**
     * Get protected folder count
     */
    getProtectedCount() {
        return this.folders.filter(f => f.protected && f.name !== 'Offers').length;
    }
    
    /**
     * Attempt to manage folders (requires admin auth)
     */
    attemptManageFolders() {
        this.pendingAction = { type: 'manageFolders' };
        this.showAdminPrompt('manage folders');
    }
    
    /**
     * Attempt to open offers (requires admin auth)
     */
    attemptOpenOffers() {
        this.pendingAction = { type: 'openOffers' };
        this.showAdminPrompt('access offer templates');
    }
    
    /**
     * Show admin authentication prompt
     */
    showAdminPrompt(action) {
        this.ui.showModal({
            id: 'adminAuthModal',
            title: 'Admin Access Required',
            description: `Enter the admin password to ${action}.`,
            content: `
                <input type="password" class="input" id="adminPasswordInput" 
                       placeholder="Enter admin password" autofocus>`,
            buttons: [
                { text: 'Unlock', action: 'unlock', variant: 'btn', icon: 'lock' },
                { text: 'Cancel', action: 'cancel', variant: 'btn-secondary' }
            ],
            onAction: (action, modal) => {
                if (action === 'unlock') {
                    const password = modal.querySelector('#adminPasswordInput').value;
                    this.checkAdminPassword(password);
                }
            }
        });
        
        // Auto-submit on correct password
        setTimeout(() => {
            const input = document.getElementById('adminPasswordInput');
            if (input) {
                input.addEventListener('input', (e) => {
                    if (e.target.value === CONSTANTS.ADMIN.PASSWORD) {
                        this.checkAdminPassword(e.target.value);
                    }
                });
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.checkAdminPassword(e.target.value);
                    }
                });
            }
        }, 100);
    }
    
    /**
     * Check admin password
     */
    checkAdminPassword(password) {
        if (password === CONSTANTS.ADMIN.PASSWORD) {
            this.adminAuthenticated = true;
            this.ui.closeModal('adminAuthModal');
            this.ui.showToast('Access granted', 'success');
            
            // Execute pending action
            if (this.pendingAction) {
                if (this.pendingAction.type === 'manageFolders') {
                    this.eventBus.emit('navigate:management');
                } else if (this.pendingAction.type === 'openOffers') {
                    this.openFolder('Offers', true);
                }
                this.pendingAction = null;
            }
        } else {
            this.ui.showToast('Incorrect password', 'error');
            const input = document.getElementById('adminPasswordInput');
            if (input) {
                input.value = '';
                input.focus();
            }
        }
    }
    
    /**
     * Open folder
     */
    openFolder(folderName, authenticated = false) {
        const folder = this.getByName(folderName);
        
        // Check if folder requires authentication
        if (folderName === 'Offers' && !authenticated && !this.adminAuthenticated) {
            this.attemptOpenOffers();
            return;
        }
        
        if (folder && folder.protected && folder.password && !authenticated) {
            this.showFolderPasswordPrompt(folderName);
            return;
        }
        
        // Navigate to folder
        const projects = this.eventBus.emit('projects:getByFolder', folderName);
        this.eventBus.emit('navigate:folderContent', { folderName, projects });
    }
    
    /**
     * Show folder password prompt
     */
    showFolderPasswordPrompt(folderName) {
        const folder = this.getByName(folderName);
        if (!folder) return;
        
        this.ui.showModal({
            id: 'folderPasswordModal',
            title: 'Protected Folder',
            description: 'This folder is password protected. Please enter the password.',
            content: `
                <input type="password" class="input" id="folderPasswordInput" 
                       placeholder="Enter folder password" autofocus>`,
            buttons: [
                { text: 'Unlock', action: 'unlock', variant: 'btn', icon: 'lock' },
                { text: 'Cancel', action: 'cancel', variant: 'btn-secondary' }
            ],
            onAction: (action, modal) => {
                if (action === 'unlock') {
                    const password = modal.querySelector('#folderPasswordInput').value;
                    if (password === folder.password) {
                        this.ui.closeModal('folderPasswordModal');
                        this.ui.showToast('Folder unlocked', 'success');
                        this.openFolder(folderName, true);
                    } else {
                        this.ui.showToast('Incorrect password', 'error');
                        const input = modal.querySelector('#folderPasswordInput');
                        if (input) {
                            input.value = '';
                            input.focus();
                        }
                    }
                }
            }
        });
        
        // Auto-submit on correct password
        setTimeout(() => {
            const input = document.getElementById('folderPasswordInput');
            if (input) {
                input.addEventListener('input', (e) => {
                    if (e.target.value === folder.password) {
                        this.ui.closeModal('folderPasswordModal');
                        this.ui.showToast('Folder unlocked', 'success');
                        this.openFolder(folderName, true);
                    }
                });
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const password = e.target.value;
                        if (password === folder.password) {
                            this.ui.closeModal('folderPasswordModal');
                            this.ui.showToast('Folder unlocked', 'success');
                            this.openFolder(folderName, true);
                        } else {
                            this.ui.showToast('Incorrect password', 'error');
                            e.target.value = '';
                        }
                    }
                });
            }
        }, 100);
    }
    
    /**
     * Show create folder dialog
     */
    showCreateFolderDialog() {
        this.showFolderDialog();
    }
    
    /**
     * Show edit folder dialog
     */
    showEditFolderDialog(index) {
        const folder = this.folders[index];
        if (!folder || folder.special) return;
        
        this.showFolderDialog(folder, index);
    }
    
    /**
     * Show folder dialog (create/edit)
     */
    showFolderDialog(folder = null, index = null) {
        const isEdit = folder !== null;
        
        this.ui.showModal({
            id: 'folderModal',
            title: isEdit ? 'Edit Folder' : 'Create New Folder',
            description: isEdit ? 'Update folder settings.' : 'Create secure folders for your team.',
            content: `
                <div class="input-group">
                    <label class="input-label">Folder Name</label>
                    <input type="text" class="input" id="folderNameInput" 
                           placeholder="Enter folder name" 
                           value="${folder ? folder.name : ''}"
                           ${isEdit ? 'readonly' : ''}>
                </div>
                
                <label class="checkbox-wrapper">
                    <input type="checkbox" class="checkbox" id="folderProtected"
                           ${folder && folder.protected ? 'checked' : ''}>
                    <span>Password protect this folder</span>
                </label>
                
                <div class="input-group" id="passwordGroup" style="display: ${folder && folder.protected ? 'block' : 'none'};">
                    <label class="input-label">Password</label>
                    <input type="password" class="input" id="folderPasswordInput" 
                           placeholder="Enter password">
                    ${isEdit ? '<p class="input-hint">Leave empty to keep current password</p>' : ''}
                </div>`,
            buttons: [
                { text: isEdit ? 'Update' : 'Create', action: 'save', variant: 'btn' },
                { text: 'Cancel', action: 'cancel', variant: 'btn-secondary' }
            ],
            onAction: async (action, modal) => {
                if (action === 'save') {
                    const name = modal.querySelector('#folderNameInput').value.trim();
                    const isProtected = modal.querySelector('#folderProtected').checked;
                    const password = modal.querySelector('#folderPasswordInput').value;
                    
                    if (!name) {
                        this.ui.showToast('Please enter a folder name', 'error');
                        return;
                    }
                    
                    if (name.length > CONSTANTS.FOLDER.MAX_NAME_LENGTH) {
                        this.ui.showToast(`Name must be less than ${CONSTANTS.FOLDER.MAX_NAME_LENGTH} characters`, 'error');
                        return;
                    }
                    
                    if (isProtected && !isEdit && !password) {
                        this.ui.showToast('Please enter a password', 'error');
                        return;
                    }
                    
                    if (isProtected && password && password.length < CONSTANTS.FOLDER.MIN_PASSWORD_LENGTH) {
                        this.ui.showToast(`Password must be at least ${CONSTANTS.FOLDER.MIN_PASSWORD_LENGTH} characters`, 'error');
                        return;
                    }
                    
                    // Check for duplicate names (only for new folders)
                    if (!isEdit && this.folders.find(f => f.name.toLowerCase() === name.toLowerCase())) {
                        this.ui.showToast('A folder with this name already exists', 'error');
                        return;
                    }
                    
                    this.ui.closeModal('folderModal');
                    
                    if (isEdit) {
                        await this.updateFolder(index, { isProtected, password });
                    } else {
                        await this.createFolder({ name, isProtected, password });
                    }
                }
            }
        });
        
        // Setup checkbox toggle
        setTimeout(() => {
            const checkbox = document.getElementById('folderProtected');
            const passwordGroup = document.getElementById('passwordGroup');
            
            if (checkbox && passwordGroup) {
                checkbox.addEventListener('change', (e) => {
                    passwordGroup.style.display = e.target.checked ? 'block' : 'none';
                    if (e.target.checked) {
                        document.getElementById('folderPasswordInput')?.focus();
                    }
                });
            }
            
            // Focus on name input
            if (!isEdit) {
                document.getElementById('folderNameInput')?.focus();
            }
        }, 100);
    }
    
    /**
     * Create folder
     */
    async createFolder(data) {
        const folder = {
            id: generateId(),
            name: data.name,
            protected: data.isProtected,
            password: data.isProtected ? data.password : null,
            available: true,
            createdAt: new Date().toISOString()
        };
        
        this.folders.push(folder);
        
        await this.saveData();
        
        this.ui.showToast('Folder created!', 'success');
        this.eventBus.emit('folder:created', folder);
    }
    
    /**
     * Update folder
     */
    async updateFolder(index, data) {
        const folder = this.folders[index];
        if (!folder || folder.special) return;
        
        // Update folder data
        folder.protected = data.isProtected;
        
        if (data.isProtected) {
            if (data.password) {
                folder.password = data.password;
            }
            // If no new password provided, keep the old one
        } else {
            delete folder.password;
        }
        
        await this.saveData();
        
        this.ui.showToast('Folder updated!', 'success');
        this.eventBus.emit('folder:updated', folder);
    }
    
    /**
     * Delete folder
     */
    async deleteFolder(index) {
        const folder = this.folders[index];
        if (!folder || folder.special) return;
        
        // Count projects in folder
        const projectCount = this.eventBus.emit('projects:countInFolder', folder.name);
        
        let message = `Delete folder "${folder.name}"?`;
        if (projectCount > 0) {
            message += `\n\nThis will move ${projectCount} project${projectCount !== 1 ? 's' : ''} to Unassigned.`;
        }
        
        const confirmed = confirm(message);
        if (!confirmed) return;
        
        // Move projects to unassigned
        if (projectCount > 0) {
            this.eventBus.emit('projects:moveToUnassigned', folder.name);
        }
        
        // Remove folder
        this.folders.splice(index, 1);
        
        await this.saveData();
        
        this.ui.showToast('Folder deleted!', 'success');
        this.eventBus.emit('folder:deleted');
    }
    
    /**
     * Toggle folder visibility
     */
    async toggleFolderVisibility(index) {
        const folder = this.folders[index];
        if (!folder || folder.special) return;
        
        folder.available = folder.available === false ? true : false;
        
        await this.saveData();
        
        this.ui.showToast(
            folder.available ? 'Folder is now visible' : 'Folder is now hidden',
            'success'
        );
        
        this.eventBus.emit('folder:visibilityChanged', folder);
    }
    
    /**
     * Save data
     */
    async saveData() {
        this.eventBus.emit('data:save');
    }
}