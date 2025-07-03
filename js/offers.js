/**
 * Offer Manager
 * Handles offer templates management
 */

import { CONSTANTS } from '../config/constants.js';
import { generateId } from './utils.js';

export class OfferManager {
    constructor(storage, ui, eventBus) {
        this.storage = storage;
        this.ui = ui;
        this.eventBus = eventBus;
        
        this.offers = [];
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Offer CRUD
        this.eventBus.on('offer:create', () => {
            this.showCreateOfferDialog();
        });
        
        this.eventBus.on('offer:edit', (index) => {
            this.showEditOfferDialog(index);
        });
        
        this.eventBus.on('offer:delete', (index) => {
            this.deleteOffer(index);
        });
        
        this.eventBus.on('offer:toggleVisibility', (index) => {
            this.toggleOfferVisibility(index);
        });
    }
    
    /**
     * Initialize with offers data
     */
    initialize(offers) {
        this.offers = offers.map(offer => ({
            ...offer,
            id: offer.id || generateId(),
            available: offer.available !== false,
            createdAt: offer.createdAt || new Date().toISOString()
        }));
    }
    
    /**
     * Get all offers
     */
    getAll() {
        return this.offers;
    }
    
    /**
     * Get available offers (visible to users)
     */
    getAvailable() {
        return this.offers.filter(offer => offer.available !== false);
    }
    
    /**
     * Get offer by ID
     */
    getById(id) {
        return this.offers.find(offer => offer.id === id);
    }
    
    /**
     * Get offer by index
     */
    getByIndex(index) {
        return this.offers[index];
    }
    
    /**
     * Get offer count
     */
    getCount() {
        return this.offers.length;
    }
    
    /**
     * Get available offer count
     */
    getAvailableCount() {
        return this.offers.filter(offer => offer.available !== false).length;
    }
    
    /**
     * Show create offer dialog
     */
    showCreateOfferDialog() {
        this.showOfferDialog();
    }
    
    /**
     * Show edit offer dialog
     */
    showEditOfferDialog(index) {
        const offer = this.offers[index];
        if (!offer) return;
        
        this.showOfferDialog(offer, index);
    }
    
    /**
     * Show offer dialog (create/edit)
     */
    showOfferDialog(offer = null, index = null) {
        const isEdit = offer !== null;
        
        this.ui.showModal({
            id: 'offerModal',
            title: isEdit ? 'Edit Offer Template' : 'Create Offer Template',
            description: isEdit ? 'Update your template.' : 'Save your page as a reusable template.',
            content: `
                <div class="input-group">
                    <label class="input-label">Template Name</label>
                    <input type="text" class="input" id="offerNameInput" 
                           placeholder="Enter template name" 
                           value="${offer ? offer.name : ''}"
                           maxlength="${CONSTANTS.UI.MAX_NAME_LENGTH}">
                    <p class="input-hint">Give your template a descriptive name</p>
                </div>
                
                <div class="input-group">
                    <label class="input-label">HTML Code</label>
                    <textarea class="input" id="offerHtmlInput" 
                              placeholder="Paste your HTML code here..." 
                              style="min-height: 300px; font-family: var(--font-mono); font-size: 0.875rem;"
                              spellcheck="false">${offer ? offer.html : ''}</textarea>
                    <p class="input-hint">Paste the complete HTML code for your page</p>
                </div>
                
                <div class="input-group">
                    <label class="checkbox-wrapper">
                        <input type="checkbox" class="checkbox" id="validateHtml" checked>
                        <span>Validate HTML before saving</span>
                    </label>
                </div>`,
            buttons: [
                { text: isEdit ? 'Update' : 'Create', action: 'save', variant: 'btn' },
                { text: 'Cancel', action: 'cancel', variant: 'btn-secondary' }
            ],
            onAction: async (action, modal) => {
                if (action === 'save') {
                    const name = modal.querySelector('#offerNameInput').value.trim();
                    const html = modal.querySelector('#offerHtmlInput').value.trim();
                    const shouldValidate = modal.querySelector('#validateHtml').checked;
                    
                    // Validate inputs
                    if (!name) {
                        this.ui.showToast('Please enter a template name', 'error');
                        return;
                    }
                    
                    if (!html) {
                        this.ui.showToast('Please enter HTML code', 'error');
                        return;
                    }
                    
                    if (html.length < CONSTANTS.VALIDATION.HTML_MIN_LENGTH) {
                        this.ui.showToast('HTML code seems too short', 'error');
                        return;
                    }
                    
                    if (html.length > CONSTANTS.VALIDATION.HTML_MAX_LENGTH) {
                        this.ui.showToast('HTML code is too large (max 1MB)', 'error');
                        return;
                    }
                    
                    // Basic HTML validation
                    if (shouldValidate && !this.validateHtml(html)) {
                        const proceed = confirm('The HTML might have issues. Save anyway?');
                        if (!proceed) return;
                    }
                    
                    // Check for duplicate names (only for new offers)
                    if (!isEdit && this.offers.find(o => o.name.toLowerCase() === name.toLowerCase())) {
                        this.ui.showToast('A template with this name already exists', 'error');
                        return;
                    }
                    
                    this.ui.closeModal('offerModal');
                    
                    if (isEdit) {
                        await this.updateOffer(index, { name, html });
                    } else {
                        await this.createOffer({ name, html });
                    }
                }
            }
        });
        
        // Focus on name input after modal opens
        setTimeout(() => {
            const nameInput = document.getElementById('offerNameInput');
            if (nameInput && !isEdit) {
                nameInput.focus();
            }
        }, 100);
    }
    
