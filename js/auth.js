/**
 * Authentication Manager
 * Handles Vercel token validation and team detection
 */

import { CONSTANTS } from '../config/constants.js';

export class AuthManager {
    constructor(apiClient, storage, ui, eventBus) {
        this.api = apiClient;
        this.storage = storage;
        this.ui = ui;
        this.eventBus = eventBus;
        
        this.token = null;
        this.teamId = null;
        this.teamName = null;
        this.user = null;
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Auth form submission
        const tokenInput = document.getElementById('vercelToken');
        const saveBtn = document.getElementById('saveTokenBtn');
        
        if (tokenInput) {
            tokenInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticate();
                }
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.authenticate());
        }
        
        // Data project override
        const overrideBtn = document.getElementById('overrideDataBtn');
        if (overrideBtn) {
            overrideBtn.addEventListener('click', () => this.overrideDataProject());
        }
    }
    
    /**
     * Authenticate with Vercel token
     */
    async authenticate() {
        const tokenInput = document.getElementById('vercelToken');
        const token = tokenInput?.value?.trim();
        
        if (!token) {
            this.ui.showToast('Please enter your Vercel token', 'error');
            return;
        }
        
        // Validate token format
        if (!CONSTANTS.VALIDATION.TOKEN_PATTERN.test(token)) {
            this.ui.showToast('Invalid token format', 'error');
            return;
        }
        
        try {
            this.ui.showLoadingState('Connecting to Vercel...');
            
            const result = await this.validateToken(token);
            
            if (result.success) {
                // Save token
                this.storage.set(CONSTANTS.STORAGE_KEYS.TOKEN, token);
                
                // Clear sensitive input
                if (tokenInput) {
                    tokenInput.value = '';
                }
                
                this.eventBus.emit('auth:success', result);
            } else {
                this.eventBus.emit('auth:failure', new Error(result.error));
            }
            
        } catch (error) {
            console.error('Authentication error:', error);
            this.eventBus.emit('auth:failure', error);
        } finally {
            this.ui.hideLoadingState();
        }
    }
    
    /**
     * Validate token with Vercel API
     */
    async validateToken(token) {
        try {
            // Set token in API client
            this.api.setToken(token);
            this.token = token;
            
            // Get user info
            const userData = await this.api.getUser();
            this.user = userData.user;
            
            console.log('User authenticated:', this.user.username || this.user.email);
            
            // Detect team
            const teamInfo = await this.detectTeam();
            
            return {
                success: true,
                user: this.user,
                team: teamInfo
            };
            
        } catch (error) {
            console.error('Token validation failed:', error);
            
            // Clear invalid token
            this.api.setToken(null);
            this.token = null;
            
            return {
                success: false,
                error: error.message || 'Invalid token'
            };
        }
    }
    
    /**
     * Detect team configuration
     */
    async detectTeam() {
        try {
            console.log('Detecting team configuration...');
            
            // First, try to get teams list
            try {
                const teamsData = await this.api.getTeams();
                
                if (teamsData.teams && teamsData.teams.length > 0) {
                    // Use the first team (or could let user choose)
                    const team = teamsData.teams[0];
                    this.teamId = team.id;
                    this.teamName = team.name;
                    
                    // Save team info
                    this.storage.set(CONSTANTS.STORAGE_KEYS.TEAM_ID, this.teamId);
                    this.storage.set(CONSTANTS.STORAGE_KEYS.TEAM_NAME, this.teamName);
                    
                    // Update API client
                    this.api.setTeamId(this.teamId);
                    
                    console.log('Using team:', this.teamName, '(', this.teamId, ')');
                    
                    return {
                        id: this.teamId,
                        name: this.teamName
                    };
                }
            } catch (teamsError) {
                console.log('Teams endpoint failed, checking user data...');
            }
            
            // Check if user data has team info
            if (this.user && this.user.team) {
                this.teamId = this.user.team.id;
                this.teamName = this.user.team.name || 'Team';
                
                // Save team info
                this.storage.set(CONSTANTS.STORAGE_KEYS.TEAM_ID, this.teamId);
                this.storage.set(CONSTANTS.STORAGE_KEYS.TEAM_NAME, this.teamName);
                
                // Update API client
                this.api.setTeamId(this.teamId);
                
                console.log('Using team from user data:', this.teamName, '(', this.teamId, ')');
                
                return {
                    id: this.teamId,
                    name: this.teamName
                };
            }
            
            // Check for cached team info
            const cachedTeamId = this.storage.get(CONSTANTS.STORAGE_KEYS.TEAM_ID);
            if (cachedTeamId) {
                this.teamId = cachedTeamId;
                this.teamName = this.storage.get(CONSTANTS.STORAGE_KEYS.TEAM_NAME) || 'Team';
                
                // Update API client
                this.api.setTeamId(this.teamId);
                
                console.log('Using cached team:', this.teamName, '(', this.teamId, ')');
                
                return {
                    id: this.teamId,
                    name: this.teamName
                };
            }
            
            // No team - personal account
            console.log('No team detected - using personal account');
            this.teamId = null;
            this.teamName = null;
            
            // Clear team info
            this.storage.remove(CONSTANTS.STORAGE_KEYS.TEAM_ID);
            this.storage.remove(CONSTANTS.STORAGE_KEYS.TEAM_NAME);
            
            return null;
            
        } catch (error) {
            console.error('Error detecting team:', error);
            return null;
        }
    }
    
    /**
     * Override data project (for legacy support)
     */
    async overrideDataProject() {
        const input = document.getElementById('dataProjectOverride');
        const projectName = input?.value?.trim();
        
        if (!projectName) {
            this.ui.showToast('Please enter a data project name', 'error');
            return;
        }
        
        // Validate project name
        if (!CONSTANTS.PROJECT.NAME_PATTERN.test(projectName)) {
            this.ui.showToast('Invalid project name format', 'error');
            return;
        }
        
        // Note: This feature exists for backward compatibility
        this.ui.showToast('Note: App now uses "deploydatasave" for all users by default', 'warning');
        
        // Store the override
        this.storage.dataProjectName = projectName.toLowerCase();
        this.storage.dataProjectUrl = `https://${projectName.toLowerCase()}.vercel.app`;
        this.storage.set(CONSTANTS.STORAGE_KEYS.DATA_PROJECT_NAME, projectName.toLowerCase());
        this.storage.set(CONSTANTS.STORAGE_KEYS.DATA_PROJECT_URL, this.storage.dataProjectUrl);
        
        this.ui.showToast('Loading data from specified project...', 'success');
        
        // Reload the app with the new data project
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }
    
    /**
     * Get current team info
     */
    getTeamInfo() {
        if (this.teamId) {
            return {
                id: this.teamId,
                name: this.teamName
            };
        }
        return null;
    }
    
    /**
     * Logout
     */
    logout() {
        // Clear tokens
        this.token = null;
        this.teamId = null;
        this.teamName = null;
        this.user = null;
        
        // Clear storage
        this.storage.remove(CONSTANTS.STORAGE_KEYS.TOKEN);
        this.storage.remove(CONSTANTS.STORAGE_KEYS.TEAM_ID);
        this.storage.remove(CONSTANTS.STORAGE_KEYS.TEAM_NAME);
        
        // Clear API client
        this.api.setToken(null);
        this.api.setTeamId(null);
        
        // Emit logout event
        this.eventBus.emit('auth:logout');
    }
    
    /**
     * Verify admin password
     */
    verifyAdminPassword(password) {
        return password === CONSTANTS.ADMIN.PASSWORD;
    }
    
    /**
     * Create admin session
     */
    createAdminSession() {
        const sessionId = this.generateSessionId();
        const expiresAt = Date.now() + CONSTANTS.ADMIN.SESSION_TIMEOUT;
        
        this.storage.set('adminSession', {
            id: sessionId,
            expiresAt
        });
        
        return sessionId;
    }
    
    /**
     * Verify admin session
     */
    verifyAdminSession() {
        const session = this.storage.get('adminSession');
        
        if (!session) return false;
        
        if (Date.now() > session.expiresAt) {
            this.storage.remove('adminSession');
            return false;
        }
        
        return true;
    }
    
    /**
     * Generate session ID
     */
    generateSessionId() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}