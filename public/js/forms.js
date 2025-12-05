/**
 * Form Loading States
 * Progressive enhancement for better UX during form submissions
 */

(function() {
  'use strict';

  /**
   * Add loading state to all forms on submit
   */
  function initFormLoadingStates() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      form.addEventListener('submit', function(event) {
        // Find the submit button
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');

        if (submitButton) {
          // Disable the button to prevent double submission
          submitButton.disabled = true;

          // Store original button text
          const originalText = submitButton.textContent || submitButton.value;

          // Update button text to show loading state
          if (submitButton.tagName === 'BUTTON') {
            submitButton.textContent = '⏳ Submitting...';
          } else {
            submitButton.value = '⏳ Submitting...';
          }

          // Add loading class for additional styling
          submitButton.classList.add('btn-loading');

          // Re-enable after timeout as fallback (in case of network issues)
          setTimeout(() => {
            submitButton.disabled = false;
            if (submitButton.tagName === 'BUTTON') {
              submitButton.textContent = originalText;
            } else {
              submitButton.value = originalText;
            }
            submitButton.classList.remove('btn-loading');
          }, 10000); // 10 second timeout
        }
      });
    });
  }

  /**
   * Initialize on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormLoadingStates);
  } else {
    initFormLoadingStates();
  }
})();