    /**
     * Validate HTML
     */
    validateHtml(html) {
        try {
            // Check if it contains basic HTML structure
            const hasDoctype = html.toLowerCase().includes('<!doctype') || html.toLowerCase().includes('<html');
            const hasBody = html.toLowerCase().includes('<body');
            const hasClosingTags = html.includes('</html>') || html.includes('</body>');
            
            // Check for script injection attempts
            const scriptPattern = /<script[^>]*>[\s\S]*?<\/script>/gi;
            const hasScripts = scriptPattern.test(html);
            
            // Basic validation
            if (!hasDoctype && !hasBody) {
                console.warn('HTML missing basic structure');
                return false;
            }
            
            if (!hasClosingTags) {
                console.warn('HTML missing closing tags');
                return false;
            }
            
            // Parse HTML to check for major errors
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const parserErrors = doc.querySelector('parsererror');
            
            if (parserErrors) {
                console.warn('HTML parsing errors found');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('HTML validation error:', error);
            return false;
        }
    }
    
    /**
     * Create offer
     */
    async createOffer(data) {
        const offer = {
            id: generateId(),
            name: data.name,
            html: data.html,
            type: 'Custom Offer',
            available: true,
            createdAt: new Date().toISOString()
        };
        
        this.offers.push(offer);
        
        await this.saveData();
        
        this.ui.showToast('Template created!', 'success');
        this.eventBus.emit('offer:created', offer);
    }
    
    /**
     * Update offer
     */
    async updateOffer(index, data) {
        const offer = this.offers[index];
        if (!offer) return;
        
        // Update offer data
        offer.name = data.name;
        offer.html = data.html;
        offer.updatedAt = new Date().toISOString();
        
        await this.saveData();
        
        this.ui.showToast('Template updated!', 'success');
        this.eventBus.emit('offer:updated', offer);
    }
    
    /**
     * Delete offer
     */
    async deleteOffer(index) {
        const offer = this.offers[index];
        if (!offer) return;
        
        const confirmed = confirm(`Delete template "${offer.name}"?\n\nThis action cannot be undone.`);
        if (!confirmed) return;
        
        // Remove offer
        this.offers.splice(index, 1);
        
        await this.saveData();
        
        this.ui.showToast('Template deleted!', 'success');
        this.eventBus.emit('offer:deleted');
    }
    
    /**
     * Toggle offer visibility
     */
    async toggleOfferVisibility(index) {
        const offer = this.offers[index];
        if (!offer) return;
        
        offer.available = offer.available === false ? true : false;
        
        await this.saveData();
        
        this.ui.showToast(
            offer.available ? 'Template is now visible' : 'Template is now hidden',
            'success'
        );
        
        this.eventBus.emit('offer:visibilityChanged', offer);
    }
    
    /**
     * Import offer from file
     */
    async importOffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const content = e.target.result;
                    
                    // Detect if it's JSON or HTML
                    if (file.name.endsWith('.json')) {
                        const data = JSON.parse(content);
                        
                        if (data.name && data.html) {
                            await this.createOffer({
                                name: data.name,
                                html: data.html
                            });
                            resolve();
                        } else {
                            reject(new Error('Invalid JSON format'));
                        }
                    } else {
                        // HTML file
                        const name = file.name.replace(/\.(html?|htm)$/i, '');
                        
                        await this.createOffer({
                            name: name,
                            html: content
                        });
                        resolve();
                    }
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Export offer
     */
    exportOffer(index) {
        const offer = this.offers[index];
        if (!offer) return;
        
        const data = {
            name: offer.name,
            html: offer.html,
            type: offer.type,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${offer.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-template.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.ui.showToast('Template exported!', 'success');
    }
    
    /**
     * Preview offer
     */
    previewOffer(index) {
        const offer = this.offers[index];
        if (!offer) return;
        
        // Create preview window
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(offer.html);
            previewWindow.document.close();
        } else {
            this.ui.showToast('Failed to open preview (popup blocked)', 'error');
        }
    }
    
    /**
     * Get offers for template selection
     */
    getTemplatesForSelection() {
        return this.getAvailable().map((offer, index) => ({
            id: `offer-${index}`,
            name: offer.name,
            type: 'offer',
            index: index
        }));
    }
    
    /**
     * Save data
     */
    async saveData() {
        this.eventBus.emit('data:save');
    }
}