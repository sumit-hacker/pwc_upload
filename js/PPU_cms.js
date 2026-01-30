// Patliputra University CMS - JavaScript

// Global State
let selectedUserType = null;
let selectedVisibility = null;

// Category Mappings
const categoryMappings = {
  academic_issues: [
    { value: "teaching_quality", label: "Teaching Quality" },
    { value: "course_content", label: "Course Content" },
    { value: "examination_grading", label: "Examination & Grading" },
    { value: "assignment_issues", label: "Assignment Issues" },
    { value: "attendance_disputes", label: "Attendance Disputes" },
    { value: "academic_resources", label: "Academic Resources" },
  ],
  infrastructure: [
    { value: "classroom_issues", label: "Classroom Issues" },
    { value: "laboratory_issues", label: "Laboratory Issues" },
    { value: "library_issues", label: "Library Issues" },
    { value: "hostel_issues", label: "Hostel Issues" },
    { value: "canteen_cafeteria", label: "Canteen/Cafeteria" },
    { value: "sports_facilities", label: "Sports Facilities" },
    { value: "it_internet", label: "IT/Internet" },
  ],
  administrative: [
    { value: "fee_related", label: "Fee Related" },
    { value: "documentation", label: "Documentation" },
    { value: "admission_registration", label: "Admission/Registration" },
    { value: "scholarship", label: "Scholarship" },
    { value: "timetable_issues", label: "Timetable Issues" },
  ],
  harassment_safety: [
    { value: "ragging", label: "Ragging" },
    { value: "bullying", label: "Bullying" },
    { value: "discrimination", label: "Discrimination" },
    { value: "sexual_harassment", label: "Sexual Harassment" },
    { value: "safety_concerns", label: "Safety Concerns" },
  ],
  student_conduct: [
    { value: "peer_issues", label: "Peer Issues" },
    { value: "group_project_conflicts", label: "Group Project Conflicts" },
    { value: "disciplinary_concerns", label: "Disciplinary Concerns" },
  ],
  other: [
    { value: "general_feedback", label: "General Feedback" },
    { value: "suggestions", label: "Suggestions" },
  ],
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  initializeFormValidation();
  animateOnScroll();
});

// Initialize Event Listeners
function initializeEventListeners() {
  // Primary Category Change
  const primaryCategory = document.getElementById("primaryCategory");
  if (primaryCategory) {
    primaryCategory.addEventListener("change", handlePrimaryCategoryChange);
  }

  // Scope Change
  const scope = document.getElementById("scope");
  if (scope) {
    scope.addEventListener("change", handleScopeChange);
  }

  // Visibility Change
  const visibilityRadios = document.querySelectorAll(
    'input[name="visibility"]'
  );
  visibilityRadios.forEach((radio) => {
    radio.addEventListener("change", handleVisibilityChange);
  });

  // Form Submit
  const complaintForm = document.getElementById("complaintForm");
  if (complaintForm) {
    complaintForm.addEventListener("submit", handleFormSubmit);
  }

  // File Upload
  const fileInput = document.getElementById("attachments");
  if (fileInput) {
    fileInput.parentElement.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", handleFileUpload);
  }
}

// User Type Selection
function selectUserType(type) {
  selectedUserType = type;

  // Update UI
  document.querySelectorAll(".user-type-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });
  event.target.closest(".user-type-btn").classList.add("selected");

  // Show/hide personal info section based on visibility
  updatePersonalInfoVisibility();
}

// Visibility Change Handler
function handleVisibilityChange(event) {
  selectedVisibility = event.target.value;
  updatePersonalInfoVisibility();
}

// Update Personal Info Section Visibility
function updatePersonalInfoVisibility() {
  const personalInfoSection = document.getElementById("personalInfoSection");

  if (selectedUserType && selectedVisibility !== "anonymous") {
    personalInfoSection.classList.remove("hidden");
  } else if (selectedVisibility === "anonymous") {
    personalInfoSection.classList.add("hidden");
  }
}

// Primary Category Change Handler
function handlePrimaryCategoryChange(event) {
  const selectedCategory = event.target.value;
  const secondaryCategoryDiv = document.getElementById("secondaryCategoryDiv");
  const secondaryCategory = document.getElementById("secondaryCategory");

  if (selectedCategory && categoryMappings[selectedCategory]) {
    // Populate secondary categories
    secondaryCategory.innerHTML =
      '<option value="">Select Sub-Category</option>';
    categoryMappings[selectedCategory].forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.value;
      option.textContent = cat.label;
      secondaryCategory.appendChild(option);
    });

    secondaryCategoryDiv.classList.remove("hidden");
  } else {
    secondaryCategoryDiv.classList.add("hidden");
  }

  // Show course section for academic issues
  const courseSection = document.getElementById("courseSection");
  if (selectedCategory === "academic_issues") {
    courseSection.classList.remove("hidden");
  } else {
    courseSection.classList.add("hidden");
  }
}

