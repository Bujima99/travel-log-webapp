const SESSION_TIMEOUT = 30 * 60 * 1000;  // 30 minutes
function startSession(driverData) {
    const sessionData = {
        driverData: driverData,
        expiresAt: Date.now() + SESSION_TIMEOUT,
        isLoggedOut: false
    };
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    localStorage.setItem('sessionActive', 'true');
}


function checkSession() {
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

    // Update expiration
    sessionData.expiresAt = Date.now() + SESSION_TIMEOUT;
    sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));

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

function initBackButtonHandler() {
    if (window.history && window.history.pushState) {
        // Add a fake history entry so back button does nothing by default
        window.history.pushState(null, null, window.location.href);
        
        window.addEventListener('popstate', function(event) {
            if (checkSession()) {
                // Show confirmation dialog
                const confirmLogout = confirm("Do you really want to logout?");
                if (confirmLogout) {
                    endSession();
                    window.location.href = 'index.html';
                } else {
                    // Re-add the history entry if user cancels
                    window.history.pushState(null, null, window.location.href);
                }
            }
        });
    }
}
