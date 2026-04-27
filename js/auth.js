/**
 * Authentication logic for MSCCS Practical Site
 * Password: MSCCS
 */

const AUTH_KEY = 'msc_auth_status';
const CORRECT_PASSWORD = 'MSCCS';

/**
 * Check if the user is currently authenticated
 * @returns {boolean}
 */
function isUserAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
}

/**
 * Attempt to log in with a password
 * @param {string} password 
 * @returns {boolean} True if successful, false otherwise
 */
function login(password) {
    if (password === CORRECT_PASSWORD) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        return true;
    }
    return false;
}

/**
 * Log out the user
 */
function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.href = 'auth.html';
}

/**
 * Enforce authentication on protected pages
 */
function enforceAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Don't redirect if we're already on the auth page
    if (currentPage === 'auth.html' || currentPage === 'login.html') {
        // If already authenticated and on auth page, go to index
        if (isUserAuthenticated()) {
            window.location.href = 'index.html';
        }
        return;
    }

    if (!isUserAuthenticated()) {
        // Find the relative path to auth.html
        // Since pages can be in subdirectories, we might need to go up
        const depth = window.location.pathname.split('/').length - 1;
        // In a simple static site, it's often easier to use an absolute-ish path or find it
        // For this project, auth.html will be in the root.
        
        // Let's try to find the root by looking for index.html or just use a fixed path if possible
        // A safer way for static sites:
        const pathSegments = window.location.pathname.split('/');
        const isSubPage = pathSegments.some(s => s === 'ai-practical' || s === 'cct-practical' || s === 'DWDM');
        const prefix = isSubPage ? '../' : '';
        
        window.location.href = prefix + 'auth.html';
    }
}
