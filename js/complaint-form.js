// ============================================
// Complaint Form JavaScript
// Handles form validation, navigation, and API integration
// ============================================

// Configuration - Use relative path for Azure Static Web Apps API proxy
// For local development, change to: 'http://localhost:5000/api'
const API_BASE_URL = '/api';

// State Management
let currentStep = 1;
const totalSteps = 5;
let formData = {};
let uploadedFiles = [];
let otpVerified = false;

// Analytics tracking
let formStartTime = null;
let fieldEditCounts = {};
let tabSwitchCount = 0;
let copyPasteCount = 0;
let clickCount = 0;
let keyboardEventCount = 0;
let mouseMovementCount = 0;
let idleTimer = null;
let idleTime = 0;
let activeTime = 0;

// Sub-categories mapping
const subCategories = {
    academic: [
        'Examination Issues',
        'Result/Grade Discrepancies',
        'Curriculum Related',
        'Teaching Quality',
        'Assignment/Project Issues',
        'Attendance Problems',
        'Syllabus Coverage',
        'Study Material Unavailability'
    ],
    infrastructure: [
        'Classroom Facilities',
        'Laboratory Equipment',
        'Library Resources',
        'Internet/Wi-Fi Issues',
        'Electrical Problems',
        'Furniture/Equipment Damage',
        'Cleanliness & Hygiene',
        'Parking Issues'
    ],
    administrative: [
        'Fee Payment Issues',
        'Document Processing Delays',
        'Registration Problems',
        'Certificate/Transcript Delays',
        'Scholarship Issues',
        'ID Card Problems',
        'Admission Related',
        'General Office Work'
    ],
    harassment: [
        'Ragging/Bullying',
        'Sexual Harassment',
        'Discrimination (Caste/Religion/Gender)',
        'Faculty Misconduct',
        'Security Concerns',
        'Threats/Violence',
        'Verbal Abuse',
        'Cyber Bullying'
    ],
    conduct: [
        'Disruptive Behavior',
        'Cheating/Plagiarism',
        'Violation of Dress Code',
        'Unauthorized Activities',
        'Substance Abuse',
        'Property Damage',
        'Code of Conduct Violation',
        'Other Misconduct'
    ],
    other: [
        'Canteen/Food Quality',
        'Transport Services',
        'Hostel Issues',
        'Sports Facilities',
        'Cultural Activities',
        'Health Services',
        'Suggestions for Improvement',
        'General Feedback'
    ]
};

// DOM Elements
const form = document.getElementById('complaintForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.getElementById('progressFill');
const loadingOverlay = document.getElementById('loadingOverlay');
const successModal = document.getElementById('successModal');

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();
    updateProgressBar();
    initializeAnalytics();
    startFormTimer();
});

// ============================================
// Analytics Initialization
// ============================================
function initializeAnalytics() {
    formStartTime = new Date();

    // Track mouse movements
    let mouseMoveThrottle;
    document.addEventListener('mousemove', () => {
        clearTimeout(mouseMoveThrottle);
        mouseMoveThrottle = setTimeout(() => {
            mouseMovementCount++;
        }, 100);
    });

    // Track clicks
    document.addEventListener('click', () => {
        clickCount++;
    });

    // Track keyboard events
    document.addEventListener('keydown', () => {
        keyboardEventCount++;
    });

    // Track copy/paste
    document.addEventListener('paste', () => {
        copyPasteCount++;
    });

    // Track tab visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            tabSwitchCount++;
        }
    });

    // Track idle time
    resetIdleTimer();
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetIdleTimer, true);
    });

    // Track field edits
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('input', (e) => {
            const fieldName = e.target.name || e.target.id;
            if (fieldName) {
                fieldEditCounts[fieldName] = (fieldEditCounts[fieldName] || 0) + 1;
            }
        });
    });
}

function startFormTimer() {
    setInterval(() => {
        if (!document.hidden && formStartTime) {
            activeTime++;
        }
    }, 1000);
}

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        idleTime++;
    }, 3000); // 3 seconds of inactivity
}

