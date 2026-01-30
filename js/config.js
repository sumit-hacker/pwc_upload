// Configuration for PPU CMS Frontend
// This file contains environment-specific settings

const CONFIG = {
    // API Base URL - Change this for deployment
    // Local development: 'http://localhost:5000/api'
    // Production: 'https://YOUR-BACKEND.azurewebsites.net/api'
    // For Azure Static Web Apps with API proxy: '/api'
    API_BASE_URL: '/api',

    // Application settings
    APP_NAME: 'PPU Complaint Management System',
    APP_VERSION: '1.0.0',

    // File upload limits
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_FILES: 5,

    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds

    // URLs
    HOME_URL: '/',
    COMPLAINT_FORM_URL: '/complaint-form.html',
    TRACK_COMPLAINT_URL: '/track-complaint.html',
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
