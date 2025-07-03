/**
 * Vercel API Client
 * Handles all communication with Vercel's API
 */

import { CONSTANTS } from '../config/constants.js';

export class ApiClient {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.token = null;
        this.teamId = null;
        this.requestQueue = [];
        this.rateLimitRemaining = CONSTANTS.RATE_LIMITS.API_CALLS_PER_MINUTE;
        this.rateLimitReset = Date.now() + 60000;
    }
    
    /**
     * Set authentication token
     */
    setToken(token) {
        this.token = token;
    }
    
    /**
     * Set team ID
     */
    setTeamId(teamId) {
        this.teamId = teamId;
    }
    
    /**
     * Get team query parameter
     */
    getTeamQuery() {
        return this.teamId ? `?teamId=${this.teamId}` : '';
    }
    
    /**
     * Make an API request with retry logic
     */
    async request(endpoint, options = {}) {
        if (!this.token) {
            throw new Error('Authentication token not set');
        }
        
        // Check rate limit
        await this.checkRateLimit();
        
        const url = endpoint.startsWith('http') 
            ? endpoint 
            : `${CONSTANTS.API.BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        const requestOptions = { ...defaultOptions, ...options };
        
        let lastError;
        for (let attempt = 0; attempt < CONSTANTS.API.RETRY_ATTEMPTS; attempt++) {
            try {
                const response = await fetch(url, requestOptions);
                
                // Update rate limit info
                this.updateRateLimit(response);
                
                if (!response.ok) {
                    const errorData = await this.parseErrorResponse(response);
                    
                    // Don't retry on client errors (4xx)
                    if (response.status >= 400 && response.status < 500) {
                        throw new ApiError(errorData.message, response.status, errorData);
                    }
                    
                    // Retry on server errors (5xx)
                    throw new ApiError(errorData.message, response.status, errorData);
                }
                
                return await response.json();
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on client errors
                if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                    throw error;
                }
                
                // Wait before retrying
                if (attempt < CONSTANTS.API.RETRY_ATTEMPTS - 1) {
                    await this.delay(CONSTANTS.API.RETRY_DELAY * Math.pow(2, attempt));
                }
            }
        }
        
        throw lastError;
    }
    
    /**
     * Parse error response
     */
    async parseErrorResponse(response) {
        try {
            const data = await response.json();
            return {
                message: data.error?.message || data.message || 'Unknown error',
                code: data.error?.code || data.code,
                details: data
            };
        } catch {
            return {
                message: `HTTP ${response.status}: ${response.statusText}`,
                code: response.status
            };
        }
    }
    
    /**
     * Check and enforce rate limits
     */
    async checkRateLimit() {
        if (Date.now() > this.rateLimitReset) {
            this.rateLimitRemaining = CONSTANTS.RATE_LIMITS.API_CALLS_PER_MINUTE;
            this.rateLimitReset = Date.now() + 60000;
        }
        
        if (this.rateLimitRemaining <= 0) {
            const waitTime = this.rateLimitReset - Date.now();
            this.eventBus.emit('api:rateLimit', { waitTime });
            await this.delay(waitTime);
        }
        
        this.rateLimitRemaining--;
    }
    
    /**
     * Update rate limit information from response headers
     */
    updateRateLimit(response) {
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const reset = response.headers.get('X-RateLimit-Reset');
        
        if (remaining) {
            this.rateLimitRemaining = parseInt(remaining, 10);
        }
        
        if (reset) {
            this.rateLimitReset = parseInt(reset, 10) * 1000;
        }
    }
    
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ===== User & Team Methods =====
    
    /**
     * Get current user information
     */
    async getUser() {
        return this.request(CONSTANTS.API.ENDPOINTS.USER);
    }
    
    /**
     * Get teams
     */
    async getTeams() {
        return this.request(CONSTANTS.API.ENDPOINTS.TEAMS);
    }
    
    // ===== Project Methods =====
    
    /**
     * List all projects
     */
    async listProjects() {
        return this.request(`${CONSTANTS.API.ENDPOINTS.PROJECTS}${this.getTeamQuery()}`);
    }
    
    /**
     * Get a specific project
     */
    async getProject(projectName) {
        return this.request(`${CONSTANTS.API.ENDPOINTS.PROJECTS}/${projectName}${this.getTeamQuery()}`);
    }
    
    /**
     * Create a new project
     */
    async createProject(name) {
        return this.request(`${CONSTANTS.API.ENDPOINTS.PROJECTS}${this.getTeamQuery()}`, {
            method: 'POST',
            body: JSON.stringify({ name })
        });
    }
    
    /**
     * Delete a project
     */
    async deleteProject(projectName) {
        return this.request(`${CONSTANTS.API.ENDPOINTS.PROJECTS}/${projectName}${this.getTeamQuery()}`, {
            method: 'DELETE'
        });
    }
    
    // ===== Deployment Methods =====
    
    /**
     * Create a deployment
     */
    async createDeployment(deploymentData) {
        return this.request(`${CONSTANTS.API.ENDPOINTS.DEPLOYMENTS}${this.getTeamQuery()}`, {
            method: 'POST',
            body: JSON.stringify(deploymentData)
        });
    }
    
    /**
     * Get deployment status
     */
    async getDeployment(deploymentId) {
        return this.request(`${CONSTANTS.API.ENDPOINTS.DEPLOYMENTS}/${deploymentId}${this.getTeamQuery()}`);
    }
    
    /**
     * Wait for deployment to be ready
     */
    async waitForDeployment(deploymentId, maxWait = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWait) {
            try {
                const deployment = await this.getDeployment(deploymentId);
                
                if (deployment.readyState === 'READY') {
                    return deployment;
                }
                
                if (deployment.readyState === 'ERROR') {
                    throw new Error('Deployment failed');
                }
                
                await this.delay(2000);
            } catch (error) {
                if (Date.now() - startTime >= maxWait) {
                    throw new Error('Deployment timeout');
                }
                throw error;
            }
        }
        
        throw new Error('Deployment timeout');
    }
    
    // ===== Domain Methods =====
    
    /**
     * List available domains
     */
    async listDomains() {
        return this.request(`${CONSTANTS.API.ENDPOINTS.DOMAINS}${this.getTeamQuery()}`);
    }
    
    /**
     * Add domain to project
     */
    async addDomainToProject(projectName, domainName) {
        const endpoint = CONSTANTS.API.ENDPOINTS.PROJECT_DOMAINS.replace('{projectName}', projectName);
        return this.request(`${endpoint}${this.getTeamQuery()}`, {
            method: 'POST',
            body: JSON.stringify({ name: domainName })
        });
    }
    
    /**
     * Remove domain from project
     */
    async removeDomainFromProject(projectName, domainName) {
        const endpoint = CONSTANTS.API.ENDPOINTS.PROJECT_DOMAINS.replace('{projectName}', projectName);
        return this.request(`${endpoint}/${domainName}${this.getTeamQuery()}`, {
            method: 'DELETE'
        });
    }
    
    // ===== Batch Operations =====
    
    /**
     * Delete multiple projects
     */
    async deleteMultipleProjects(projectNames, onProgress) {
        const results = {
            succeeded: [],
            failed: []
        };
        
        for (let i = 0; i < projectNames.length; i++) {
            const projectName = projectNames[i];
            
            try {
                await this.deleteProject(projectName);
                results.succeeded.push(projectName);
            } catch (error) {
                results.failed.push({ projectName, error: error.message });
            }
            
            if (onProgress) {
                onProgress(i + 1, projectNames.length, projectName);
            }
        }
        
        return results;
    }
    
    /**
     * Deploy to multiple projects
     */
    async deployToMultipleProjects(projects, deploymentData, onProgress) {
        const results = {
            succeeded: [],
            failed: []
        };
        
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            
            try {
                const deployment = await this.createDeployment({
                    ...deploymentData,
                    name: project.name
                });
                
                results.succeeded.push({ project: project.name, deployment });
            } catch (error) {
                results.failed.push({ project: project.name, error: error.message });
            }
            
            if (onProgress) {
                onProgress(i + 1, projects.length, project.name);
            }
        }
        
        return results;
    }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(message, status, details = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}