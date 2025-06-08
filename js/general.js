// Session management functions
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function startSession(driverData) {
    const sessionData = {
        driverData: driverData,
        expiresAt: Date.now() + SESSION_TIMEOUT
    };
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    localStorage.setItem('lastActivePage', window.location.href);
}

function checkSession() {
    const sessionString = sessionStorage.getItem('travelLogSession');
    if (!sessionString) return null;

    const sessionData = JSON.parse(sessionString);
    
    // Check if session expired
    if (Date.now() > sessionData.expiresAt) {
        endSession();
        return null;
    }

    // Update expiration
    sessionData.expiresAt = Date.now() + SESSION_TIMEOUT;
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    
    return sessionData.driverData;
}

function endSession() {
    sessionStorage.removeItem('travelLogSession');
    localStorage.removeItem('lastActivePage');
}

// Add this new function to handle back/forward navigation
function handleNavigation() {
    if (!checkSession() && !window.location.pathname.endsWith('index.html')) {
        window.location.replace('index.html?sessionExpired=true');
    }
}

// Initialize session check on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check session first
    const sessionData = checkSession();
    if (!sessionData) {
        window.location.replace('index.html?sessionExpired=true');
        return;
    }

    // Store current page as last active
    localStorage.setItem('lastActivePage', window.location.href);

    // Set up history manipulation
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function(event) {
            if (checkSession()) {
                // If session is active, stay on current page
                window.history.pushState(null, null, window.location.href);
            } else {
                // If session expired, allow going to login page
                window.location.replace('index.html?sessionExpired=true');
            }
        });
    }

    // Periodic session check
    setInterval(() => {
        if (!checkSession()) {
            window.location.replace('index.html?sessionExpired=true');
        }
    }, 60000); // Check every minute
});