// ============================================
// Device & Browser Detection
// ============================================
function getDeviceInfo() {
    const ua = navigator.userAgent;

    // Browser detection
    let browser = 'Unknown';
    let browserVersion = '';

    if (ua.indexOf('Firefox') > -1) {
        browser = 'Firefox';
        browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || '';
    } else if (ua.indexOf('Chrome') > -1) {
        browser = 'Chrome';
        browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || '';
    } else if (ua.indexOf('Safari') > -1) {
        browser = 'Safari';
        browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || '';
    } else if (ua.indexOf('Edge') > -1) {
        browser = 'Edge';
        browserVersion = ua.match(/Edge\/([0-9.]+)/)?.[1] || '';
    }

    // OS detection
    let os = 'Unknown';
    let osVersion = '';

    if (ua.indexOf('Windows NT 10.0') > -1) {
        os = 'Windows';
        osVersion = '10/11';
    } else if (ua.indexOf('Windows NT 6.3') > -1) {
        os = 'Windows';
        osVersion = '8.1';
    } else if (ua.indexOf('Windows NT 6.2') > -1) {
        os = 'Windows';
        osVersion = '8';
    } else if (ua.indexOf('Mac OS X') > -1) {
        os = 'macOS';
        osVersion = ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || '';
    } else if (ua.indexOf('Android') > -1) {
        os = 'Android';
        osVersion = ua.match(/Android ([0-9.]+)/)?.[1] || '';
    } else if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) {
        os = 'iOS';
        osVersion = ua.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || '';
    } else if (ua.indexOf('Linux') > -1) {
        os = 'Linux';
    }

    // Device type
    let device = 'Desktop';
    let deviceModel = '';

    if (/Mobile|Android|iPhone/i.test(ua)) {
        device = 'Mobile';
        if (ua.indexOf('iPhone') > -1) deviceModel = 'iPhone';
        else if (ua.indexOf('iPad') > -1) deviceModel = 'iPad';
        else if (ua.indexOf('Android') > -1) deviceModel = 'Android Device';
    } else if (/Tablet|iPad/i.test(ua)) {
        device = 'Tablet';
    }

    return {
        browser,
        browserVersion,
        os,
        osVersion,
        device,
        deviceModel,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language || navigator.userLanguage,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform
    };
}

// ============================================
// Connection Info
// ============================================
function getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
        return {
            connectionType: connection.type || 'unknown',
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink || 0,
            rtt: connection.rtt || 0
        };
    }

    return {
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0
    };
}

// ============================================
// Geographic Location (with permission)
// ============================================
async function getGeolocation() {
    return new Promise((resolve) => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    console.log('Geolocation error:', error.message);
                    resolve(null);
                },
                { timeout: 5000, enableHighAccuracy: false }
            );
        } else {
            resolve(null);
        }
    });
}

// ============================================
// Form Analytics Data
// ============================================
function getFormAnalytics() {
    const timeToComplete = formStartTime ? Math.floor((new Date() - formStartTime) / 1000) : 0;

    const fieldChanges = Object.keys(fieldEditCounts).map(field => ({
        field,
        changesCount: fieldEditCounts[field]
    }));

    return {
        timeToComplete,
        startedAt: formStartTime,
        submittedAt: new Date(),
        totalEdits: Object.values(fieldEditCounts).reduce((a, b) => a + b, 0),
        fieldChanges,
        tabSwitches: tabSwitchCount,
        copyPasteCount,
        clickCount,
        keyboardEvents: keyboardEventCount,
        idleTime,
        activeTime,
        mouseMovements: mouseMovementCount
    };
}

// ============================================
// Event Listeners
// ============================================
function initializeEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', () => navigateStep(-1));
    nextBtn.addEventListener('click', () => navigateStep(1));
    form.addEventListener('submit', handleFormSubmit);

    // User type selection
    document.querySelectorAll('input[name="userType"]').forEach(radio => {
        radio.addEventListener('change', handleUserTypeChange);
    });

    // Primary category selection
    document.querySelectorAll('input[name="primaryCategory"]').forEach(radio => {
        radio.addEventListener('change', handleCategoryChange);
    });

    // Complaint level selection
    const complaintLevel = document.getElementById('complaintLevel');
    if (complaintLevel) {
        complaintLevel.addEventListener('change', handleComplaintLevelChange);
    }

    // Character counters
    const titleInput = document.getElementById('complaintTitle');
    if (titleInput) {
        titleInput.addEventListener('input', updateCharCount);
    }

    const descInput = document.getElementById('complaintDescription');
    if (descInput) {
        descInput.addEventListener('input', updateDescCharCount);
    }

    // File upload
    const fileUploadArea = document.getElementById('fileUploadArea');
    const attachmentsInput = document.getElementById('attachments');

    if (fileUploadArea && attachmentsInput) {
        fileUploadArea.addEventListener('click', () => attachmentsInput.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('drop', handleFileDrop);
        attachmentsInput.addEventListener('change', handleFileSelect);
    }

    // SMS Verification
    const smsCheckbox = document.getElementById('smsVerification');
    if (smsCheckbox) {
        smsCheckbox.addEventListener('change', toggleSMSSection);
    }

    const sendOtpBtn = document.getElementById('sendOtpBtn');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', sendOTP);
    }

    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', verifyOTP);
    }

    // Complaint scope change
    document.querySelectorAll('input[name="complaintScope"]').forEach(radio => {
        radio.addEventListener('change', handleComplaintScopeChange);
    });

    // Step circle click navigation (only to completed steps)
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', handleStepClick);
    });
}

