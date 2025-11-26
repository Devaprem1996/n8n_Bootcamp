/**
 * Global Application State
 */

export const appState = {
    currentUser: null,
    currentCategory: 'n8n', // Default category
    categories: ['n8n', 'vibe-coding', 'prompt-engineering', 'ai-developments-tools'],

    // Progress cache for each category
    progress: {
        'n8n': createEmptyProgress(),
        'vibe-coding': createEmptyProgress(),
        'prompt-engineering': createEmptyProgress(),
        'ai-developments-tools': createEmptyProgress()
    },

    isInitialized: false,
    saveTimeout: null
};

function createEmptyProgress() {
    return {
        completedTasks: Array(9).fill(false),
        taskNotes: {},
        progressPercent: 0,
        cohort: 'default'
    };
}

// Getters and Setters
export function getCurrentUser() {
    return appState.currentUser;
}

export function setCurrentUser(user) {
    appState.currentUser = user;
}

export function getCurrentCategory() {
    return appState.currentCategory;
}

export function setCurrentCategory(category) {
    if (appState.categories.includes(category)) {
        appState.currentCategory = category;
    }
}

export function getProgress(category = appState.currentCategory) {
    return appState.progress[category];
}

export function setProgress(category, data) {
    if (appState.progress[category]) {
        appState.progress[category] = { ...appState.progress[category], ...data };
    }
}

export function getAutoSaveTimeout() {
    return appState.saveTimeout;
}

export function setAutoSaveTimeout(timeout) {
    appState.saveTimeout = timeout;
}
