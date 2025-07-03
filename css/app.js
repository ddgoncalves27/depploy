/**
 * Main Application Module
 * Coordinates all other modules and manages application lifecycle
 */

import { AuthManager } from './auth.js';
import { ProjectManager } from './projects.js';
import { FolderManager } from './folders.js';
import { OfferManager } from './offers.js';
import { TemplateManager } from './templates.js';
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';
import { ApiClient } from './api.js';
import { EventBus } from './utils.js';
import { CONSTANTS } from '../config/constants.js';

export class App {
    constructor() {
        // Initialize event bus
        this.eventBus = new EventBus();
        
        // Initialize managers
        this.api = new ApiClient(this.eventBus);
        this.storage = new StorageManager();
        this.ui = new UIManager(this.eventBus);
        this.auth = new AuthManager(this.api, this.storage, this.ui, this.eventBus);
        this.templates = new TemplateManager();
        this.projects = new ProjectManager(this.api, this.storage, this.ui, this.templates, this.eventBus);
        this.folders = new FolderManager(this.storage, this.ui, this.eventBus);
        this.offers = new OfferManager(this.storage, this.ui, this.eventBus);
        
        // Application state
        this.state = {
            initialized: false,
            currentView: 'folders',
            selectedProject: null,
            selectedFolder: null,
            teamInfo: null
        };
        
        // Bind methods
        this.init = this.init.bind(this);
        this.handleAuthSuccess = this.handleAuthSuccess.bind(this);
        this.handleAuthFailure = this.handleAuthFailure.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing Vercel Deploy...');
            
            // Set up global error handling
            this.setupErrorHandling();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.ui.init();
            
            // Check for existing authentication
            const token = this.storage.get('vercelToken');
            if (token) {
                // Try to authenticate with existing token
                const authResult = await this.auth.validateToken(token);
                if (authResult.success) {
                    await this.handleAuthSuccess(authResult);
                } else {
                    this.showAuthScreen();
                }
            } else {
                this.showAuthScreen();
            }
            
            this.state.initialized = true;
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.ui.showToast('Failed to initialize application', 'error');
            this.showAuthScreen();
        }
    }
    
    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.ui.showToast('An unexpected error occurred', 'error');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.ui.showToast('An unexpected error occurred', 'error');
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Auth events
        this.eventBus.on('auth:success', this.handleAuthSuccess);
        this.eventBus.on('auth:failure', this.handleAuthFailure);
        this.eventBus.on('auth:logout', () => this.showAuthScreen());
        
        // Navigation events
        this.eventBus.on('navigate:folders', () => this.showFoldersView());
        this.eventBus.on('navigate:folder', (folder) => this.showFolderContent(folder));
        this.eventBus.on('navigate:management', () => this.showManagementView());
        this.eventBus.on('navigate:offers', () => this.showOffersView());
        
        // Project events
        this.eventBus.on('project:selected', (project) => {
            this.state.selectedProject = project;
        });
        
        this.eventBus.on('project:created', async () => {
            await this.refreshData();
            this.ui.showToast('Project created successfully', 'success');
        });
        
        this.eventBus.on('project:updated', async () => {
            await this.refreshData();
            this.ui.showToast('Project updated successfully', 'success');
        });
        
        this.eventBus.on('project:deleted', async () => {
            await this.refreshData();
            this.ui.showToast('Project deleted successfully', 'success');
        });
        
        // Folder events
        this.eventBus.on('folder:created', async () => {
            await this.refreshData();
            this.ui.showToast('Folder created successfully', 'success');
        });
        
        this.eventBus.on('folder:updated', async () => {
            await this.refreshData();
            this.ui.showToast('Folder updated successfully', 'success');
        });
        
        this.eventBus.on('folder:deleted', async () => {
            await this.refreshData();
            this.ui.showToast('Folder deleted successfully', 'success');
        });
        
        // Data sync events
        this.eventBus.on('data:sync:start', () => {
            this.ui.showLoadingState('Syncing with Vercel...');
        });
        
        this.eventBus.on('data:sync:complete', () => {
            this.ui.hideLoadingState();
            this.ui.showToast('Data synced successfully', 'success');
        });
        
        this.eventBus.on('data:sync:error', (error) => {
            this.ui.hideLoadingState();
            this.ui.showToast(`Sync failed: ${error.message}`, 'error');
        });
        
        // Window events
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // Handle browser back/forward
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.view) {
                this.navigateToView(event.state.view, event.state.data);
            }
        });
    }
    
    /**
     * Handle successful authentication
     */
    async handleAuthSuccess(authResult) {
        try {
            // Store auth data
            this.state.teamInfo = authResult.team;
            
            // Show loading state
            this.ui.showLoadingState('Loading your data...');
            
            // Initialize data
            await this.initializeData();
            
            // Hide loading state
            this.ui.hideLoadingState();
            
            // Show main app
            this.showMainApp();
            
            // Navigate to default view
            this.showFoldersView();
            
        } catch (error) {
            console.error('Failed to handle auth success:', error);
            this.ui.showToast('Failed to load data', 'error');
            this.showAuthScreen();
        }
    }
    
    /**
     * Handle authentication failure
     */
    handleAuthFailure(error) {
        console.error('Authentication failed:', error);
        this.ui.showToast(error.message || 'Authentication failed', 'error');
        this.showAuthScreen();
    }
    
    /**
     * Initialize application data
     */
    async initializeData() {
        try {
            // Ensure data project exists
            const dataProjectReady = await this.storage.ensureDataProject(this.api);
            
            if (!dataProjectReady) {
                throw new Error('Failed to initialize data project');
            }
            
            // Load all data
            const data = await this.storage.loadAllData();
            
            // Initialize managers with data
            this.projects.initialize(data.projects || []);
            this.folders.initialize(data.folders || []);
            this.offers.initialize(data.offers || []);
            
            // Update UI
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to initialize data:', error);
            
            // Try to load from cache
            const cachedData = this.storage.getCachedData();
            if (cachedData) {
                this.projects.initialize(cachedData.projects || []);
                this.folders.initialize(cachedData.folders || []);
                this.offers.initialize(cachedData.offers || []);
                this.updateStats();
                
                this.ui.showToast('Using cached data', 'warning');
            } else {
                throw error;
            }
        }
    }
    
    /**
     * Refresh all data
     */
    async refreshData() {
        try {
            this.eventBus.emit('data:sync:start');
            
            // Save current data
            await this.saveAllData();
            
            // Reload from server
            await this.initializeData();
            
            // Refresh current view
            this.refreshCurrentView();
            
            this.eventBus.emit('data:sync:complete');
            
        } catch (error) {
            console.error('Failed to refresh data:', error);
            this.eventBus.emit('data:sync:error', error);
        }
    }
    
    /**
     * Save all data
     */
    async saveAllData() {
        const data = {
            projects: this.projects.getAll(),
            folders: this.folders.getAll(),
            offers: this.offers.getAll(),
            version: CONSTANTS.DATA_VERSION
        };
        
        await this.storage.saveAllData(data, this.api);
    }
    
    /**
     * Update statistics
     */
    updateStats() {
        const stats = {
            totalProjects: this.projects.getCount(),
            activePages: this.projects.getActiveCount(),
            blankPages: this.projects.getBlankCount(),
            totalFolders: this.folders.getCount(),
            protectedFolders: this.folders.getProtectedCount(),
            totalOffers: this.offers.getCount()
        };
        
        this.ui.updateStats(stats);
    }
    
    /**
     * Show auth screen
     */
    showAuthScreen() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('loadingState').style.display = 'none';
    }
    
    /**
     * Show main app
     */
    showMainApp() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('loadingState').style.display = 'none';
        
        // Render header
        this.ui.renderHeader(this.state.teamInfo);
    }
    
    /**
     * Navigate to a view
     */
    navigateToView(view, data = null) {
        this.state.currentView = view;
        
        // Update browser history
        history.pushState({ view, data }, '', `#${view}`);
        
        switch (view) {
            case 'folders':
                this.showFoldersView();
                break;
            case 'folder':
                this.showFolderContent(data);
                break;
            case 'management':
                this.showManagementView();
                break;
            case 'offers':
                this.showOffersView();
                break;
        }
    }
    
    /**
     * Show folders view
     */
    showFoldersView() {
        this.state.currentView = 'folders';
        this.state.selectedFolder = null;
        
        const folders = this.folders.getAvailable();
        const unassignedCount = this.projects.getUnassignedCount();
        
        this.ui.showFoldersView(folders, unassignedCount);
        this.updateStats();
    }
    
    /**
     * Show folder content
     */
    showFolderContent(folderName) {
        this.state.currentView = 'folder';
        this.state.selectedFolder = folderName;
        
        const projects = folderName === 'Unassigned' 
            ? this.projects.getUnassigned()
            : this.projects.getByFolder(folderName);
        
        this.ui.showFolderContent(folderName, projects);
    }
    
    /**
     * Show management view
     */
    showManagementView() {
        this.state.currentView = 'management';
        
        const folders = this.folders.getAll();
        this.ui.showManagementView(folders);
    }
    
    /**
     * Show offers view
     */
    showOffersView() {
        this.state.currentView = 'offers';
        
        const offers = this.offers.getAll();
        this.ui.showOffersView(offers);
    }
    
    /**
     * Refresh current view
     */
    refreshCurrentView() {
        switch (this.state.currentView) {
            case 'folders':
                this.showFoldersView();
                break;
            case 'folder':
                if (this.state.selectedFolder) {
                    this.showFolderContent(this.state.selectedFolder);
                }
                break;
            case 'management':
                this.showManagementView();
                break;
            case 'offers':
                this.showOffersView();
                break;
        }
    }
    
    /**
     * Clean up before app closes
     */
    cleanup() {
        // Save any pending data
        this.storage.saveCachedData({
            projects: this.projects.getAll(),
            folders: this.folders.getAll(),
            offers: this.offers.getAll()
        });
        
        // Clean up event listeners
        this.eventBus.removeAllListeners();
    }
}

// Export for global access if needed
window.VercelDeployApp = App;