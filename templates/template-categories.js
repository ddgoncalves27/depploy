/**
 * Template Category Metadata
 * Extended information about template categories
 */

export const templateCategories = {
    comingSoon: {
        name: '🚀 Coming Soon',
        description: 'Landing pages for upcoming launches',
        icon: 'rocket',
        color: '#667eea',
        tags: ['landing', 'launch', 'announcement', 'teaser'],
        useCases: [
            'Product launches',
            'Website announcements',
            'Event teasers',
            'Pre-launch campaigns'
        ]
    },
    
    maintenance: {
        name: '🔧 Maintenance',
        description: 'Maintenance mode pages',
        icon: 'wrench',
        color: '#10B981',
        tags: ['maintenance', 'downtime', 'update', 'service'],
        useCases: [
            'Scheduled maintenance',
            'System updates',
            'Service interruptions',
            'Emergency downtime'
        ]
    },
    
    error404: {
        name: '👾 404 Page',
        description: 'Page not found errors',
        icon: 'alien',
        color: '#EF4444',
        tags: ['error', '404', 'not-found', 'missing'],
        useCases: [
            'Missing pages',
            'Broken links',
            'Deleted content',
            'URL errors'
        ]
    },
    
    construction: {
        name: '🏗️ Construction',
        description: 'Under construction pages',
        icon: 'construction',
        color: '#F59E0B',
        tags: ['construction', 'building', 'development', 'wip'],
        useCases: [
            'Site development',
            'Feature building',
            'Beta testing',
            'Work in progress'
        ]
    },
    
    loading: {
        name: '⏳ Loading',
        description: 'Loading and progress pages',
        icon: 'hourglass',
        color: '#8B5CF6',
        tags: ['loading', 'progress', 'wait', 'processing'],
        useCases: [
            'Data processing',
            'File uploads',
            'Background tasks',
            'Long operations'
        ]
    },
    
    offline: {
        name: '🌊 Offline',
        description: 'Offline status pages',
        icon: 'wave',
        color: '#3B82F6',
        tags: ['offline', 'disconnected', 'no-internet', 'network'],
        useCases: [
            'Network errors',
            'Connection issues',
            'Offline mode',
            'Service unavailable'
        ]
    },
    
    beta: {
        name: '✨ Beta',
        description: 'Beta version announcements',
        icon: 'sparkles',
        color: '#EC4899',
        tags: ['beta', 'preview', 'early-access', 'testing'],
        useCases: [
            'Beta programs',
            'Early access',
            'Feature previews',
            'Testing phases'
        ]
    },
    
    scheduled: {
        name: '🕐 Scheduled',
        description: 'Scheduled launch pages',
        icon: 'clock',
        color: '#14B8A6',
        tags: ['scheduled', 'countdown', 'timer', 'launch'],
        useCases: [
            'Timed releases',
            'Event countdowns',
            'Launch dates',
            'Scheduled content'
        ]
    }
};

/**
 * Get category metadata
 */
export function getCategoryMetadata(categoryId) {
    return templateCategories[categoryId] || null;
}

/**
 * Get all category IDs
 */
export function getAllCategoryIds() {
    return Object.keys(templateCategories);
}

/**
 * Get categories by tag
 */
export function getCategoriesByTag(tag) {
    const results = [];
    
    Object.entries(templateCategories).forEach(([id, category]) => {
        if (category.tags.includes(tag.toLowerCase())) {
            results.push({
                id,
                ...category
            });
        }
    });
    
    return results;
}

/**
 * Get category color
 */
export function getCategoryColor(categoryId) {
    return templateCategories[categoryId]?.color || '#6B7280';
}

/**
 * Get category icon
 */
export function getCategoryIcon(categoryId) {
    return templateCategories[categoryId]?.icon || 'folder';
}

/**
 * Get recommended category for use case
 */
export function getRecommendedCategory(useCase) {
    const useCaseLower = useCase.toLowerCase();
    
    for (const [id, category] of Object.entries(templateCategories)) {
        for (const categoryUseCase of category.useCases) {
            if (categoryUseCase.toLowerCase().includes(useCaseLower)) {
                return id;
            }
        }
    }
    
    // Default to coming soon for general use
    return 'comingSoon';
}

/**
 * Get all unique tags
 */
export function getAllTags() {
    const tags = new Set();
    
    Object.values(templateCategories).forEach(category => {
        category.tags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags).sort();
}