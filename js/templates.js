/**
 * Template Manager
 * Handles template system including placeholder templates and offers
 */

import { 
    placeholderTemplates, 
    getRandomPlaceholderTemplate,
    getRandomTemplateByCategory,
    getTemplateCategories,
    getCategoryDisplayNames
} from '../templates/placeholder-templates.js';

export class TemplateManager {
    constructor() {
        this.placeholderTemplates = placeholderTemplates;
        this.customTemplates = new Map();
        this.categories = getTemplateCategories();
        this.categoryNames = getCategoryDisplayNames();
    }
    
    /**
     * Get random template from all categories
     */
    getRandomTemplate() {
        const template = getRandomPlaceholderTemplate();
        
        return {
            id: `${template.category}:${template.name}`,
            name: template.name,
            category: template.category,
            html: template.html,
            type: 'placeholder'
        };
    }
    
    /**
     * Get random template from specific category
     */
    getRandomTemplateFromCategory(category) {
        const template = getRandomTemplateByCategory(category);
        
        if (!template) return null;
        
        return {
            id: `${template.category}:${template.name}`,
            name: template.name,
            category: template.category,
            html: template.html,
            type: 'placeholder'
        };
    }
    
    /**
     * Get template by ID
     */
    getTemplateById(templateId) {
        // Check if it's a blank template
        if (templateId === 'blank') {
            return {
                id: 'blank',
                name: 'Blank Page',
                html: '',
                type: 'blank'
            };
        }
        
        // Check if it's an offer template
        if (templateId.startsWith('offer-')) {
            const index = parseInt(templateId.replace('offer-', ''));
            const offer = window.app?.offers?.getByIndex(index);
            
            if (offer) {
                return {
                    id: templateId,
                    name: offer.name,
                    html: offer.html,
                    type: 'offer'
                };
            }
        }
        
        // Check if it's a placeholder template
        if (templateId.includes(':')) {
            const [category, name] = templateId.split(':');
            const templates = this.placeholderTemplates[category];
            
            if (templates) {
                const template = templates.find(t => t.name === name);
                if (template) {
                    return {
                        id: templateId,
                        name: template.name,
                        category: category,
                        html: template.html,
                        type: 'placeholder'
                    };
                }
            }
        }
        
        // Check custom templates
        if (this.customTemplates.has(templateId)) {
            return this.customTemplates.get(templateId);
        }
        
        return null;
    }
    
    /**
     * Get all template categories
     */
    getCategories() {
        return this.categories.map(category => ({
            id: category,
            name: this.categoryNames[category] || category,
            count: this.placeholderTemplates[category]?.length || 0
        }));
    }
    
    /**
     * Get templates by category
     */
    getTemplatesByCategory(category) {
        const templates = this.placeholderTemplates[category];
        
        if (!templates) return [];
        
        return templates.map(template => ({
            id: `${category}:${template.name}`,
            name: template.name,
            category: category,
            html: template.html,
            type: 'placeholder'
        }));
    }
    
    /**
     * Get available templates for selection
     */
    getAvailableTemplates() {
        const templates = [];
        
        // Add offer templates from the offers manager
        if (window.app && window.app.offers) {
            const offerTemplates = window.app.offers.getTemplatesForSelection();
            templates.push(...offerTemplates);
        }
        
        return templates;
    }
    
    /**
     * Add custom template
     */
    addCustomTemplate(template) {
        if (!template.id) {
            template.id = `custom-${Date.now()}`;
        }
        
        this.customTemplates.set(template.id, {
            ...template,
            type: 'custom'
        });
        
        return template.id;
    }
    
    /**
     * Remove custom template
     */
    removeCustomTemplate(templateId) {
        return this.customTemplates.delete(templateId);
    }
    
    /**
     * Get all placeholder templates organized by category
     */
    getAllPlaceholderTemplates() {
        const result = {};
        
        this.categories.forEach(category => {
            result[category] = {
                name: this.categoryNames[category],
                templates: this.getTemplatesByCategory(category)
            };
        });
        
        return result;
    }
    
    /**
     * Preview template
     */
    previewTemplate(templateId) {
        const template = this.getTemplateById(templateId);
        
        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }
        
        // Create preview window
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(template.html || '<h1>Blank Page</h1>');
            previewWindow.document.close();
        } else {
            console.error('Failed to open preview window');
        }
    }
    
    /**
     * Generate template thumbnail (returns data URL)
     */
    async generateTemplateThumbnail(templateId, width = 300, height = 200) {
        const template = this.getTemplateById(templateId);
        
        if (!template) return null;
        
        try {
            // Create an iframe to render the template
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.left = '-9999px';
            iframe.style.width = `${width}px`;
            iframe.style.height = `${height}px`;
            document.body.appendChild(iframe);
            
            // Write template HTML to iframe
            iframe.contentDocument.write(template.html || '<h1>Blank Page</h1>');
            iframe.contentDocument.close();
            
            // Wait for content to load
            await new Promise(resolve => {
                iframe.onload = resolve;
                setTimeout(resolve, 1000); // Fallback timeout
            });
            
            // Create canvas and draw iframe content
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Note: This won't work due to browser security restrictions
            // This is just a placeholder for the concept
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(template.name, width / 2, height / 2);
            
            // Clean up
            document.body.removeChild(iframe);
            
            return canvas.toDataURL();
            
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            return null;
        }
    }
    
    /**
     * Export template
     */
    exportTemplate(templateId) {
        const template = this.getTemplateById(templateId);
        
        if (!template) {
            console.error('Template not found:', templateId);
            return;
        }
        
        const data = {
            name: template.name,
            category: template.category,
            html: template.html,
            type: template.type,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-template.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import template
     */
    async importTemplate(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.name || !data.html) {
                        throw new Error('Invalid template format');
                    }
                    
                    const templateId = this.addCustomTemplate({
                        name: data.name,
                        category: data.category || 'custom',
                        html: data.html
                    });
                    
                    resolve(templateId);
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
     * Get template statistics
     */
    getStatistics() {
        const stats = {
            totalTemplates: 0,
            byCategory: {},
            byType: {
                placeholder: 0,
                custom: this.customTemplates.size,
                offer: 0
            }
        };
        
        // Count placeholder templates
        this.categories.forEach(category => {
            const count = this.placeholderTemplates[category]?.length || 0;
            stats.byCategory[category] = count;
            stats.totalTemplates += count;
            stats.byType.placeholder += count;
        });
        
        // Add custom templates
        stats.totalTemplates += this.customTemplates.size;
        
        // Add offer templates if available
        if (window.app && window.app.offers) {
            const offerCount = window.app.offers.getAvailableCount();
            stats.byType.offer = offerCount;
            stats.totalTemplates += offerCount;
        }
        
        return stats;
    }
    
    /**
     * Search templates
     */
    searchTemplates(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        // Search placeholder templates
        this.categories.forEach(category => {
            const templates = this.placeholderTemplates[category] || [];
            
            templates.forEach(template => {
                if (template.name.toLowerCase().includes(searchTerm) ||
                    category.toLowerCase().includes(searchTerm)) {
                    results.push({
                        id: `${category}:${template.name}`,
                        name: template.name,
                        category: category,
                        categoryName: this.categoryNames[category],
                        type: 'placeholder'
                    });
                }
            });
        });
        
        // Search custom templates
        this.customTemplates.forEach((template, id) => {
            if (template.name.toLowerCase().includes(searchTerm)) {
                results.push({
                    id: id,
                    name: template.name,
                    category: template.category || 'custom',
                    type: 'custom'
                });
            }
        });
        
        return results;
    }
}