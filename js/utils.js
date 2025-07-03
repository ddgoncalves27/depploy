/**
 * Utility Functions and Classes
 */

import { CONSTANTS } from '../config/constants.js';

/**
 * Event Bus for application-wide event handling
 */
export class EventBus {
    constructor() {
        this.events = new Map();
    }
    
    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }
    
    /**
     * Subscribe to an event (only once)
     */
    once(event, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(event, wrapper);
        };
        
        return this.on(event, wrapper);
    }
    
    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        
        if (index > -1) {
            callbacks.splice(index, 1);
        }
        
        if (callbacks.length === 0) {
            this.events.delete(event);
        }
    }
    
    /**
     * Emit an event
     */
    emit(event, ...args) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        callbacks.forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }
    
    /**
     * Remove all listeners for an event
     */
    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}

/**
 * Generate a unique project name
 */
export function generateProjectName() {
    // Components for creating unique combinations
    const prefixes = ['x', 'z', 'q', 'j', 'v', 'w', 'y', 'k'];
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'];
    const endings = ['ix', 'ax', 'ox', 'ux', 'ex', 'yx', 'az', 'ez', 'iz', 'oz', 'uz', 'yz'];
    
    // Generate a truly unique name using timestamp + random components
    const timestamp = Date.now().toString(36); // Base36 timestamp
    const randomPart = Math.random().toString(36).substring(2, 5); // 3 random chars
    
    // Create patterns
    const patterns = [
        () => {
            // Pattern 1: prefix + timestamp + ending
            const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
            const end = endings[Math.floor(Math.random() * endings.length)];
            return `${pre}${timestamp}${end}`;
        },
        () => {
            // Pattern 2: consonant + vowel + timestamp
            const c = consonants[Math.floor(Math.random() * consonants.length)];
            const v = vowels[Math.floor(Math.random() * vowels.length)];
            return `${c}${v}${timestamp}`;
        },
        () => {
            // Pattern 3: timestamp + random + ending
            const end = endings[Math.floor(Math.random() * endings.length)];
            return `${timestamp}${randomPart}${end}`;
        },
        () => {
            // Pattern 4: random syllable + timestamp
            const c1 = consonants[Math.floor(Math.random() * consonants.length)];
            const v1 = vowels[Math.floor(Math.random() * vowels.length)];
            const c2 = consonants[Math.floor(Math.random() * consonants.length)];
            return `${c1}${v1}${c2}${timestamp}`;
        },
        () => {
            // Pattern 5: unique combo with counter
            const uniqueId = `${timestamp}${performance.now().toString(36).replace('.', '')}`;
            return uniqueId.substring(0, 12);
        }
    ];
    
    // Select random pattern
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    let name = pattern();
    
    // Ensure it starts with a letter (Vercel requirement)
    if (!/^[a-z]/.test(name)) {
        const letter = consonants[Math.floor(Math.random() * consonants.length)];
        name = letter + name;
    }
    
    // Clean and trim to reasonable length
    name = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (name.length > CONSTANTS.PROJECT.MAX_NAME_LENGTH) {
        name = name.substring(0, CONSTANTS.PROJECT.MAX_NAME_LENGTH);
    }
    
    if (name.length < CONSTANTS.PROJECT.MIN_NAME_LENGTH) {
        name = name + randomPart;
    }
    
    return name;
}

/**
 * Get time ago string
 */
export function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
}

/**
 * Format date
 */
export function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString();
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } else if (format === 'time') {
        return d.toLocaleTimeString();
    } else {
        return d.toLocaleString();
    }
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

/**
 * Clean URL
 */
export function cleanUrl(url) {
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

/**
 * Validate project name
 */
export function validateProjectName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: 'Project name is required' };
    }
    
    if (name.length < CONSTANTS.PROJECT.MIN_NAME_LENGTH) {
        return { valid: false, error: `Name must be at least ${CONSTANTS.PROJECT.MIN_NAME_LENGTH} characters` };
    }
    
    if (name.length > CONSTANTS.PROJECT.MAX_NAME_LENGTH) {
        return { valid: false, error: `Name must be less than ${CONSTANTS.PROJECT.MAX_NAME_LENGTH} characters` };
    }
    
    if (!CONSTANTS.PROJECT.NAME_PATTERN.test(name)) {
        return { valid: false, error: 'Name can only contain lowercase letters, numbers, and hyphens' };
    }
    
    if (CONSTANTS.PROJECT.RESERVED_NAMES.includes(name)) {
        return { valid: false, error: 'This name is reserved' };
    }
    
    return { valid: true };
}

/**
 * Sanitize HTML (basic)
 */
export function sanitizeHtml(html) {
    // This is a basic sanitizer - for production use a library like DOMPurify
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Generate unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Merge objects deeply
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Sort array of objects by key
 */
export function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Group array of objects by key
 */
export function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
        return groups;
    }, {});
}

/**
 * Chunk array into smaller arrays
 */
export function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Get query parameters from URL
 */
export function getQueryParams() {
    const params = {};
    const searchParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of searchParams.entries()) {
        params[key] = value;
    }
    
    return params;
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if running in development mode
 */
export function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('.local');
}

/**
 * Logger utility
 */
export const logger = {
    log: (...args) => {
        if (isDevelopment() || window.DEBUG) {
            console.log('[VercelDeploy]', ...args);
        }
    },
    
    error: (...args) => {
        console.error('[VercelDeploy]', ...args);
    },
    
    warn: (...args) => {
        if (isDevelopment() || window.DEBUG) {
            console.warn('[VercelDeploy]', ...args);
        }
    },
    
    info: (...args) => {
        if (isDevelopment() || window.DEBUG) {
            console.info('[VercelDeploy]', ...args);
        }
    }
};