// ============================================
// Step Navigation
// ============================================
function navigateStep(direction) {
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }

    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');

    // Hide current step
    steps[currentStep - 1].classList.remove('active');

    // Don't mark as completed when going back
    if (direction === 1) {
        progressSteps[currentStep - 1].classList.remove('active');
        progressSteps[currentStep - 1].classList.add('completed');
    } else {
        progressSteps[currentStep - 1].classList.remove('active', 'completed');
    }

    // Update step number
    currentStep += direction;

    // Show new step
    steps[currentStep - 1].classList.add('active');
    progressSteps[currentStep - 1].classList.add('active');

    // Remove completed class from current step
    progressSteps[currentStep - 1].classList.remove('completed');

    // Update progress bar
    updateProgressBar();

    // Update button visibility
    updateNavigationButtons();

    // Special handling for review step
    if (currentStep === 5) {
        populateReviewSection();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Navigate to specific step (for edit buttons)
function navigateToStep(stepNumber) {
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.step');

    // Hide current step
    steps[currentStep - 1].classList.remove('active');
    progressSteps[currentStep - 1].classList.remove('active');

    // Update step number
    currentStep = stepNumber;

    // Show target step
    steps[currentStep - 1].classList.add('active');
    progressSteps[currentStep - 1].classList.add('active');

    // Update UI
    updateProgressBar();
    updateNavigationButtons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle click on step circles - only allow navigation to completed steps
function handleStepClick(e) {
    const clickedStep = e.currentTarget;
    const stepNumber = parseInt(clickedStep.getAttribute('data-step'));

    // Only allow clicking on completed steps (steps before current step)
    if (clickedStep.classList.contains('completed')) {
        navigateToStep(stepNumber);
    } else if (stepNumber < currentStep) {
        // Also allow clicking on steps before current even if not marked completed
        navigateToStep(stepNumber);
    }
    // If clicking on current step or future steps, do nothing
}

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
}

function updateNavigationButtons() {
    prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-flex';
    submitBtn.style.display = currentStep === totalSteps ? 'inline-flex' : 'none';
}

// ============================================
// Validation
// ============================================
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);

    switch (currentStep) {
        case 1:
            return validateStep1(currentStepElement);
        case 2:
            return validateStep2(currentStepElement);
        case 3:
            return validateStep3(currentStepElement);
        case 4:
            return validateStep4(currentStepElement);
        default:
            return true;
    }
}

function validateStep1(stepElement) {
    const userType = document.querySelector('input[name="userType"]:checked');
    if (!userType) {
        showError('Please select your user type');
        return false;
    }

    const complaintScope = document.querySelector('input[name="complaintScope"]:checked');
    if (!complaintScope) {
        showError('Please select complaint scope (Individual/Group/Department)');
        return false;
    }

    const visibility = document.querySelector('input[name="visibility"]:checked');
    if (!visibility) {
        showError('Please select complaint visibility');
        return false;
    }

    return true;
}

function validateStep2(stepElement) {
    const requiredFields = stepElement.querySelectorAll('input[required], select[required]');

    for (let field of requiredFields) {
        // Skip fields that are not visible
        if (field.offsetParent === null) continue;

        if (!field.value.trim()) {
            field.focus();
            showError(`Please fill in: ${field.previousElementSibling?.textContent || 'required field'}`);
            return false;
        }
    }

    // Email validation
    const email = document.getElementById('email');
    if (email && !validateEmail(email.value)) {
        email.focus();
        showError('Please enter a valid university email');
        return false;
    }

    // Phone validation
    const phone = document.getElementById('phone');
    if (phone && !validatePhone(phone.value)) {
        phone.focus();
        showError('Please enter a valid phone number');
        return false;
    }

    return true;
}

