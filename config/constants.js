/**
 * Application Constants and Configuration
 */

export const CONSTANTS = {
    // Application Info
    APP_NAME: 'Vercel Deploy',
    APP_VERSION: '2.0.0',
    DATA_VERSION: '1.0.0',
    
    // API Configuration
    API: {
        BASE_URL: 'https://api.vercel.com',
        ENDPOINTS: {
            USER: '/v2/user',
            TEAMS: '/v2/teams',
            PROJECTS: '/v9/projects',
            DEPLOYMENTS: '/v13/deployments',
            DOMAINS: '/v5/domains',
            PROJECT_DOMAINS: '/v10/projects/{projectName}/domains'
        },
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },
    
    // Data Project Configuration
    DATA_PROJECT: {
        NAME: 'deploydatasave',
        URL: 'https://deploydatasave.vercel.app',
        FILE_NAME: 'data.json',
        DEPLOYMENT_DELAY: 2000 // Wait 2 seconds for deployment
    },
    
    // Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'vercelToken',
        TEAM_ID: 'vercelTeamId',
        TEAM_NAME: 'vercelTeamName',
        CACHED_DATA: 'vercelDeployData',
        DATA_PROJECT_NAME: 'userDataProjectName',
        DATA_PROJECT_URL: 'userDataProjectUrl'
    },
    
    // Admin Configuration
    ADMIN: {
        PASSWORD: '1511',
        SESSION_TIMEOUT: 3600000 // 1 hour
    },
    
    // UI Configuration
    UI: {
        TOAST_DURATION: 3000,
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 500,
        ITEMS_PER_PAGE: 50,
        MAX_NAME_LENGTH: 50,
        MAX_DESCRIPTION_LENGTH: 200
    },
    
    // Project Configuration
    PROJECT: {
        NAME_PATTERN: /^[a-z0-9-]+$/,
        MIN_NAME_LENGTH: 3,
        MAX_NAME_LENGTH: 63,
        DEFAULT_TEMPLATE: 'blank',
        RESERVED_NAMES: ['api', 'app', 'www', 'admin', 'dashboard', 'vercel']
    },
    
    // Folder Configuration
    FOLDER: {
        SPECIAL_FOLDERS: ['Offers', 'Unassigned'],
        MAX_NAME_LENGTH: 50,
        MIN_PASSWORD_LENGTH: 4
    },
    
    // Template Categories
    TEMPLATE_CATEGORIES: {
        comingSoon: {
            name: '🚀 Coming Soon',
            description: 'Landing pages for upcoming launches'
        },
        maintenance: {
            name: '🔧 Maintenance',
            description: 'Maintenance mode pages'
        },
        error404: {
            name: '👾 404 Page',
            description: 'Page not found errors'
        },
        construction: {
            name: '🏗️ Construction',
            description: 'Under construction pages'
        },
        loading: {
            name: '⏳ Loading',
            description: 'Loading and progress pages'
        },
        offline: {
            name: '🌊 Offline',
            description: 'Offline status pages'
        },
        beta: {
            name: '✨ Beta',
            description: 'Beta version announcements'
        },
        scheduled: {
            name: '🕐 Scheduled',
            description: 'Scheduled launch pages'
        }
    },
    
    // Error Messages
    ERRORS: {
        NETWORK: 'Network error. Please check your connection.',
        AUTH_FAILED: 'Authentication failed. Please check your token.',
        PROJECT_EXISTS: 'A project with this name already exists.',
        INVALID_NAME: 'Invalid name. Use only lowercase letters, numbers, and hyphens.',
        DEPLOYMENT_FAILED: 'Failed to deploy project. Please try again.',
        DATA_SYNC_FAILED: 'Failed to sync data. Using local cache.',
        FOLDER_EXISTS: 'A folder with this name already exists.',
        PASSWORD_TOO_SHORT: 'Password must be at least 4 characters.',
        TEMPLATE_INVALID: 'Invalid template HTML.',
        PERMISSION_DENIED: 'You do not have permission to perform this action.'
    },
    
    // Success Messages
    SUCCESS: {
        PROJECT_CREATED: 'Project created successfully!',
        PROJECT_UPDATED: 'Project updated successfully!',
        PROJECT_DELETED: 'Project deleted successfully!',
        FOLDER_CREATED: 'Folder created successfully!',
        FOLDER_UPDATED: 'Folder updated successfully!',
        FOLDER_DELETED: 'Folder deleted successfully!',
        TEMPLATE_CREATED: 'Template created successfully!',
        TEMPLATE_UPDATED: 'Template updated successfully!',
        TEMPLATE_DELETED: 'Template deleted successfully!',
        DATA_SYNCED: 'Data synced successfully!',
        COPIED_TO_CLIPBOARD: 'Copied to clipboard!'
    },
    
    // Validation Rules
    VALIDATION: {
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        URL_PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        TOKEN_PATTERN: /^[a-zA-Z0-9_-]+$/,
        HTML_MIN_LENGTH: 50,
        HTML_MAX_LENGTH: 1000000 // 1MB
    },
    
    // Feature Flags
    FEATURES: {
        CUSTOM_DOMAINS: true,
        TEAM_SUPPORT: true,
        BULK_OPERATIONS: true,
        TEMPLATE_PREVIEW: true,
        AUTO_SYNC: true,
        OFFLINE_MODE: true
    },
    
    // Rate Limiting
    RATE_LIMITS: {
        API_CALLS_PER_MINUTE: 60,
        DEPLOYMENTS_PER_HOUR: 100,
        PROJECTS_PER_ACCOUNT: 200
    },
    
    // Cache Configuration
    CACHE: {
        TTL: 300000, // 5 minutes
        MAX_SIZE: 10485760, // 10MB
        STRATEGY: 'LRU' // Least Recently Used
    }
};

// Freeze the constants object to prevent modifications
Object.freeze(CONSTANTS);
Object.freeze(CONSTANTS.API);
Object.freeze(CONSTANTS.API.ENDPOINTS);
Object.freeze(CONSTANTS.DATA_PROJECT);
Object.freeze(CONSTANTS.STORAGE_KEYS);
Object.freeze(CONSTANTS.ADMIN);
Object.freeze(CONSTANTS.UI);
Object.freeze(CONSTANTS.PROJECT);
Object.freeze(CONSTANTS.FOLDER);
Object.freeze(CONSTANTS.TEMPLATE_CATEGORIES);
Object.freeze(CONSTANTS.ERRORS);
Object.freeze(CONSTANTS.SUCCESS);
Object.freeze(CONSTANTS.VALIDATION);
Object.freeze(CONSTANTS.FEATURES);
Object.freeze(CONSTANTS.RATE_LIMITS);
Object.freeze(CONSTANTS.CACHE);