/**
 * Project Manager
 * Handles all project-related operations
 */

import { CONSTANTS } from '../config/constants.js';
import { generateProjectName, validateProjectName, cleanUrl, generateId } from './utils.js';

export class ProjectManager {
    constructor(apiClient, storage, ui, templates, eventBus) {
        this.api = apiClient;
        this.storage = storage;
        this.ui = ui;
        this.templates = templates;
        this.eventBus = eventBus;
        
        this.projects = [];
        this.selectedProject = null;
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Project selection
        this.eventBus.on('project:selected', (projectId) => {
            this.selectProject(projectId);
        });
        
        // Quick deploy
        this.eventBus.on('project:quickDeploy', (folderName) => {
            this.quickDeploy(folderName);
        });
        
        // Refresh projects
        this.eventBus.on('projects:refresh', () => {
            this.refresh();
        });
        
        // Bulk delete
        this.eventBus.on('projects:bulkDelete', (folderName) => {
            this.bulkDelete(folderName);
        });
        
        // Template selection
        this.eventBus.on('template:selected', (templateId) => {
            if (this.selectedProject) {
                this.updateProjectTemplate(this.selectedProject, templateId);
            }
        });
    }
    
    /**
     * Initialize with projects data
     */
    initialize(projects) {
        this.projects = projects.map(p => ({
            ...p,
            id: p.id || generateId(),
            createdAt: p.createdAt || new Date().toISOString()
        }));
    }
    
    /**
     * Get all projects
     */
    getAll() {
        return this.projects;
    }
    
    /**
     * Get project by ID
     */
    getById(id) {
        return this.projects.find(p => p.id === id);
    }
    
    /**
     * Get projects by folder
     */
    getByFolder(folderName) {
        return this.projects.filter(p => p.folder === folderName);
    }
    
    /**
     * Get unassigned projects
     */
    getUnassigned() {
        return this.projects.filter(p => !p.folder);
    }
    
    /**
     * Get project count
     */
    getCount() {
        return this.projects.length;
    }
    
    /**
     * Get active project count
     */
    getActiveCount() {
        return this.projects.filter(p => p.template && p.template !== 'blank').length;
    }
    
    /**
     * Get blank project count
     */
    getBlankCount() {
        return this.projects.filter(p => !p.template || p.template === 'blank').length;
    }
    
    /**
     * Get unassigned project count
     */
    getUnassignedCount() {
        return this.projects.filter(p => !p.folder).length;
    }
    