function validateStep3(stepElement) {
    const primaryCategory = document.querySelector('input[name="primaryCategory"]:checked');
    if (!primaryCategory) {
        showError('Please select a primary category');
        return false;
    }

    const subCategory = document.getElementById('subCategory');
    if (subCategory && subCategory.offsetParent !== null && !subCategory.value) {
        showError('Please select a sub-category');
        return false;
    }

    const complaintLevel = document.getElementById('complaintLevel');
    if (!complaintLevel.value) {
        showError('Please select complaint scope');
        return false;
    }

    return true;
}

function validateStep4(stepElement) {
    const title = document.getElementById('complaintTitle');
    if (!title.value.trim() || title.value.length < 10) {
        title.focus();
        showError('Complaint title must be at least 10 characters');
        return false;
    }

    const description = document.getElementById('complaintDescription');
    if (!description.value.trim() || description.value.length < 50) {
        description.focus();
        showError('Complaint description must be at least 50 characters');
        return false;
    }

    const urgency = document.querySelector('input[name="urgency"]:checked');
    if (!urgency) {
        showError('Please select urgency level');
        return false;
    }

    return true;
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validatePhone(phone) {
    const regex = /^[\d\s\+\-\(\)]{10,}$/;
    return regex.test(phone);
}

function showError(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

// ============================================
// User Type Handling
// ============================================
function handleUserTypeChange(e) {
    const userType = e.target.value;

    // Show scope and visibility sections
    document.getElementById('complaintScopeSection').style.display = 'block';
    document.getElementById('visibilitySection').style.display = 'block';

    // Hide all user-type specific fields first
    document.querySelectorAll('.student-fields, .teacher-fields, .staff-fields').forEach(el => {
        el.style.display = 'none';
        // Remove required attribute from hidden fields
        el.querySelectorAll('input, select').forEach(input => {
            input.removeAttribute('required');
        });
    });

    // Show relevant fields based on user type
    const fieldsClass = `.${userType}-fields`;
    const fieldsContainer = document.querySelector(fieldsClass);

    if (fieldsContainer) {
        fieldsContainer.style.display = 'contents';
        // Add required attribute to visible required fields
        fieldsContainer.querySelectorAll('input, select').forEach(input => {
            if (input.id !== 'alternatePhone' && input.id !== 'experience') {
                input.setAttribute('required', 'required');
            }
        });
    }
}

function handleComplaintScopeChange(e) {
    const scope = e.target.value;
    const groupDetails = document.querySelector('.group-details');

    if (scope === 'group' || scope === 'department') {
        groupDetails.style.display = 'block';
        groupDetails.querySelectorAll('input, textarea').forEach(input => {
            input.setAttribute('required', 'required');
        });
    } else {
        groupDetails.style.display = 'none';
        groupDetails.querySelectorAll('input, textarea').forEach(input => {
            input.removeAttribute('required');
        });
    }
}

// ============================================
// Category Handling
// ============================================
function handleCategoryChange(e) {
    const category = e.target.value;
    const subcategorySection = document.getElementById('subcategorySection');
    const subCategorySelect = document.getElementById('subCategory');

    // Clear existing options
    subCategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';

    // Add new options based on category
    if (subCategories[category]) {
        subCategories[category].forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.toLowerCase().replace(/\s+/g, '_');
            option.textContent = sub;
            subCategorySelect.appendChild(option);
        });
        subcategorySection.style.display = 'block';
    } else {
        subcategorySection.style.display = 'none';
    }
}

function handleComplaintLevelChange(e) {
    const level = e.target.value;
    const courseDetails = document.getElementById('courseDetails');

    if (level === 'course') {
        courseDetails.style.display = 'block';
    } else {
        courseDetails.style.display = 'none';
    }
}

// ============================================
// Character Counting
// ============================================
function updateCharCount(e) {
    const input = e.target;
    const count = input.value.length;
    const maxLength = input.getAttribute('maxlength');
    const counter = input.nextElementSibling;

    if (counter && counter.classList.contains('char-count')) {
        counter.textContent = `${count}/${maxLength} characters`;
    }
}

