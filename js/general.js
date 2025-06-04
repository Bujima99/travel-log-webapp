// Session management functions
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

function startSession(driverData) {
    const sessionData = {
        driverData: driverData,
        expiresAt: Date.now() + SESSION_TIMEOUT
    };
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
}

function checkSession() {
    const sessionString = sessionStorage.getItem('travelLogSession');
    if (!sessionString) return null;
    
    const sessionData = JSON.parse(sessionString);
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
        endSession();
        return null;
    }
    
    // Update expiration time on activity
    sessionData.expiresAt = Date.now() + SESSION_TIMEOUT;
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    
    return sessionData.driverData;
}

function endSession() {
    sessionStorage.removeItem('travelLogSession');
    localStorage.removeItem('driverData');
}
