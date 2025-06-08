const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function startSession(driverData) {
    const sessionData = {
        driverData: driverData,
        expiresAt: Date.now() + SESSION_TIMEOUT,
        isLoggedOut: false
    };
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    localStorage.setItem('sessionActive', 'true');
    localStorage.setItem('lastActivePage', window.location.href);
}

function checkSession() {
    // Check if session was explicitly logged out
    if (localStorage.getItem('sessionActive') === 'false') {
        endSession();
        return null;
    }

    const sessionString = sessionStorage.getItem('travelLogSession');
    if (!sessionString) return null;

    const sessionData = JSON.parse(sessionString);
    
    if (sessionData.isLoggedOut || Date.now() > sessionData.expiresAt) {
        endSession();
        return null;
    }

    // Update expiration and last active page
    sessionData.expiresAt = Date.now() + SESSION_TIMEOUT;
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    localStorage.setItem('lastActivePage', window.location.href);

    return sessionData.driverData;
}

function endSession() {
    localStorage.setItem('sessionActive', 'false');
    const sessionString = sessionStorage.getItem('travelLogSession');
    if (sessionString) {
        const sessionData = JSON.parse(sessionString);
        sessionData.isLoggedOut = true;
        sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    }
    setTimeout(() => {
        sessionStorage.clear();
        localStorage.removeItem('driverData');
    }, 100);
}

// Only initialize session protection on protected pages
function initSessionProtection() {
    // Check session first
    const sessionData = checkSession();
    if (!sessionData) {
        window.location.replace('index.html?sessionExpired=true');
        return false;
    }

    // Store current page as last active
    localStorage.setItem('lastActivePage', window.location.href);

    // Set up history manipulation
    if (window.history && window.history.pushState) {
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function(event) {
            if (checkSession()) {
                window.history.pushState(null, null, window.location.href);
            } else {
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
    
    return true;
}