function updateDescCharCount(e) {
    const input = e.target;
    const count = input.value.length;
    const counter = input.nextElementSibling;

    if (counter && counter.classList.contains('char-count-desc')) {
        counter.textContent = `${count} characters ${count < 50 ? '(minimum 50 required)' : '✓'}`;
        counter.style.color = count >= 50 ? '#27ae60' : '#7f8c8d';
    }
}

// ============================================
// File Upload Handling
// ============================================
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#3498db';
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.borderColor = '#dfe6e9';

    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    Array.from(files).forEach(file => {
        if (file.size > maxSize) {
            showError(`File ${file.name} exceeds 10MB limit`);
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            showError(`File ${file.name} has invalid format`);
            return;
        }

        uploadedFiles.push(file);
        displayFile(file);
    });
}

function displayFile(file) {
    const fileList = document.getElementById('fileList');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const fileIcon = getFileIcon(file.type);
    const fileSize = formatFileSize(file.size);

    fileItem.innerHTML = `
        <div class="file-item-info">
            <i class="${fileIcon}"></i>
            <div>
                <div>${file.name}</div>
                <small>${fileSize}</small>
            </div>
        </div>
        <button type="button" class="file-remove-btn" onclick="removeFile('${file.name}')">
            <i class="fas fa-times"></i>
        </button>
    `;

    fileList.appendChild(fileItem);
}

function getFileIcon(type) {
    if (type.includes('pdf')) return 'fas fa-file-pdf';
    if (type.includes('image')) return 'fas fa-file-image';
    if (type.includes('word') || type.includes('document')) return 'fas fa-file-word';
    return 'fas fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
    const fileList = document.getElementById('fileList');
    const fileItems = fileList.querySelectorAll('.file-item');

    fileItems.forEach(item => {
        if (item.textContent.includes(fileName)) {
            item.remove();
        }
    });
}

// ============================================
// SMS Verification
// ============================================
function toggleSMSSection() {
    const checkbox = document.getElementById('smsVerification');
    const otpSection = document.getElementById('otpSection');

    otpSection.style.display = checkbox.checked ? 'block' : 'none';
}

async function sendOTP() {
    const phone = document.getElementById('phone').value;

    if (!validatePhone(phone)) {
        showError('Please enter a valid phone number first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/otp/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('OTP sent successfully!');
            document.getElementById('otpInputGroup').style.display = 'flex';
        } else {
            showError(data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        showError('Failed to send OTP. Please try again.');
    }
}

async function verifyOTP() {
    const phone = document.getElementById('phone').value;
    const otp = document.getElementById('otpInput').value;

    if (!otp || otp.length !== 6) {
        showError('Please enter a valid 6-digit OTP');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/otp/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, otp })
        });

        const data = await response.json();

        if (data.success) {
            otpVerified = true;
            showSuccess('Phone verified successfully!');
            document.getElementById('otpSection').innerHTML = '<p style="color: #27ae60;"><i class="fas fa-check-circle"></i> Phone Verified</p>';
        } else {
            showError(data.message || 'Invalid OTP');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showError('Failed to verify OTP. Please try again.');
    }
}