// Scope Change Handler
function handleScopeChange(event) {
  const selectedScope = event.target.value;
  const courseSection = document.getElementById("courseSection");

  // Show course section if scope is course level
  if (selectedScope === "course") {
    courseSection.classList.remove("hidden");
  }
}

// File Upload Handler
function handleFileUpload(event) {
  const files = event.target.files;
  if (files.length > 0) {
    const fileNames = Array.from(files)
      .map((f) => f.name)
      .join(", ");
    showToast(`${files.length} file(s) selected: ${fileNames}`, "success");
  }
}

// Form Submit Handler
function handleFormSubmit(event) {
  event.preventDefault();

  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
  submitBtn.disabled = true;

  // Simulate form submission (replace with actual API call)
  setTimeout(() => {
    // Generate random complaint ID
    const complaintId = `CMP-2024-${Math.floor(Math.random() * 999999)
      .toString()
      .padStart(6, "0")}`;

    // Show success message
    showSuccessModal(complaintId);

    // Reset form
    event.target.reset();
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;

    // Reset state
    selectedUserType = null;
    selectedVisibility = null;
    document.getElementById("personalInfoSection").classList.add("hidden");
    document.getElementById("secondaryCategoryDiv").classList.add("hidden");
    document.getElementById("courseSection").classList.add("hidden");

    // Remove selected state from user type buttons
    document.querySelectorAll(".user-type-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });
  }, 2000);
}

// Show Success Modal
function showSuccessModal(complaintId) {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4";
  modal.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check text-green-600 text-4xl"></i>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">Complaint Submitted!</h2>
            <p class="text-gray-600 mb-6">Your complaint has been successfully submitted and is being processed.</p>
            <div class="bg-blue-50 p-4 rounded-xl mb-6">
                <p class="text-sm text-gray-600 mb-2">Your Complaint ID:</p>
                <p class="text-2xl font-bold text-blue-600">${complaintId}</p>
            </div>
            <p class="text-sm text-gray-600 mb-6">Please save this ID to track your complaint status.</p>
            <button onclick="closeSuccessModal()" class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all w-full">
                Got it!
            </button>
        </div>
    `;
  document.body.appendChild(modal);

  // Copy complaint ID to clipboard
  navigator.clipboard.writeText(complaintId).then(() => {
    showToast("Complaint ID copied to clipboard!", "info");
  });
}

// Close Success Modal
function closeSuccessModal() {
  const modal = document.querySelector(".fixed.inset-0");
  if (modal) {
    modal.remove();
  }
}

// Track Complaint
function trackComplaint() {
  const trackingId = document.getElementById("trackingId").value.trim();

  if (!trackingId) {
    showToast("Please enter a complaint ID", "warning");
    return;
  }

  // Validate format
  if (!trackingId.match(/^CMP-\d{4}-\d{6}$/)) {
    showToast(
      "Invalid complaint ID format. Expected format: CMP-YYYY-XXXXXX",
      "error"
    );
    return;
  }

  // Show loading
  const trackBtn = event.target;
  const originalText = trackBtn.innerHTML;
  trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  trackBtn.disabled = true;

  // Simulate API call
  setTimeout(() => {
    // Show tracking result
    document.getElementById("trackingResult").classList.remove("hidden");

    // Scroll to result
    document
      .getElementById("trackingResult")
      .scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Reset button
    trackBtn.innerHTML = originalText;
    trackBtn.disabled = false;

    showToast("Complaint details loaded successfully!", "success");
  }, 1500);
}

// Toggle FAQ
function toggleFAQ(index) {
  const content = document.getElementById(`faq-content-${index}`);
  const icon = document.getElementById(`faq-icon-${index}`);

  if (content.classList.contains("hidden")) {
    content.classList.remove("hidden");
    icon.style.transform = "rotate(180deg)";
  } else {
    content.classList.add("hidden");
    icon.style.transform = "rotate(0deg)";
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu");
  mobileMenu.classList.toggle("hidden");
}

// Login Modal
function openLoginModal() {
  document.getElementById("loginModal").classList.remove("hidden");
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.add("hidden");
}

// Scroll Functions
function scrollToTrack() {
  document.getElementById("track").scrollIntoView({ behavior: "smooth" });
}


// Toast Notification
function showToast(message, type = "info") {
  // Remove existing toasts
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const icons = {
    success: "fa-check-circle",
    error: "fa-times-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  const colors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
        <i class="fas ${icons[type]} ${colors[type]} text-xl"></i>
        <span class="font-medium text-gray-900">${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
        </button>
    `;

  document.body.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

// Form Validation
function initializeFormValidation() {
  const form = document.getElementById("complaintForm");
  if (!form) return;

  const inputs = form.querySelectorAll(
    "input[required], select[required], textarea[required]"
  );

  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this);
    });

    input.addEventListener("input", function () {
      if (this.classList.contains("invalid")) {
        validateField(this);
      }
    });
  });
}

