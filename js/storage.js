/**
 * Storage Manager
 * Handles data persistence, caching, and synchronization with Vercel
 */

import { CONSTANTS } from '../config/constants.js';

export class StorageManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.dataProjectName = CONSTANTS.DATA_PROJECT.NAME;
        this.dataProjectUrl = CONSTANTS.DATA_PROJECT.URL;
    }
    
    // ===== Local Storage Methods =====
    
    /**
     * Get value from localStorage
     */
    get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return null;
        }
    }
    
    /**
     * Set value in localStorage
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.clearOldData();
                // Try again
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch {
                    return false;
                }
            }
            
            return false;
        }
    }
    
    /**
     * Remove value from localStorage
     */
    remove(key) {
        localStorage.removeItem(key);
    }
    
    /**
     * Clear old data when storage is full
     */
    clearOldData() {
        // Remove non-essential items
        const essentialKeys = [
            CONSTANTS.STORAGE_KEYS.TOKEN,
            CONSTANTS.STORAGE_KEYS.TEAM_ID,
            CONSTANTS.STORAGE_KEYS.TEAM_NAME
        ];
        
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (!essentialKeys.includes(key)) {
                localStorage.removeItem(key);
            }
        });
    }
    
    // ===== Cache Methods =====
    
    /**
     * Get value from cache
     */
    getFromCache(key) {
        const timestamp = this.cacheTimestamps.get(key);
        
        if (timestamp && Date.now() - timestamp < CONSTANTS.CACHE.TTL) {
            return this.cache.get(key);
        }
        
        // Cache expired
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
        return null;
    }
    
    /**
     * Set value in cache
     */
    setInCache(key, value) {
        // Check cache size
        if (this.getCacheSize() > CONSTANTS.CACHE.MAX_SIZE) {
            this.evictOldestCacheEntry();
        }
        
        this.cache.set(key, value);
        this.cacheTimestamps.set(key, Date.now());
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }
    
    /**
     * Get cache size in bytes (approximate)
     */
    getCacheSize() {
        let size = 0;
        for (const value of this.cache.values()) {
            size += JSON.stringify(value).length * 2; // Unicode chars = 2 bytes
        }
        return size;
    }
    
    /**
     * Evict oldest cache entry (LRU)
     */
    evictOldestCacheEntry() {
        let oldestKey = null;
        let oldestTime = Date.now();
        
        for (const [key, timestamp] of this.cacheTimestamps.entries()) {
            if (timestamp < oldestTime) {
                oldestTime = timestamp;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            this.cacheTimestamps.delete(oldestKey);
        }
    }
    
    // ===== Data Project Methods =====
    
    /**
     * Ensure data project exists
     */
    async ensureDataProject(apiClient) {
        try {
            // Try to get the project
            const project = await apiClient.getProject(this.dataProjectName);
            console.log('Data project exists:', project.name);
            return true;
            
        } catch (error) {
            if (error.status === 404) {
                // Project doesn't exist, create it
                console.log('Creating data project...');
                
                try {
                    await apiClient.createProject(this.dataProjectName);
                    
                    // Deploy initial data structure
                    const initialData = {
                        projects: [],
                        folders: [{ name: 'Offers', special: true, icon: 'offers' }],
                        offers: [],
                        version: CONSTANTS.DATA_VERSION
                    };
                    
                    await this.deployData(initialData, apiClient);
                    return true;
                    
                } catch (createError) {
                    console.error('Failed to create data project:', createError);
                    
                    // Check if it's a name conflict (another user might have created it)
                    if (createError.message && createError.message.includes('already exists')) {
                        return true; // Assume it's the shared project
                    }
                    
                    return false;
                }
            }
            
            console.error('Failed to check data project:', error);
            return false;
        }
    }
    
    /**
     * Deploy data to Vercel
     */
    async deployData(data, apiClient) {
        const deploymentData = {
            name: this.dataProjectName,
            files: [{
                file: CONSTANTS.DATA_PROJECT.FILE_NAME,
                data: JSON.stringify(data, null, 2)
            }],
            target: 'production',
            public: true
        };
        
        const deployment = await apiClient.createDeployment(deploymentData);
        
        // Don't wait for deployment to be ready - happens in background
        console.log('Data deployment created:', deployment.id);
        
        return deployment;
    }
    
    /**
     * Load data from Vercel
     */
    async loadDataFromVercel() {
        try {
            // Add cache buster to avoid stale data
            const url = `${this.dataProjectUrl}/${CONSTANTS.DATA_PROJECT.FILE_NAME}?t=${Date.now()}`;
            
            // Check cache first
            const cachedData = this.getFromCache(url);
            if (cachedData) {
                return cachedData;
            }
            
            // Add delay to ensure deployment is ready
            await new Promise(resolve => setTimeout(resolve, CONSTANTS.DATA_PROJECT.DEPLOYMENT_DELAY));
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!this.validateDataStructure(data)) {
                throw new Error('Invalid data structure');
            }
            
            // Cache the data
            this.setInCache(url, data);
            
            return data;
            
        } catch (error) {
            console.error('Failed to load data from Vercel:', error);
            
            // Try without cache buster
            try {
                const response = await fetch(`${this.dataProjectUrl}/${CONSTANTS.DATA_PROJECT.FILE_NAME}`);
                if (response.ok) {
                    const data = await response.json();
                    if (this.validateDataStructure(data)) {
                        return data;
                    }
                }
            } catch {
                // Ignore secondary error
            }
            
            throw error;
        }
    }
    
    /**
     * Validate data structure
     */
    validateDataStructure(data) {
        return data 
            && typeof data === 'object'
            && Array.isArray(data.projects)
            && Array.isArray(data.folders)
            && Array.isArray(data.offers);
    }
    
    // ===== Main Data Operations =====
    
    /**
     * Load all data (from cache or Vercel)
     */
    async loadAllData() {
        try {
            // Try to load from Vercel
            const data = await this.loadDataFromVercel();
            
            // Save to cache
            this.saveCachedData(data);
            
            return data;
            
        } catch (error) {
            console.error('Failed to load from Vercel, using cache:', error);
            
            // Fall back to cached data
            const cachedData = this.getCachedData();
            if (cachedData) {
                return cachedData;
            }
            
            // Return default structure
            return {
                projects: [],
                folders: [{ name: 'Offers', special: true, icon: 'offers' }],
                offers: []
            };
        }
    }
    
    /**
     * Save all data
     */
    async saveAllData(data, apiClient) {
        // Save to cache immediately
        this.saveCachedData(data);
        
        try {
            // Deploy to Vercel
            await this.deployData(data, apiClient);
            return true;
        } catch (error) {
            console.error('Failed to save to Vercel:', error);
            throw error;
        }
    }
    
    /**
     * Get cached data
     */
    getCachedData() {
        const cached = this.get(CONSTANTS.STORAGE_KEYS.CACHED_DATA);
        
        if (cached && this.validateDataStructure(cached)) {
            // Clean project URLs
            if (cached.projects) {
                cached.projects.forEach(project => {
                    if (project.url) {
                        project.url = this.cleanUrl(project.url);
                    }
                    if (project.actualUrl) {
                        project.actualUrl = this.cleanUrl(project.actualUrl);
                    }
                });
            }
            
            return cached;
        }
        
        return null;
    }
    
    /**
     * Save cached data
     */
    saveCachedData(data) {
        const dataToCache = {
            ...data,
            cachedAt: Date.now()
        };
        
        this.set(CONSTANTS.STORAGE_KEYS.CACHED_DATA, dataToCache);
    }
    
    /**
     * Clean URL
     */
    cleanUrl(url) {
        if (!url) return '';
        
        // Remove any protocol if present
        let cleaned = url.replace(/^https?:\/\//, '');
        
        // Remove any path, query parameters, or fragments
        cleaned = cleaned.split('/')[0];
        cleaned = cleaned.split('?')[0];
        cleaned = cleaned.split('#')[0];
        
        // Remove trailing dots or slashes
        cleaned = cleaned.replace(/[.\/]+$/, '');
        
        // Add https:// back
        if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
            cleaned = `https://${cleaned}`;
        }
        
        return cleaned;
    }
    
    // ===== Import/Export Methods =====
    
    /**
     * Export data as JSON
     */
    exportData(data) {
        const exportData = {
            ...data,
            exportedAt: new Date().toISOString(),
            version: CONSTANTS.DATA_VERSION
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vercel-deploy-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Import data from JSON
     */
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!this.validateDataStructure(data)) {
                        throw new Error('Invalid data structure');
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
}