// ============================================
// Review Section
// ============================================
function populateReviewSection() {
    const reviewContent = document.getElementById('reviewContent');
    let html = '';

    // User Information
    const userType = document.querySelector('input[name="userType"]:checked')?.value;
    const complaintScope = document.querySelector('input[name="complaintScope"]:checked')?.value;
    const visibility = document.querySelector('input[name="visibility"]:checked')?.value;

    html += `
        <div class="review-section-card">
            <div class="review-header">
                <h4><i class="fas fa-user-circle"></i> User Information</h4>
                <button type="button" class="btn-edit" onclick="navigateToStep(1)">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="review-content">
                <p><strong>User Type:</strong> ${capitalize(userType)}</p>
                <p><strong>Filing As:</strong> ${capitalize(complaintScope)}</p>
                <p><strong>Visibility:</strong> ${capitalize(visibility)}</p>
            </div>
        </div>
    `;

    // Personal Details
    const fullName = document.getElementById('fullName').value;
    const userId = document.getElementById('userId').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const alternatePhone = document.getElementById('alternatePhone')?.value;

    html += `
        <div class="review-section-card">
            <div class="review-header">
                <h4><i class="fas fa-id-card"></i> Personal Details</h4>
                <button type="button" class="btn-edit" onclick="navigateToStep(2)">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="review-content">
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>ID:</strong> ${userId}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                ${alternatePhone ? `<p><strong>Alternate Phone:</strong> ${alternatePhone}</p>` : ''}
            </div>
        </div>
    `;

    // Category
    const primaryCategory = document.querySelector('input[name="primaryCategory"]:checked')?.value;
    const subCategory = document.getElementById('subCategory')?.value;
    const complaintLevel = document.getElementById('complaintLevel').value;

    html += `
        <div class="review-section-card">
            <div class="review-header">
                <h4><i class="fas fa-tags"></i> Complaint Category</h4>
                <button type="button" class="btn-edit" onclick="navigateToStep(3)">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="review-content">
                <p><strong>Primary:</strong> ${capitalize(primaryCategory)}</p>
                ${subCategory ? `<p><strong>Sub-Category:</strong> ${capitalize(subCategory.replace(/_/g, ' '))}</p>` : ''}
                <p><strong>Scope:</strong> ${document.getElementById('complaintLevel').selectedOptions[0]?.text}</p>
            </div>
        </div>
    `;

    // Complaint Details
    const title = document.getElementById('complaintTitle').value;
    const description = document.getElementById('complaintDescription').value;
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value;

    html += `
        <div class="review-section-card">
            <div class="review-header">
                <h4><i class="fas fa-file-alt"></i> Complaint Details</h4>
                <button type="button" class="btn-edit" onclick="navigateToStep(4)">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </div>
            <div class="review-content">
                <p><strong>Title:</strong> ${title}</p>
                <p><strong>Description:</strong> <span class="description-preview">${description}</span></p>
                <p><strong>Urgency:</strong> <span class="urgency-badge urgency-${urgency}">${capitalize(urgency)}</span></p>
                ${uploadedFiles.length > 0 ? `<p><strong>Attachments:</strong> ${uploadedFiles.length} file(s) uploaded</p>` : ''}
            </div>
        </div>
    `;

    reviewContent.innerHTML = html;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ============================================
// Form Submission
// ============================================
async function handleFormSubmit(e) {
    e.preventDefault();

    // Final validation
    const termsAccept = document.getElementById('termsAccept');
    if (!termsAccept.checked) {
        showError('Please accept the terms and conditions');
        return;
    }

    const captcha = document.getElementById('captcha');
    if (!captcha.checked) {
        showError('Please verify you are not a robot');
        return;
    }

    // Show loading overlay
    loadingOverlay.classList.add('active');

    try {
        // Collect all form data
        const complaintData = collectFormData();

        // Create FormData for file upload
        const formDataObj = new FormData();
        formDataObj.append('data', JSON.stringify(complaintData));

        // Append files with proper naming for multer
        uploadedFiles.forEach((file) => {
            formDataObj.append('attachments', file);
        });

        // Submit to API
        const response = await fetch(`${API_BASE_URL}/complaints/submit`, {
            method: 'POST',
            body: formDataObj
        });

        const result = await response.json();

        loadingOverlay.classList.remove('active');

        if (result.success) {
            // Show success modal with backend-provided credentials
            showSuccessModal(result.complaintId, result.pin);
        } else {
            showError(result.message || 'Failed to submit complaint');
        }
    } catch (error) {
        console.error('Error submitting complaint:', error);
        loadingOverlay.classList.remove('active');
        showError('An error occurred while submitting your complaint. Please try again.');
    }
}

function collectFormData() {
    const data = {
        // User Type Info
        userType: document.querySelector('input[name="userType"]:checked')?.value,
        complaintScope: document.querySelector('input[name="complaintScope"]:checked')?.value,
        visibility: document.querySelector('input[name="visibility"]:checked')?.value,

        // Personal Info
        fullName: document.getElementById('fullName').value,
        userId: document.getElementById('userId').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        alternatePhone: document.getElementById('alternatePhone')?.value || '',

        // User-specific fields
        college: document.getElementById('college')?.value || '',
        department: getDepartmentValue(),
        program: document.getElementById('program')?.value || '',
        batch: document.getElementById('batch')?.value || '',
        semester: document.getElementById('semester')?.value || '',
        designation: document.getElementById('designation')?.value || '',
        experience: document.getElementById('experience')?.value || '',
        staffRole: document.getElementById('staffRole')?.value || '',

        // Group Info
        groupName: document.getElementById('groupName')?.value || '',
        groupSize: document.getElementById('groupSize')?.value || '',
        groupMembers: document.getElementById('groupMembers')?.value || '',

        // Category
        primaryCategory: document.querySelector('input[name="primaryCategory"]:checked')?.value,
        subCategory: document.getElementById('subCategory')?.value || '',
        complaintLevel: document.getElementById('complaintLevel').value,

        // Course Details
        courseCode: document.getElementById('courseCode')?.value || '',
        courseName: document.getElementById('courseName')?.value || '',
        facultyName: document.getElementById('facultyName')?.value || '',

        // Complaint Details
        title: document.getElementById('complaintTitle').value,
        description: document.getElementById('complaintDescription').value,
        urgency: document.querySelector('input[name="urgency"]:checked')?.value,

        // Verification
        smsVerificationEnabled: document.getElementById('smsVerification').checked,
        phoneVerified: otpVerified,

        // Device & Browser Info
        deviceInfo: getDeviceInfo(),

        // Connection Info
        connectionInfo: getConnectionInfo(),

        // Form Analytics
        formAnalytics: getFormAnalytics(),

        // Metadata
        userAgent: navigator.userAgent,
        submittedAt: new Date().toISOString(),
        status: 'pending'
    };

    return data;
}

function getDepartmentValue() {
    return document.getElementById('department')?.value ||
        document.getElementById('teacherDepartment')?.value ||
        document.getElementById('staffDepartment')?.value || '';
}

// ============================================
// Access Key Generation
// ============================================
function generateAccessKey() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let key = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) key += '-';
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

