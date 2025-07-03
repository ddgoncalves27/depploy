/**
 * UI Manager
 * Handles all UI rendering and DOM manipulation
 */

import { CONSTANTS } from '../config/constants.js';
import { getTimeAgo, formatDate, copyToClipboard, cleanUrl } from './utils.js';

export class UIManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.toastQueue = [];
        this.activeModals = new Set();
    }
    
    /**
     * Initialize UI
     */
    init() {
        this.setupModalHandlers();
        this.setupKeyboardShortcuts();
    }
    
    // ===== Loading States =====
    
    /**
     * Show loading state
     */
    showLoadingState(message = 'Loading...') {
        const authSection = document.getElementById('authSection');
        const mainApp = document.getElementById('mainApp');
        const loadingState = document.getElementById('loadingState');
        
        if (authSection) authSection.style.display = 'none';
        if (mainApp) mainApp.style.display = 'none';
        if (loadingState) {
            loadingState.style.display = 'block';
            
            const loadingCard = loadingState.querySelector('.loading-card');
            if (loadingCard) {
                const messageEl = loadingCard.querySelector('p');
                if (messageEl) messageEl.textContent = message;
            }
        }
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }
    
    // ===== Header =====
    
    /**
     * Render header
     */
    renderHeader(teamInfo) {
        const header = document.getElementById('appHeader');
        if (!header) return;
        
        header.innerHTML = `
            <div class="logo">
                <div class="logo-icon">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 22.525H0l12-21.05 12 21.05z"/>
                    </svg>
                </div>
                <h1>Vercel Deploy</h1>
            </div>
            <div class="header-status">
                <div class="status-indicator" id="statusIndicator"></div>
                <span id="connectionStatus">Connected to Vercel</span>
                ${teamInfo ? `
                    <span class="team-badge">
                        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <span>${teamInfo.name}</span>
                    </span>
                ` : ''}
                <span id="dataProjectInfo" style="font-size: 0.75rem; color: var(--text-tertiary); margin-left: 1rem;">
                    Data: <code style="background: var(--bg-tertiary); padding: 0.125rem 0.375rem; border-radius: 4px;">${CONSTANTS.DATA_PROJECT.NAME}</code>
                </span>
            </div>`;
    }
    
    // ===== Stats =====
    
    /**
     * Update statistics
     */
    updateStats(stats) {
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.totalProjects}</div>
                <div class="stat-label">Total Projects</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.activePages}</div>
                <div class="stat-label">Active Pages</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.blankPages}</div>
                <div class="stat-label">Blank Pages</div>
            </div>`;
    }
    
    // ===== Views =====
    
    /**
     * Show folders view
     */
    showFoldersView(folders, unassignedCount) {
        const viewContainer = document.getElementById('viewContainer');
        if (!viewContainer) return;
        
        // Hide other views
        this.hideAllViews();
        
        // Show folders view
        let foldersView = document.getElementById('foldersView');
        if (!foldersView) {
            foldersView = document.createElement('div');
            foldersView.id = 'foldersView';
            foldersView.className = 'view-section';
            viewContainer.appendChild(foldersView);
        }
        
        foldersView.style.display = 'block';
        
        // Count stats
        const availableFolders = folders.filter(f => f.name !== 'Offers');
        const protectedFolders = availableFolders.filter(f => f.protected);
        
        foldersView.innerHTML = `
            <div class="main-grid">
                <div class="folders-section">
                    <div class="section-header">
                        <h2 class="section-title">Project Folders</h2>
                    </div>
                    <div class="folders-grid">
                        ${[...availableFolders, unassignedCount > 0 ? { name: 'Unassigned', special: true } : null]
                            .filter(Boolean)
                            .map(folder => this.renderFolderCard(folder, folder.name === 'Unassigned' ? unassignedCount : null))
                            .join('')}
                    </div>
                </div>
                
                <div class="side-panel">
                    ${this.renderActionCard({
                        title: 'Manage Folders',
                        description: 'Organize projects with secure, password-protected folders.',
                        icon: 'settings',
                        badge: '🔒 Admin',
                        onClick: 'manageFolders'
                    })}
                    
                    ${this.renderActionCard({
                        title: 'Offer Templates',
                        description: 'Pre-built pages ready to deploy with one click.',
                        icon: 'package',
                        badge: '🔒 Admin',
                        onClick: 'openOffers'
                    })}
                    
                    <div class="action-card no-hover" style="background: var(--bg-tertiary);">
                        <h4 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-secondary);">Quick Stats</h4>
                        <div style="display: grid; gap: 0.75rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Total Folders</span>
                                <span style="font-weight: 600; color: var(--accent);">${availableFolders.length}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Protected</span>
                                <span style="font-weight: 600; color: var(--warning);">${protectedFolders.length}</span>
                            </div>
                        </div>
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <p style="font-size: 0.75rem; color: var(--text-tertiary); line-height: 1.4; margin: 0;">
                                💡 <strong>Tip:</strong> All data is stored in the shared <strong>${CONSTANTS.DATA_PROJECT.NAME}</strong> Vercel project.
                            </p>
                        </div>
                    </div>
                </div>
            </div>`;
        
        // Setup event handlers
        this.setupFolderHandlers();
    }
    
    /**
     * Render folder card
     */
    renderFolderCard(folder, projectCount = null) {
        const count = projectCount !== null ? projectCount : 0;
        
        return `
            <div class="folder-card" data-folder="${folder.name}">
                ${folder.protected ? '<div class="folder-badge protected">🔒 Protected</div>' : ''}
                <div class="folder-icon">
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                    </svg>
                </div>
                <div class="folder-name">${folder.name}</div>
                <div class="folder-count">${count} project${count !== 1 ? 's' : ''}</div>
            </div>`;
    }
    
    /**
     * Render action card
     */
    renderActionCard(config) {
        const iconSvg = this.getIcon(config.icon);
        
        return `
            <div class="action-card" data-action="${config.onClick}">
                ${config.badge ? `<div class="folder-badge admin">${config.badge}</div>` : ''}
                <div class="action-card-icon">
                    ${iconSvg}
                </div>
                <h3>${config.title}</h3>
                <p>${config.description}</p>
            </div>`;
    }
    
    /**
     * Show folder content
     */
    showFolderContent(folderName, projects) {
        const viewContainer = document.getElementById('viewContainer');
        if (!viewContainer) return;
        
        // Hide other views
        this.hideAllViews();
        
        // Show folder content view
        let folderView = document.getElementById('folderContentView');
        if (!folderView) {
            folderView = document.createElement('div');
            folderView.id = 'folderContentView';
            folderView.className = 'view-section';
            viewContainer.appendChild(folderView);
        }
        
        folderView.style.display = 'block';
        
        const isOffers = folderName === 'Offers';
        
        folderView.innerHTML = `
            <nav class="breadcrumb">
                <button class="btn btn-icon btn-secondary" id="backToFoldersBtn">
                    ${this.getIcon('chevron-left')}
                </button>
                <a href="#" class="breadcrumb-item" id="foldersLink">
                    ${this.getIcon('home', 16)}
                    Folders
                </a>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">${folderName}</span>
            </nav>
            
            <div class="main-grid">
                <div class="folders-section">
                    <div class="section-header">
                        <h2 class="section-title">${isOffers ? 'Offer Templates' : `${folderName} Projects`}</h2>
                        ${!isOffers ? `
                            <div style="display: flex; gap: 0.75rem;">
                                <button class="btn btn-secondary" id="refreshBtn">
                                    ${this.getIcon('refresh', 16)}
                                    Refresh
                                </button>
                                <button class="btn btn-danger" id="bulkDeleteBtn">
                                    ${this.getIcon('trash', 16)}
                                    Delete All
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="${isOffers ? 'management-grid' : 'projects-grid'}" id="contentGrid">
                        ${projects.length === 0 ? this.renderEmptyState(folderName) : ''}
                    </div>
                </div>
                
                <div class="side-panel">
                    ${!isOffers ? this.renderQuickDeploy() : ''}
                    <div id="selectedProjectEditor" style="display: none;"></div>
                </div>
            </div>`;
        
        // Render projects or offers
        if (projects.length > 0) {
            if (isOffers) {
                this.renderOffers(projects);
            } else {
                this.renderProjects(projects);
            }
        }
        
        // Setup event handlers
        this.setupFolderContentHandlers(folderName);
    }
    
    /**
     * Render empty state
     */
    renderEmptyState(folderName) {
        const isOffers = folderName === 'Offers';
        
        return `
            <div class="empty-state" style="grid-column: 1 / -1;">
                ${this.getIcon(isOffers ? 'package' : 'folder')}
                <h3>${isOffers ? 'No Templates Yet' : 'No Projects Yet'}</h3>
                <p>${isOffers ? 
                    'Create your first offer template to reuse across projects' : 
                    'Click "Deploy Now" to transform your first page'
                }</p>
                ${isOffers ? `
                    <button class="btn" id="createTemplateBtn">
                        ${this.getIcon('plus', 16)}
                        Create Template
                    </button>
                ` : ''}
            </div>`;
    }
    
    /**
     * Render quick deploy
     */
    renderQuickDeploy() {
        return `
            <div class="quick-deploy">
                <h3>One-Click Deploy</h3>
                <p>Transform any page instantly</p>
                <button class="btn deploy-btn" id="quickDeployBtn">
                    ${this.getIcon('zap', 20)}
                    Deploy Now
                </button>
            </div>`;
    }
    
    /**
     * Render projects
     */
    renderProjects(projects) {
        const grid = document.getElementById('contentGrid');
        if (!grid) return;
        
        // Sort by creation date (newest first)
        const sorted = [...projects].sort((a, b) => 
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        
        grid.innerHTML = sorted.map((project, index) => 
            this.renderProjectCard(project, index === 0)
        ).join('');
    }
    
    /**
     * Render project card
     */
    renderProjectCard(project, isNewest = false) {
        const isActive = project.template && project.template !== 'blank';
        let statusText = '○ Blank';
        let statusClass = 'blank';
        
        if (isActive) {
            if (project.placeholderType) {
                const categoryNames = CONSTANTS.TEMPLATE_CATEGORIES;
                statusText = categoryNames[project.placeholderType]?.name || '✓ Active';
            } else if (project.template === 'customoffer' && project.offerName) {
                statusText = `✓ ${project.offerName}`;
            } else {
                statusText = '✓ Active';
            }
            statusClass = 'active';
        }
        
        const projectUrl = cleanUrl(project.actualUrl || project.url || `https://${project.name}.vercel.app`);
        const createdDate = new Date(project.createdAt || Date.now());
        const timeAgo = getTimeAgo(createdDate);
        
        return `
            <div class="project-card" data-project-id="${project.id}">
                ${isNewest ? '<div class="newest-badge">✨ Latest</div>' : ''}
                <div class="project-header">
                    <div class="project-url">${project.name}</div>
                    <div class="project-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                <div class="project-url-full">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="opacity: 0.5;">
                        <path d="M24 22.525H0l12-21.05 12 21.05z"/>
                    </svg>
                    ${projectUrl}
                    ${project.customDomain ? '<span class="custom-domain-badge">🌐 Custom</span>' : ''}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.75rem;">
                    Created ${timeAgo}
                </div>
                <div class="project-actions">
                    <button class="btn btn-secondary btn-sm copy-btn" data-url="${projectUrl}">
                        ${this.getIcon('copy', 14)}
                        Copy
                    </button>
                    <a href="${projectUrl}" target="_blank" class="btn btn-secondary btn-sm">
                        ${this.getIcon('external-link', 14)}
                        Visit
                    </a>
                </div>
            </div>`;
    }
    
    /**
     * Show management view
     */
    showManagementView(folders) {
        const viewContainer = document.getElementById('viewContainer');
        if (!viewContainer) return;
        
        // Hide other views
        this.hideAllViews();
        
        // Show management view
        let managementView = document.getElementById('folderManagementView');
        if (!managementView) {
            managementView = document.createElement('div');
            managementView.id = 'folderManagementView';
            managementView.className = 'view-section';
            viewContainer.appendChild(managementView);
        }
        
        managementView.style.display = 'block';
        
        managementView.innerHTML = `
            <nav class="breadcrumb">
                <button class="btn btn-icon btn-secondary" id="backToFoldersBtn">
                    ${this.getIcon('chevron-left')}
                </button>
                <a href="#" class="breadcrumb-item" id="foldersLink">
                    ${this.getIcon('home', 16)}
                    Folders
                </a>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">Manage Folders</span>
            </nav>
            
            <div class="folders-section">
                <div class="section-header">
                    <h2 class="section-title">Folder Management</h2>
                    <button class="btn" id="createFolderBtn">
                        ${this.getIcon('plus', 16)}
                        New Folder
                    </button>
                </div>
                
                <div id="foldersList">
                    ${this.renderFolderManagement(folders)}
                </div>
            </div>`;
        
        this.setupManagementHandlers();
    }
    
    /**
     * Render folder management
     */
    renderFolderManagement(folders) {
        const allFolders = folders.filter(f => f.name !== 'Offers');
        
        if (allFolders.length === 0) {
            return `
                <div class="empty-state">
                    ${this.getIcon('folder')}
                    <h3>No Folders Yet</h3>
                    <p>Create your first folder to organize projects</p>
                </div>`;
        }
        
        return `
            <div class="management-grid">
                ${allFolders.map((folder, idx) => this.renderManagementCard(folder, idx)).join('')}
            </div>`;
    }
    
    /**
     * Render management card
     */
    renderManagementCard(folder, index) {
        const isAvailable = folder.available !== false;
        
        return `
            <div class="management-card ${!isAvailable ? 'hidden' : ''}" data-folder-index="${index}">
                <div class="management-card-header">
                    <div>
                        <div class="management-card-badges">
                            ${folder.protected ? '<div class="folder-badge protected">🔒 Protected</div>' : ''}
                            ${!isAvailable ? '<div class="folder-badge" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: var(--danger);">Hidden</div>' : ''}
                        </div>
                    </div>
                    <button class="visibility-toggle ${isAvailable ? 'visible' : 'hidden'}" data-folder-index="${index}">
                        ${this.getIcon(isAvailable ? 'eye' : 'eye-off')}
                    </button>
                </div>
                <div class="management-card-content">
                    <div class="management-card-icon">
                        ${this.getIcon('folder')}
                    </div>
                    <div class="management-card-name">${folder.name}</div>
                    <div class="management-card-count">0 projects</div>
                </div>
                <div class="management-card-actions">
                    <button class="btn btn-icon btn-secondary edit-folder-btn" data-folder-index="${index}">
                        ${this.getIcon('edit', 16)}
                    </button>
                    <button class="btn btn-icon btn-danger delete-folder-btn" data-folder-index="${index}">
                        ${this.getIcon('trash', 16)}
                    </button>
                </div>
            </div>`;
    }
    
    /**
     * Show offers view
     */
    showOffersView(offers) {
        // This is handled by showFolderContent with folderName='Offers'
        this.renderOffers(offers);
    }
    
    /**
     * Render offers
     */
    renderOffers(offers) {
        const grid = document.getElementById('contentGrid');
        if (!grid) return;
        
        const createButton = `
            <button class="btn" id="createOfferBtn">
                ${this.getIcon('plus', 16)}
                New Template
            </button>`;
        
        if (offers.length === 0) {
            // Empty state is already rendered
            return;
        }
        
        grid.innerHTML = `
            <div style="grid-column: 1 / -1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3>Saved Templates</h3>
                    ${createButton}
                </div>
                <div class="management-grid">
                    ${offers.map((offer, index) => this.renderOfferCard(offer, index)).join('')}
                </div>
            </div>`;
        
        this.setupOfferHandlers();
    }
    
    /**
     * Render offer card
     */
    renderOfferCard(offer, index) {
        const isAvailable = offer.available !== false;
        
        return `
            <div class="management-card ${!isAvailable ? 'hidden' : ''}" data-offer-index="${index}">
                <div class="management-card-header">
                    <div>
                        <div class="management-card-badges">
                            <div class="project-status active">Template</div>
                            ${!isAvailable ? '<div class="folder-badge" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: var(--danger);">Hidden</div>' : ''}
                        </div>
                    </div>
                    <button class="visibility-toggle ${isAvailable ? 'visible' : 'hidden'}" data-offer-index="${index}">
                        ${this.getIcon(isAvailable ? 'eye' : 'eye-off')}
                    </button>
                </div>
                <div class="management-card-content">
                    <div class="management-card-icon">
                        ${this.getIcon('package')}
                    </div>
                    <div class="management-card-name">${offer.name}</div>
                    <div class="management-card-count">
                        Created ${formatDate(offer.createdAt)}
                    </div>
                </div>
                <div class="management-card-actions">
                    <button class="btn btn-secondary btn-sm edit-offer-btn" data-offer-index="${index}">
                        ${this.getIcon('edit', 14)}
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-offer-btn" data-offer-index="${index}">
                        ${this.getIcon('trash', 14)}
                        Delete
                    </button>
                </div>
            </div>`;
    }
    
    // ===== Hide Views =====
    
    /**
     * Hide all views
     */
    hideAllViews() {
        const views = ['foldersView', 'folderContentView', 'folderManagementView'];
        views.forEach(viewId => {
            const view = document.getElementById(viewId);
            if (view) view.style.display = 'none';
        });
    }
    
    // ===== Modals =====
    
    /**
     * Show modal
     */
    showModal(config) {
        const modalId = config.id || `modal-${Date.now()}`;
        
        // Create modal HTML
        const modalHtml = `
            <div class="modal" id="${modalId}">
                <div class="modal-content">
                    <h3 class="modal-title">${config.title}</h3>
                    ${config.description ? `<p class="modal-description">${config.description}</p>` : ''}
                    ${config.content || ''}
                    <div class="modal-footer">
                        ${config.buttons.map(btn => `
                            <button class="btn ${btn.variant || ''}" data-action="${btn.action}">
                                ${btn.icon ? this.getIcon(btn.icon, 16) : ''}
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>`;
        
        // Add to container
        const container = document.getElementById('modalContainer');
        if (container) {
            container.insertAdjacentHTML('beforeend', modalHtml);
        }
        
        // Show modal
        const modal = document.getElementById(modalId);
        if (modal) {
            setTimeout(() => modal.classList.add('show'), 10);
            this.activeModals.add(modalId);
            
            // Setup handlers
            modal.querySelectorAll('button[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.target.getAttribute('data-action');
                    if (config.onAction) {
                        config.onAction(action, modal);
                    }
                    if (action === 'close' || action === 'cancel') {
                        this.closeModal(modalId);
                    }
                });
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modalId);
                }
            });
        }
        
        return modalId;
    }
    
    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                this.activeModals.delete(modalId);
            }, 300);
        }
    }
    
    /**
     * Close all modals
     */
    closeAllModals() {
        this.activeModals.forEach(modalId => this.closeModal(modalId));
    }
    
    // ===== Toast Notifications =====
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toastId = `toast-${Date.now()}`;
        
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        const toastHtml = `
            <div class="toast ${type}" id="${toastId}">
                <div class="toast-icon">
                    ${this.getIcon(icons[type] || icons.info, 20)}
                </div>
                <span class="toast-message">${message}</span>
            </div>`;
        
        const container = document.getElementById('toastContainer');
        if (container) {
            container.insertAdjacentHTML('beforeend', toastHtml);
        }
        
        const toast = document.getElementById(toastId);
        if (toast) {
            setTimeout(() => toast.classList.add('show'), 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, CONSTANTS.UI.TOAST_DURATION);
        }
    }
    
    // ===== Icons =====
    
    /**
     * Get icon SVG
     */
    getIcon(name, size = 24) {
        const icons = {
            'chevron-left': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>`,
            'home': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a2 2 0 002 2h10a2 2 0 002-2V10"/></svg>`,
            'folder': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>`,
            'package': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 7h10l2 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2zM7 3h10a2 2 0 012 2v2H5V5a2 2 0 012-2z"/></svg>`,
            'settings': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
            'plus': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>`,
            'trash': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`,
            'edit': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>`,
            'eye': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`,
            'eye-off': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>`,
            'zap': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
            'refresh': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>`,
            'copy': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
            'external-link': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>`,
            'check-circle': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            'x-circle': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            'alert-triangle': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            'info': `<svg width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        };
        
        return icons[name] || icons.folder;
    }
    
    // ===== Event Handlers Setup =====
    
    /**
     * Setup modal handlers
     */
    setupModalHandlers() {
        // Close modals on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                const lastModal = Array.from(this.activeModals).pop();
                this.closeModal(lastModal);
            }
        });
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - Quick deploy
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const deployBtn = document.getElementById('quickDeployBtn');
                if (deployBtn) deployBtn.click();
            }
            
            // Ctrl/Cmd + / - Show shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }
    
    /**
     * Show keyboard shortcuts
     */
    showKeyboardShortcuts() {
        this.showModal({
            title: 'Keyboard Shortcuts',
            content: `
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd> - Quick deploy
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl</kbd> + <kbd>/</kbd> - Show this help
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd> - Close modal
                    </div>
                </div>`,
            buttons: [
                { text: 'Close', action: 'close' }
            ]
        });
    }
    
    /**
     * Setup folder handlers
     */
    setupFolderHandlers() {
        // Folder clicks
        document.querySelectorAll('.folder-card').forEach(card => {
            card.addEventListener('click', () => {
                const folderName = card.getAttribute('data-folder');
                this.eventBus.emit('navigate:folder', folderName);
            });
        });
        
        // Action card clicks
        document.querySelectorAll('.action-card[data-action]').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.getAttribute('data-action');
                if (action === 'manageFolders') {
                    this.eventBus.emit('admin:manageFolders');
                } else if (action === 'openOffers') {
                    this.eventBus.emit('admin:openOffers');
                }
            });
        });
    }
    
    /**
     * Setup folder content handlers
     */
    setupFolderContentHandlers(folderName) {
        // Back button
        const backBtn = document.getElementById('backToFoldersBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.eventBus.emit('navigate:folders');
            });
        }
        
        // Folders link
        const foldersLink = document.getElementById('foldersLink');
        if (foldersLink) {
            foldersLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.eventBus.emit('navigate:folders');
            });
        }
        
        // Quick deploy
        const deployBtn = document.getElementById('quickDeployBtn');
        if (deployBtn) {
            deployBtn.addEventListener('click', () => {
                this.eventBus.emit('project:quickDeploy', folderName);
            });
        }
        
        // Refresh
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.eventBus.emit('projects:refresh');
            });
        }
        
        // Bulk delete
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                this.eventBus.emit('projects:bulkDelete', folderName);
            });
        }
        
        // Project clicks
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.project-actions')) return;
                const projectId = card.getAttribute('data-project-id');
                this.eventBus.emit('project:selected', projectId);
            });
        });
        
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const url = btn.getAttribute('data-url');
                const success = await copyToClipboard(url);
                
                if (success) {
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = `${this.getIcon('check-circle', 14)} Copied`;
                    btn.style.color = 'var(--success)';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.color = '';
                    }, 2000);
                } else {
                    this.showToast('Failed to copy URL', 'error');
                }
            });
        });
        
        // Create template button
        const createBtn = document.getElementById('createTemplateBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.eventBus.emit('offer:create');
            });
        }
    }
    
    /**
     * Setup management handlers
     */
    setupManagementHandlers() {
        // Back button
        const backBtn = document.getElementById('backToFoldersBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.eventBus.emit('navigate:folders');
            });
        }
        
        // Folders link
        const foldersLink = document.getElementById('foldersLink');
        if (foldersLink) {
            foldersLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.eventBus.emit('navigate:folders');
            });
        }
        
        // Create folder
        const createBtn = document.getElementById('createFolderBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.eventBus.emit('folder:create');
            });
        }
        
        // Visibility toggles
        document.querySelectorAll('.visibility-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-folder-index'));
                this.eventBus.emit('folder:toggleVisibility', index);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-folder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-folder-index'));
                this.eventBus.emit('folder:edit', index);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-folder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-folder-index'));
                this.eventBus.emit('folder:delete', index);
            });
        });
    }
    
    /**
     * Setup offer handlers
     */
    setupOfferHandlers() {
        // Create offer
        const createBtn = document.getElementById('createOfferBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.eventBus.emit('offer:create');
            });
        }
        
        // Visibility toggles
        document.querySelectorAll('.visibility-toggle[data-offer-index]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-offer-index'));
                this.eventBus.emit('offer:toggleVisibility', index);
            });
        });
        
        // Edit buttons
        document.querySelectorAll('.edit-offer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-offer-index'));
                this.eventBus.emit('offer:edit', index);
            });
        });
        
        // Delete buttons
        document.querySelectorAll('.delete-offer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-offer-index'));
                this.eventBus.emit('offer:delete', index);
            });
        });
    }
}