function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = "";

  // Required validation
  if (field.hasAttribute("required") && !value) {
    isValid = false;
    errorMessage = "This field is required";
  }

  // Email validation
  if (field.type === "email" && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      isValid = false;
      errorMessage = "Please enter a valid email address";
    }
  }

  // Phone validation
  if (field.type === "tel" && value) {
    const phoneRegex = /^[+]?[\d\s-()]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, "").length < 10) {
      isValid = false;
      errorMessage = "Please enter a valid phone number";
    }
  }

  // Update UI
  if (!isValid) {
    field.classList.add("invalid", "border-red-500");
    field.classList.remove("border-gray-300");

    // Show error message
    let errorDiv = field.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains("error-message")) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message text-red-500 text-sm mt-1";
      field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }
    errorDiv.textContent = errorMessage;
  } else {
    field.classList.remove("invalid", "border-red-500");
    field.classList.add("border-gray-300");

    // Remove error message
    const errorDiv = field.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains("error-message")) {
      errorDiv.remove();
    }
  }

  return isValid;
}

// Animate on Scroll
function animateOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  // Observe all sections
  document.querySelectorAll("section").forEach((section) => {
    observer.observe(section);
  });
}

// Device Fingerprinting (Basic Implementation)
async function generateDeviceFingerprint() {
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen.colorDepth,
    deviceMemory: navigator.deviceMemory || "unknown",
    hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
    timestamp: Date.now(),
  };

  // Generate hash
  const fingerprintString = JSON.stringify(fingerprint);
  const hash = await hashString(fingerprintString);

  return hash;
}

// Hash String (Simple implementation)
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Generate OTP (for demonstration)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SMS Verification (Mock)
function sendSMSVerification(phoneNumber) {
  const otp = generateOTP();
  console.log(`SMS sent to ${phoneNumber}: Your OTP is ${otp}`);
  showToast(`Verification code sent to ${phoneNumber}`, "success");
  return otp;
}

// Verify OTP (Mock)
function verifyOTP(userOTP, actualOTP) {
  return userOTP === actualOTP;
}

// Local Storage Helpers
function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to localStorage:", e);
  }
}

function getFromLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Error reading from localStorage:", e);
    return null;
  }
}

// Session Storage Helpers
function saveToSessionStorage(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error saving to sessionStorage:", e);
  }
}

function getFromSessionStorage(key) {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Error reading from sessionStorage:", e);
    return null;
  }
}

// Debounce Function
function debounce(func, wait) {
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

// Throttle Function
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Format Date
function formatDate(date) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(date).toLocaleDateString("en-IN", options);
}

// Copy to Clipboard
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast("Copied to clipboard!", "success");
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      showToast("Failed to copy to clipboard", "error");
    });
}

// Print Page
function printPage() {
  window.print();
}

// Export to PDF (requires library like jsPDF)
function exportToPDF() {
  showToast("PDF export feature coming soon!", "info");
}

// Close modal on outside click
document.addEventListener("click", function (event) {
  const loginModal = document.getElementById("loginModal");
  if (event.target === loginModal) {
    closeLoginModal();
  }
});

// Close modal on Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeLoginModal();
    closeSuccessModal();
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Log page load time (for performance monitoring)
window.addEventListener("load", function () {
  const loadTime = performance.now();
  console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
});

// Service Worker Registration (for PWA - optional)
if ("serviceWorker" in navigator) {
  // Uncomment to enable service worker
  // navigator.serviceWorker.register('/sw.js').then(registration => {
  //     console.log('Service Worker registered:', registration);
  // }).catch(error => {
  //     console.log('Service Worker registration failed:', error);
  // });
}

console.log("Patliputra University CMS initialized successfully! 🎓");