// ============================================
// Copy to Clipboard
// ============================================
async function copyToClipboard(text, buttonId) {
    try {
        await navigator.clipboard.writeText(text);
        const button = document.getElementById(buttonId);
        const originalHTML = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.style.background = '#27ae60';

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = '';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Copied to clipboard!');
    }
}

// ============================================
// Success Modal with PIN from Backend
// ============================================
function showSuccessModal(complaintId, pin) {
    // Store for receipt
    window.currentComplaintData = {
        complaintId,
        pin,
        submittedAt: new Date(),
        ...collectFormData()
    };

    const modal = document.getElementById('successModal');
    const modalContent = modal.querySelector('.modal-content');

    modalContent.innerHTML = `
        <div class="modal-icon success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2>Complaint Submitted Successfully!</h2>
        <p class="success-message">Your complaint has been registered and is now being processed.</p>
        
        <div class="credentials-container">
            <div class="credential-box">
                <label><i class="fas fa-ticket-alt"></i> Complaint ID</label>
                <div class="credential-value">
                    <span class="credential-text">${complaintId}</span>
                    <button class="btn-copy" id="copyComplaintId" onclick="copyToClipboard('${complaintId}', 'copyComplaintId')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
            
            <div class="credential-box">
                <label><i class="fas fa-key"></i> Security PIN (6 digits)</label>
                <div class="credential-value">
                    <span class="credential-text access-key">${pin}</span>
                    <button class="btn-copy" id="copyPin" onclick="copyToClipboard('${pin}', 'copyPin')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <small class="warning-text">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <strong>Important:</strong> Save this PIN securely. It cannot be recovered if lost!
                </small>
            </div>
        </div>
        
        <div class="info-box">
            <i class="fas fa-info-circle"></i>
            <div>
                <p><strong>What's Next?</strong></p>
                <p>You will receive updates via email and SMS. Use your Complaint ID and PIN to track your complaint status.</p>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="showReceipt()">
                <i class="fas fa-receipt"></i> View Receipt
            </button>
            <button class="btn btn-success" onclick="window.location.href='track-complaint.html?id=${complaintId}&pin=${pin}'">
                <i class="fas fa-search"></i> Track Status
            </button>
            <button class="btn btn-secondary" onclick="window.location.reload()">
                <i class="fas fa-plus"></i> Submit Another
            </button>
            <button class="btn btn-secondary" onclick="window.location.href='PPU_CMS.html'">
                <i class="fas fa-home"></i> Back to Home
            </button>
        </div>
    `;

    modal.classList.add('active');
}

