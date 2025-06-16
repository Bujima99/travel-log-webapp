// Session Management System
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
let sessionTimer;

function initSession() {
  // Set initial session data
  localStorage.setItem('sessionActive', 'true');
  localStorage.setItem('sessionStart', Date.now());
  
  // Start session timer
  startSessionTimer();
  
  // Setup activity listeners
  setupActivityListeners();
}

function startSessionTimer() {
  // Clear any existing timer
  if (sessionTimer) {
    clearTimeout(sessionTimer);
  }
  
  // Set new timer
  sessionTimer = setTimeout(() => {
    logoutDueToInactivity();
  }, SESSION_TIMEOUT);
}

function setupActivityListeners() {
  // Reset timer on any user activity
  const activities = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  activities.forEach(event => {
    window.addEventListener(event, () => {
      resetSessionTimer();
    });
  });
}

function resetSessionTimer() {
  // Update last activity time
  localStorage.setItem('sessionStart', Date.now());
  startSessionTimer();
}

function logoutDueToInactivity() {
  showPopup('Session Expired', 'You have been logged out due to inactivity')
    .then(() => {
      forceLogout();
    });
}

function forceLogout() {
  // Clear session data
  localStorage.removeItem('sessionActive');
  localStorage.removeItem('sessionStart');
  localStorage.removeItem('driverData');
  
  // Set logout flag
  sessionStorage.setItem('justLoggedOut', 'true');
  
  // Redirect to login page
  window.location.href = 'index.html';
}

function checkSessionOnNavigation() {
  const sessionActive = localStorage.getItem('sessionActive');
  const sessionStart = localStorage.getItem('sessionStart');
  
  if (sessionActive && sessionStart) {
    const elapsed = Date.now() - parseInt(sessionStart);
    if (elapsed < SESSION_TIMEOUT) {
      // Session still valid, redirect to appropriate page
      const driverData = JSON.parse(localStorage.getItem('driverData'));
      if (driverData) {
        if (driverData.userType === 'Admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }
      return;
    }
  }
  
  // If we get here, session is invalid
  forceLogout();
}

// Modify your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  // Check if we just logged out
  if (sessionStorage.getItem('justLoggedOut')) {
    sessionStorage.removeItem('justLoggedOut');
    resetLoginForms();
    return;
  }

  // Check if we're on the login page
  if (window.location.pathname.endsWith('index.html') {
    // If user tries to go back to login page, check session
    checkSessionOnNavigation();
  } else {
    // For other pages, initialize session if not already done
    if (!localStorage.getItem('sessionActive')) {
      forceLogout();
    } else {
      initSession();
    }
  }
});

// Prevent back button issues
window.addEventListener('popstate', function(event) {
  if (window.location.pathname.endsWith('index.html')) {
    checkSessionOnNavigation();
  } else {
    history.pushState(null, null, window.location.href);
    resetSessionTimer();
  }
});

// Initialize history state
history.pushState(null, null, window.location.href);
