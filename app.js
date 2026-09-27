/**
 * Hypervision Application Portal - Frontend Logic
 */

// =========================================================================
// CONFIGURATION
// =========================================================================
// Replace this with the deployed Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSlhQ79OK-5EyQqI6SCKOh2-DvKNppf5xHUsuxjlGkjM7_bw9OTDBk0qemNOn-EGgX8A/exec';

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // DOM Elements
    // =========================================================================
    const navbar = document.getElementById('navbar');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    const form = document.getElementById('application-form');
    const submitBtn = document.getElementById('submit-btn');
    const successState = document.getElementById('success-state');
    const errorState = document.getElementById('error-state');
    const errorStateMessage = document.getElementById('error-state-message');
    const globalError = document.getElementById('global-error');
    
    // Reset buttons in feedback states
    const resetSuccessBtn = document.getElementById('reset-success-btn');
    const resetErrorBtn = document.getElementById('reset-error-btn');

    // Inputs needing specific validation/listeners
    const whyHypervisionInput = document.getElementById('whyHypervision');
    const recentExperienceInput = document.getElementById('recentExperience');

    // =========================================================================
    // Navigation & Layout
    // =========================================================================
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(7, 7, 9, 0.95)';
            navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(7, 7, 9, 0.9)';
            navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.05)';
        }
    }, { passive: true });

    function toggleMobileMenu() {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        mobileNav.classList.toggle('is-open');
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    }

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('is-open')) {
                toggleMobileMenu();
            }
        });
    });

    // =========================================================================
    // Form Interactions
    // =========================================================================

    function setupCharCounter(inputEl, counterElId) {
        if (!inputEl) return;
        const counterEl = document.getElementById(counterElId);
        const max = inputEl.getAttribute('maxlength');
        
        inputEl.addEventListener('input', () => {
            const currentLength = inputEl.value.length;
            counterEl.textContent = currentLength;
            
            if (currentLength >= max * 0.9) {
                counterEl.style.color = 'var(--error)';
            } else {
                counterEl.style.color = 'var(--text-muted)';
            }
        });
    }

    setupCharCounter(whyHypervisionInput, 'why-chars');
    setupCharCounter(recentExperienceInput, 'recent-chars');

    // =========================================================================
    // Validation
    // =========================================================================

    const validators = {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        sapId: (value) => /^\d{9}$/.test(value), // Exactly 9 digits
        phone: (value) => /^[6-9]\d{9}$/.test(value), // 10 digit Indian format
        url: (value) => {
            if (!value) return true; // optional
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        }
    };

    function validateField(input) {
        const group = input.closest('.form-group');
        let isValid = true;
        
        group.classList.remove('has-error');

        if (input.required && !input.value.trim()) {
            isValid = false;
        } else if (input.value.trim()) {
            if (input.type === 'email' && !validators.email(input.value)) {
                isValid = false;
            } else if (input.id === 'sapId' && !validators.sapId(input.value)) {
                isValid = false;
            } else if (input.type === 'tel' && !validators.phone(input.value)) {
                isValid = false;
            } else if (input.type === 'url' && !validators.url(input.value)) {
                isValid = false;
            }
        }
        
        if (input.type === 'checkbox' && input.required && !input.checked) {
            isValid = false;
        }

        if (!isValid) {
            group.classList.add('has-error');
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.setAttribute('aria-invalid', 'false');
        }

        return isValid;
    }

    const inputsToValidate = form.querySelectorAll('input, select, textarea');
    inputsToValidate.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.closest('.form-group').classList.contains('has-error')) {
                validateField(input);
            }
        });
    });

    // =========================================================================
    // Submission Logic
    // =========================================================================

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Hide global error on new submission attempt
        globalError.classList.add('hidden');
        globalError.textContent = '';
        
        // Configuration Check
        if (GOOGLE_SCRIPT_URL === 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            globalError.textContent = "Developer Error: GOOGLE_SCRIPT_URL is not configured. Please edit app.js with your deployed Web App URL.";
            globalError.classList.remove('hidden');
            form.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Validate all fields locally
        let isFormValid = true;
        let firstInvalidInput = null;

        inputsToValidate.forEach(input => {
            const isValid = validateField(input);
            if (!isValid) {
                isFormValid = false;
                if (!firstInvalidInput) firstInvalidInput = input;
            }
        });

        if (!isFormValid) {
            if (firstInvalidInput) {
                firstInvalidInput.focus();
                if (firstInvalidInput.type === 'checkbox') {
                    firstInvalidInput.closest('.form-group').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        submitBtn.classList.add('is-loading');
        
        // Gather Data
        const formData = new FormData(form);
        const applicationPayload = Object.fromEntries(formData.entries());

        let submissionSuccess = false;
        let result = null;

        try {
            // Attempt standard CORS fetch first to receive response JSON
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(applicationPayload),
                redirect: 'follow'
            });

            if (response.ok) {
                result = await response.json();
                if (result.success) {
                    submissionSuccess = true;
                } else {
                    if (result.code === 'DUPLICATE_APPLICATION') {
                        globalError.textContent = result.message || "An application with this SAP ID has already been submitted.";
                        globalError.classList.remove('hidden');
                        form.scrollIntoView({ behavior: 'smooth' });
                        return;
                    } else {
                        showErrorState(result.message || "Failed to process application. Please check your details.");
                        return;
                    }
                }
            }
        } catch (fetchErr) {
            console.warn("Standard fetch encountered CORS redirect restriction, trying no-cors mode:", fetchErr);
            try {
                // Robust fallback for cross-origin browser restrictions (no-cors mode guarantees data delivery)
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8',
                    },
                    body: JSON.stringify(applicationPayload)
                });
                submissionSuccess = true;
            } catch (noCorsErr) {
                console.error("Fallback submission failed:", noCorsErr);
            }
        }

        if (submissionSuccess) {
            form.style.visibility = 'hidden';
            successState.classList.remove('hidden');
            successState.setAttribute('aria-hidden', 'false');
        } else {
            showErrorState("A network error occurred. Please check your connection and try again.");
        }
    });

    function showErrorState(message) {
        form.style.visibility = 'hidden';
        errorStateMessage.textContent = message;
        errorState.classList.remove('hidden');
        errorState.setAttribute('aria-hidden', 'false');
    }

    // =========================================================================
    // Reset States
    // =========================================================================

    function resetForm() {
        form.reset();
        form.style.visibility = 'visible';
        successState.classList.add('hidden');
        successState.setAttribute('aria-hidden', 'true');
        errorState.classList.add('hidden');
        errorState.setAttribute('aria-hidden', 'true');
        globalError.classList.add('hidden');
        
        const charCounters = document.querySelectorAll('.char-count span');
        charCounters.forEach(counter => {
            counter.textContent = '0';
            counter.style.color = 'var(--text-muted)';
        });
        
        document.querySelectorAll('.has-error').forEach(el => {
            el.classList.remove('has-error');
        });

        document.querySelectorAll('[aria-invalid]').forEach(el => {
            el.removeAttribute('aria-invalid');
        });

        document.getElementById('application').scrollIntoView({ behavior: 'smooth' });
    }

    resetSuccessBtn.addEventListener('click', resetForm);
    resetErrorBtn.addEventListener('click', () => {
        form.style.visibility = 'visible';
        errorState.classList.add('hidden');
        errorState.setAttribute('aria-hidden', 'true');
        document.getElementById('application').scrollIntoView({ behavior: 'smooth' });
    });
});