// ============================================
// Receipt Modal
// ============================================
function showReceipt() {
    const data = window.currentComplaintData;
    if (!data) return;

    const receiptModal = document.createElement('div');
    receiptModal.id = 'receiptModal';
    receiptModal.className = 'modal active';

    const userType = data.userType;
    const date = new Date(data.submittedAt);
    const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    receiptModal.innerHTML = `
        <div class="modal-content receipt-modal">
            <button class="modal-close" onclick="closeReceipt()">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="receipt-container" id="receiptContent">
                <div class="receipt-header">
                    <div class="university-logo">
                        <i class="fas fa-university"></i>
                    </div>
                    <h2>Patliputra University</h2>
                    <h3>Complaint Management System</h3>
                    <div class="receipt-title">COMPLAINT RECEIPT</div>
                </div>
                
                <div class="receipt-divider"></div>
                
                <div class="receipt-credentials">
                    <div class="receipt-row highlight">
                        <span class="label">Complaint ID:</span>
                        <span class="value">${data.complaintId}</span>
                    </div>
                    <div class="receipt-row highlight">
                        <span class="label">Access Key:</span>
                        <span class="value access-key">${data.accessKey}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Submitted On:</span>
                        <span class="value">${formattedDate}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Status:</span>
                        <span class="value"><span class="status-badge status-pending">Pending</span></span>
                    </div>
                </div>
                
                <div class="receipt-divider"></div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-user"></i> Complainant Information</h4>
                    <div class="receipt-row">
                        <span class="label">Name:</span>
                        <span class="value">${data.fullName}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">University ID:</span>
                        <span class="value">${data.userId}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Email:</span>
                        <span class="value">${data.email}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Phone:</span>
                        <span class="value">${data.phone}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">User Type:</span>
                        <span class="value">${capitalize(data.userType)}</span>
                    </div>
                </div>
                
                <div class="receipt-divider"></div>
                
                <div class="receipt-section">
                    <h4><i class="fas fa-file-alt"></i> Complaint Details</h4>
                    <div class="receipt-row">
                        <span class="label">Title:</span>
                        <span class="value">${data.title}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Category:</span>
                        <span class="value">${capitalize(data.primaryCategory)}</span>
                    </div>
                    ${data.subCategory ? `
                    <div class="receipt-row">
                        <span class="label">Sub-Category:</span>
                        <span class="value">${capitalize(data.subCategory.replace(/_/g, ' '))}</span>
                    </div>
                    ` : ''}
                    <div class="receipt-row">
                        <span class="label">Urgency:</span>
                        <span class="value"><span class="urgency-badge urgency-${data.urgency}">${capitalize(data.urgency)}</span></span>
                    </div>
                    <div class="receipt-row full-width">
                        <span class="label">Description:</span>
                        <p class="description-text">${data.description}</p>
                    </div>
                </div>
                
                <div class="receipt-divider"></div>
                
                <div class="receipt-footer">
                    <p class="footer-note">
                        <i class="fas fa-info-circle"></i>
                        This is a computer-generated receipt. Please save this for your records.
                    </p>
                    <p class="footer-note">
                        <i class="fas fa-shield-alt"></i>
                        Keep your Access Key confidential. It is required for tracking and updates.
                    </p>
                    <div class="footer-contact">
                        <p><i class="fas fa-envelope"></i> complaints@pppuniversity.ac.in</p>
                        <p><i class="fas fa-phone"></i> +91-612-2234567</p>
                    </div>
                </div>
            </div>
            
            <div class="receipt-actions no-print">
                <button class="btn btn-primary" onclick="printReceipt()">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
                <button class="btn btn-secondary" onclick="closeReceipt()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(receiptModal);
}

function closeReceipt() {
    const receiptModal = document.getElementById('receiptModal');
    if (receiptModal) {
        receiptModal.remove();
    }
}

function printReceipt() {
    window.print();
}

// ============================================
// Utility Functions
// ============================================
window.removeFile = removeFile; // Make it globally accessible for onclick
window.navigateToStep = navigateToStep; // Make it globally accessible for edit buttons
window.copyToClipboard = copyToClipboard; // Make it globally accessible for copy buttons
window.showReceipt = showReceipt; // Make it globally accessible for receipt button
window.closeReceipt = closeReceipt; // Make it globally accessible for close button
window.printReceipt = printReceipt; // Make it globally accessible for print button

