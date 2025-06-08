// Session management functions
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function startSession(driverData) {
    const sessionData = {
        driverData: driverData,
        expiresAt: Date.now() + SESSION_TIMEOUT,
        isLoggedOut: false // Add this flag
    };
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    localStorage.setItem('sessionActive', 'true');
    localStorage.setItem('lastActivePage', window.location.href); // Store current page
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

function isSessionActive() {
    return checkSession() !== null;
}

function getSessionData() {
    return checkSession();
}

function refreshSession() {
    const data = checkSession();
    if (data) {
        startSession(data.driverData);
        return true;
    }
    return false;
}

// Add warning before session expires
function setupSessionWarning() {
    const warningTime = 5 * 60 * 1000; // 5 minutes before expiry
    const sessionData = checkSession();
    
    if (sessionData) {
        const timeLeft = sessionData.expiresAt - Date.now();
        if (timeLeft <= warningTime) {
            setTimeout(() => {
                showPopup('Session Warning', 'Your session will expire soon. Please save your work.');
            }, timeLeft - warningTime);
        }
    }
}

// Call this periodically to keep session alive during activity
function sessionHeartbeat() {
    if (checkSession()) {
        // Session is valid, refresh it
        const sessionData = checkSession();
        startSession(sessionData.driverData);
        return true;
    }
    return false;
}

// Call this every 5 minutes
setInterval(sessionHeartbeat, 5 * 60 * 1000);