    /**
     * Select a project
     */
    selectProject(projectId) {
        const project = this.getById(projectId);
        if (!project) return;
        
        this.selectedProject = project;
        
        // Update UI
        document.querySelectorAll('.project-card').forEach(card => {
            if (card.getAttribute('data-project-id') === projectId) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
        
        // Show project editor
        this.showProjectEditor(project);
    }
    
    /**
     * Show project editor
     */
    showProjectEditor(project) {
        const editor = document.getElementById('selectedProjectEditor');
        if (!editor) return;
        
        editor.style.display = 'block';
        
        // Get available templates
        const templateOptions = this.templates.getAvailableTemplates();
        
        editor.innerHTML = `
            <h4 style="margin-bottom: 1.5rem;">
                Editing: <span style="color: var(--accent);">${project.name}</span>
            </h4>
            
            <div class="template-selector" id="templateSelector">
                <h4 style="margin-bottom: 1rem;">Choose Template</h4>
                <div class="template-grid">
                    <div class="template-option ${project.template === 'blank' ? 'selected' : ''}" data-template="blank">
                        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <div>Blank Page</div>
                    </div>
                    ${templateOptions.map(option => `
                        <div class="template-option ${project.template === option.id ? 'selected' : ''}" data-template="${option.id}">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M7 7h10l2 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2zM7 3h10a2 2 0 012 2v2H5V5a2 2 0 012-2z"/>
                            </svg>
                            <div>${option.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button class="btn" id="updateProjectBtn" style="flex: 1;">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    Deploy
                </button>
                <button class="btn btn-danger btn-icon" id="deleteProjectBtn">
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>`;
        
        // Setup template selection
        editor.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', () => {
                const templateId = option.getAttribute('data-template');
                
                // Update selection
                editor.querySelectorAll('.template-option').forEach(opt => {
                    opt.classList.toggle('selected', opt === option);
                });
                
                // Store selection
                if (this.selectedProject) {
                    this.selectedProject._pendingTemplate = templateId;
                }
            });
        });
        
        // Update button
        const updateBtn = document.getElementById('updateProjectBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateSelectedProject());
        }
        
        // Delete button
        const deleteBtn = document.getElementById('deleteProjectBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSelectedProject());
        }
    }
    
    /**
     * Quick deploy
     */
    async quickDeploy(folderName) {
        try {
            // Fetch available domains
            const domains = await this.fetchAvailableDomains();
            
            const projectName = generateProjectName();
            
            this.ui.showModal({
                id: 'deployModal',
                title: 'Deploy New Project',
                description: 'Choose a name for your project or use a random one.',
                content: `
                    <input type="text" class="input" id="deployNameInput" 
                           placeholder="Project name (e.g., ${projectName})">
                    <p class="input-hint">
                        Leave empty for random name. Only lowercase letters, numbers, and hyphens allowed.
                    </p>
                    ${domains.length > 0 ? `
                        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                            <label class="input-label">Custom Domain (Optional)</label>
                            <select id="domainSelect" class="input">
                                <option value="">Use default .vercel.app domain</option>
                                ${domains.map(d => `<option value="${d}">${d}</option>`).join('')}
                            </select>
                            <div id="subdomainPreview" style="margin-top: 0.75rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; font-family: monospace; font-size: 0.875rem; display: none;">
                                <span style="color: var(--text-secondary);">Preview:</span> 
                                <span id="previewUrl" style="color: var(--accent);"></span>
                            </div>
                        </div>
                    ` : ''}`,
                buttons: [
                    { text: 'Deploy', action: 'deploy', variant: 'btn', icon: 'zap' },
                    { text: 'Cancel', action: 'cancel', variant: 'btn-secondary' }
                ],
                onAction: (action, modal) => {
                    if (action === 'deploy') {
                        const input = modal.querySelector('#deployNameInput').value.trim();
                        const domain = modal.querySelector('#domainSelect')?.value;
                        const name = input || projectName;
                        
                        this.ui.closeModal('deployModal');
                        this.deployProject(name, folderName, domain);
                    }
                }
            });
            
            // Setup domain preview
            const setupPreview = () => {
                const nameInput = document.getElementById('deployNameInput');
                const domainSelect = document.getElementById('domainSelect');
                const preview = document.getElementById('subdomainPreview');
                const url = document.getElementById('previewUrl');
                
                if (!nameInput || !domainSelect) return;
                
                const updatePreview = () => {
                    const name = nameInput.value.trim() || projectName;
                    const domain = domainSelect.value;
                    
                    if (domain && preview && url) {
                        preview.style.display = 'block';
                        url.textContent = `${name}.${domain}`;
                    } else if (preview) {
                        preview.style.display = 'none';
                    }
                };
                
                nameInput.addEventListener('input', updatePreview);
                domainSelect.addEventListener('change', updatePreview);
            };
            
            setTimeout(setupPreview, 100);
            
        } catch (error) {
            console.error('Quick deploy error:', error);
            this.ui.showToast('Failed to prepare deployment', 'error');
        }
    }
    
    /**
     * Fetch available domains
     */
    async fetchAvailableDomains() {
        try {
            const response = await this.api.listDomains();
            
            if (response.domains) {
                return response.domains
                    .filter(d => d.verified && !d.name.endsWith('.vercel.app'))
                    .map(d => d.name);
            }
            
            return [];
        } catch (error) {
            console.error('Failed to fetch domains:', error);
            return [];
        }
    }
    
    /**
     * Deploy project
     */
    async deployProject(name, folderName, customDomain) {
        const validation = validateProjectName(name);
        if (!validation.valid) {
            this.ui.showToast(validation.error, 'error');
            return;
        }
        
        this.ui.showLoadingState('Creating project...');
        
        try {
            // Create project
            let actualProjectName = name;
            let productionUrl = '';
            
            try {
                const project = await this.api.createProject(name);
                actualProjectName = project.name || name;
            } catch (error) {
                if (error.message && error.message.includes('already exists')) {
                    // Try with timestamp
                    actualProjectName = `${name}-${Date.now().toString(36)}`;
                    await this.api.createProject(actualProjectName);
                } else {
                    throw error;
                }
            }
            
            this.ui.showLoadingState('Deploying template...');
            
            // Get random template
            const template = this.templates.getRandomTemplate();
            
            // Deploy with template
            const deploymentData = {
                name: actualProjectName,
                files: [{
                    file: 'index.html',
                    data: template.html
                }],
                target: 'production',
                public: true
            };
            
            const deployment = await this.api.createDeployment(deploymentData);
            
            // Default URL
            productionUrl = `https://${actualProjectName}.vercel.app`;
            
            // Add custom domain if selected
            if (customDomain) {
                const subdomain = `${actualProjectName}.${customDomain}`;
                
                try {
                    await this.api.addDomainToProject(actualProjectName, subdomain);
                    productionUrl = `https://${subdomain}`;
                    
                    // Wait for DNS propagation
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } catch (error) {
                    console.error('Failed to add custom domain:', error);
                }
            }
            
            // Add to projects
            const newProject = {
                id: generateId(),
                name: actualProjectName,
                url: cleanUrl(productionUrl),
                actualUrl: cleanUrl(productionUrl),
                customDomain: customDomain ? `${actualProjectName}.${customDomain}` : null,
                template: template.id,
                placeholderType: template.category,
                folder: folderName === 'Unassigned' ? null : folderName,
                createdAt: new Date().toISOString()
            };
            
            this.projects.unshift(newProject);
            
            // Save data
            await this.saveData();
            
            this.ui.hideLoadingState();
            this.ui.showToast(`Deployed with ${template.name} template!`, 'success');
            
            // Refresh view
            this.eventBus.emit('project:created', newProject);
            
        } catch (error) {
            console.error('Deployment failed:', error);
            this.ui.hideLoadingState();
            this.ui.showToast(error.message || 'Failed to deploy project', 'error');
        }
    }
    
    /**
     * Update selected project
     */
    async updateSelectedProject() {
        if (!this.selectedProject) return;
        
        const btn = document.getElementById('updateProjectBtn');
        if (!btn) return;
        
        btn.disabled = true;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<div class="spinner"></div> Deploying...';
        
        try {
            const templateId = this.selectedProject._pendingTemplate || 'blank';
            let content = '';
            let templateData = null;
            
            if (templateId === 'blank') {
                content = '';
            } else {
                templateData = this.templates.getTemplateById(templateId);
                if (templateData) {
                    content = templateData.html;
                }
            }
            
            // Deploy update
            const deploymentData = {
                name: this.selectedProject.name,
                files: [{ file: 'index.html', data: content }],
                target: 'production',
                public: true
            };
            
            await this.api.createDeployment(deploymentData);
            
            // Update project data
            const projectIndex = this.projects.findIndex(p => p.id === this.selectedProject.id);
            if (projectIndex >= 0) {
                this.projects[projectIndex].template = templateId;
                
                if (templateId === 'blank') {
                    delete this.projects[projectIndex].placeholderType;
                    delete this.projects[projectIndex].offerName;
                } else if (templateData) {
                    if (templateData.type === 'offer') {
                        this.projects[projectIndex].template = 'customoffer';
                        this.projects[projectIndex].offerName = templateData.name;
                        delete this.projects[projectIndex].placeholderType;
                    } else {
                        this.projects[projectIndex].placeholderType = templateData.category;
                        delete this.projects[projectIndex].offerName;
                    }
                }
            }
            
            // Save data
            await this.saveData();
            
            this.ui.showToast('Project updated successfully!', 'success');
            this.eventBus.emit('project:updated', this.selectedProject);
            
        } catch (error) {
            console.error('Update failed:', error);
            this.ui.showToast('Failed to update project', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
        }
    }
    
    /**
     * Delete selected project
     */
    async deleteSelectedProject() {
        if (!this.selectedProject) return;
        
        const confirmed = await this.ui.showModal({
            title: 'Delete Project',
            description: `Are you sure you want to delete "${this.selectedProject.name}"? This action cannot be undone.`,
            buttons: [
                { text: 'Delete', action: 'delete', variant: 'btn-danger', icon: 'trash' },
                { text: 'Cancel', action: 'cancel', variant: 'btn-secondary' }
            ]
        });
        
        if (confirmed !== 'delete') return;
        
        const btn = document.getElementById('deleteProjectBtn');
        if (btn) btn.disabled = true;
        
        try {
            // Delete from Vercel
            await this.api.deleteProject(this.selectedProject.name);
            
            // Remove from local data
            const index = this.projects.findIndex(p => p.id === this.selectedProject.id);
            if (index >= 0) {
                this.projects.splice(index, 1);
            }
            
            // Save data
            await this.saveData();
            
            // Clear selection
            this.selectedProject = null;
            document.getElementById('selectedProjectEditor').style.display = 'none';
            
            this.ui.showToast('Project deleted', 'success');
            this.eventBus.emit('project:deleted');
            
        } catch (error) {
            console.error('Delete failed:', error);
            this.ui.showToast('Failed to delete project', 'error');
        } finally {
            if (btn) btn.disabled = false;
        }
    }
    
    /**
     * Bulk delete projects
     */
    async bulkDelete(folderName) {
        const projects = folderName === 'Unassigned'
            ? this.getUnassigned()
            : this.getByFolder(folderName);
        
        if (projects.length === 0) {
            this.ui.showToast('No projects in this folder', 'warning');
            return;
        }
        
        const confirmed = await this.ui.showModal({
            title: 'Delete All Projects',
            description: `Are you sure you want to delete all ${projects.length} projects in ${folderName}? This action cannot be undone.`,
            buttons: [
                { text: 'Delete All', action: 'delete', variant: 'btn-danger', icon: 'trash' },
                { text: 'Cancel', action: 'cancel', variant: 'btn-secondary' }
            ]
        });
        
        if (confirmed !== 'delete') return;
        
        this.ui.showLoadingState(`Deleting ${projects.length} projects...`);
        
        try {
            const projectNames = projects.map(p => p.name);
            const results = await this.api.deleteMultipleProjects(projectNames, (current, total) => {
                this.ui.showLoadingState(`Deleting project ${current} of ${total}...`);
            });
            
            // Remove from local data
            if (folderName === 'Unassigned') {
                this.projects = this.projects.filter(p => p.folder);
            } else {
                this.projects = this.projects.filter(p => p.folder !== folderName);
            }
            
            // Save data
            await this.saveData();
            
            this.ui.hideLoadingState();
            this.ui.showToast(`Deleted ${results.succeeded.length} projects`, 'success');
            
            if (results.failed.length > 0) {
                console.error('Failed to delete some projects:', results.failed);
            }
            
            this.eventBus.emit('projects:bulkDeleted');
            
        } catch (error) {
            console.error('Bulk delete failed:', error);
            this.ui.hideLoadingState();
            this.ui.showToast('Failed to delete projects', 'error');
        }
    }
    
    /**
     * Refresh projects from Vercel
     */
    async refresh() {
        this.ui.showLoadingState('Syncing with Vercel...');
        
        try {
            // Save current data first
            await this.saveData();
            
            // Reload from Vercel
            await this.eventBus.emit('data:refresh');
            
            this.ui.hideLoadingState();
            this.ui.showToast('Projects refreshed', 'success');
            
        } catch (error) {
            console.error('Refresh failed:', error);
            this.ui.hideLoadingState();
            this.ui.showToast('Failed to refresh projects', 'error');
        }
    }
    
    /**
     * Save data
     */
    async saveData() {
        this.eventBus.emit('data:save');
    }
}