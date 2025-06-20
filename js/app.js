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



// Prevent back button issues
window.addEventListener('popstate', function(event) {
  if (window.location.pathname.endsWith('index.html')) {
     window.location.reload();
    checkSessionOnNavigation();
   
  } else {
    history.pushState(null, null, window.location.href);
    resetSessionTimer();
  }
});

// Initialize history state
history.pushState(null, null, window.location.href);


let loaderMinimumTime = 500; // 500ms minimum show time
let loaderShownTime;

// Loader
    window.showLoader = function() {
        loaderShownTime = Date.now();
        document.getElementById('loader').style.display = 'flex';
    };
    window.hideLoader = function() {
        const elapsed = Date.now() - loaderShownTime;
       //const elapsed = 0;
    const remaining = loaderMinimumTime - elapsed;
    
    if (remaining > 0) {
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
        }, remaining);
    } else {
        document.getElementById('loader').style.display = 'none';
    }
    };

// Sign Up User
async  function signupUser() {
  const firstName = document.getElementById("signupFirstName").value.trim();
  const lastName = document.getElementById("signupLastName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const newPassword = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;

  // Validate all fields
  const isFirstNameValid = validateName(firstName, 'signupFirstName');
  const isLastNameValid = validateName(lastName, 'signupLastName');
  const isPhoneValid = validatePhone(phone, 'signupPhone');
  const isUsernameValid = validateUsername(username, 'signupUsername');
  const isPasswordValid = validatePassword(newPassword, 'signupPassword');
  const isConfirmPasswordValid = validateConfirmPassword(newPassword, confirmPassword, 'signupConfirmPassword');

   if (!isFirstNameValid || !isLastNameValid || !isPhoneValid || 
      !isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
    if (!username) {
      showPopup('Error', 'Please fill all fields.');
    }
    return;
  }



  if (newPassword !== confirmPassword) {
     showPopup('Authentication Error', 'Passwords do not match.');
    return;
  }

  const fullName = firstName + " " + lastName;
  const driverId = await generateDriverId();

  showLoader();
  
  // First check if user already exists
  fetch("https://script.google.com/macros/s/AKfycbwqufDfC8tXXM8PodAEk9RKJ32aY0qh9-BmPy6Cv74hM24AzjdNxeAVlR0Rt4IZqggu/exec?action=drivers")
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(existingUsers => {
      // Check if user with same name, username or phone already exists
      const userExists = existingUsers.some(user => 
        user.DriverName === fullName || 
        user.username === username || 
        user.DriverPhone === phone
      );

      if (userExists) {
        throw new Error('User with same name, username or phone number already exists');
      }

      // If user doesn't exist, proceed with registration
      const data = {
        type: "registerDriver",
        driverId: driverId,
        driverName: fullName,
        driverPhone: phone,
        driverUsername: username,
        driverPassword: newPassword,
        userType: "Guest",
        status: "Pending"
      };

      return fetch("https://script.google.com/macros/s/AKfycbwqufDfC8tXXM8PodAEk9RKJ32aY0qh9-BmPy6Cv74hM24AzjdNxeAVlR0Rt4IZqggu/exec", {
        method: "POST",
        body: JSON.stringify(data),
        mode: 'no-cors',
        headers: {
          "Content-Type": "application/json"
        }
      });
    })
    .then(resp => {
      showPopup('Success', 'Registration complete! Please wait for admin approval.');
      // Reset forms and switch to login
      //document.getElementById("tab-2").checked = false;
      document.getElementById("loginForm").reset();
      document.getElementById("signupForm").reset();
    })
    .catch(err => {
      console.error("Error:", err);
      showPopup('Error', err.message || 'Registration failed. User may already exist.');
    })
    .finally(() => {
      hideLoader();
    });
}

function checkClassicLogin() {
  const username = document.getElementById("usernameInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!username || !password) {
    if (!username) {
      showPopup('Error', 'Please enter username.');
    } else {
      showPopup('Error', 'Please enter password.');
    }
    return;
  }

  const isUsernameValid = validateUsername(username, 'usernameInput');
  const isPasswordValid = password.length > 0;

  if (!isUsernameValid || !isPasswordValid) {
    if (!isPasswordValid) {
      showError('passwordInput', 'This field is required');
    }
    return;
  }

showLoader();
  // Fetch driver data from Google Sheets web app endpoint
fetch("https://script.google.com/macros/s/AKfycbwqufDfC8tXXM8PodAEk9RKJ32aY0qh9-BmPy6Cv74hM24AzjdNxeAVlR0Rt4IZqggu/exec?action=drivers")
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Use .json() instead of .text()
  })
  .then(data => {
      console.log("Parsed data:", data);
      const user = data.find(driver => driver.username === username && driver.password === password);
      
      if (user) {
        // Check user status

          if (user.UserType === "Guest") {
          const activeTimestamp = new Date(user.ActiveTimestamp).getTime();
          const now = new Date().getTime();
          const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
          
          if (now - activeTimestamp >= twentyFourHours) {
            // Update user status to "Hold" in the backend
            return fetch("https://script.google.com/macros/s/AKfycbwqufDfC8tXXM8PodAEk9RKJ32aY0qh9-BmPy6Cv74hM24AzjdNxeAVlR0Rt4IZqggu/exec?action=updateStatus&driverId=" + user.DriverID + "&status=Hold")
              .then(() => {
                showPopup('Access Expired', 'Sorry, your Guest access has expired. Please contact admin to get the access.');
                hideLoader();
              });
          }
        }
          
        if (user.Status === "Active" || user.Status === "Owner") {
          showPopup('Success', `Welcome ${user.username}!`);
          const driverData = {
            name: user.username,
            id: user.DriverID,
            username : user.username,
            phoneNumber: user.DriverPhone,
            userType: user.UserType || 'Driver'
          };
          
          handleSuccessfulLogin(driverData);

             
    
    // Clear any logout flags
    const sessionString = sessionStorage.getItem('travelLogSession');
    if (sessionString) {
        const sessionData = JSON.parse(sessionString);
        delete sessionData.isLoggedOut;
        sessionStorage.setItem('travelLogSession', JSON.stringify(sessionData));
    }
    
          
          // Redirect based on user type
          if (driverData.userType === 'Admin') {
            window.location.href = "./admin.html";
          } else {
            window.location.href = "./dashboard.html";
          }
        } 
        else if (user.Status === "Pending") {
          showPopup('Info', 'Your account is pending approval. Please contact admin.');
        } 
        else if (user.Status === "Rejected") {
          showPopup('Access Denied', 'Your account has been rejected. You no longer have access to this system. Please contact admin for further assistance.');
        } 
        else {
          showPopup('Access Denied', 'Admin has not granted access. Please contact admin for login.');
        }
      } else {
        showPopup('Error', 'Invalid username or password.');
      }
    })
  .catch(error => {
    console.error("Error:", error);
    showPopup('Error', 'Could not verify login. Please try again later.');
  }).finally(() => {
        hideLoader(); // Now this will only run after everything is complete
    });
}


function handleSuccessfulLogin(driverData) {
    // Store driver data in localStorage
    localStorage.setItem('driverData', JSON.stringify({
        name: driverData.name,
        id: driverData.id,
        username: driverData.username,
        phoneNumber: driverData.phoneNumber,
        userType: driverData.userType
    }));

    // Initialize session
          initSession();
    // Redirect based on user type
    if (driverData.userType === 'Admin') {
        window.location.href = "./admin.html";
        
    } else {
        window.location.href = "./dashboard.html";
    }

  
}


function showSection(sectionId) {
    
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });

   document.getElementById('addFuelForm').style.display = 'none';
    document.getElementById('addServiceForm').style.display = 'none';
  
  // Show the selected section
  document.getElementById(sectionId).classList.add('active');
  
  // Remove active class from all nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });


  
  // Add active class to the clicked nav item
  const navItems = document.querySelectorAll('.nav-item');
  switch(sectionId) {
    case 'home':
      navItems[0].classList.add('active');
      document.dispatchEvent(new Event('DOMContentLoaded'));
      break;
    case 'fuel':
      navItems[1].classList.add('active');
      loadFuelEntries();
      break;
    case 'history':
      navItems[2].classList.add('active');
      loadCompletedJourneys();
      break;
    case 'service':
      navItems[3].classList.add('active');
      loadServiceEntries();
      break;
    case 'profile':
    navItems[4].classList.add('active');
      loadProfileData();
      break;
      case 'addFuelForm':
           showAddFuelForm();
          break;
      case 'addServiceForm':
           showAddServiceForm();
          break;
      case 'addJourney' :
          populateVehicleDropdowns();
          break;
          
    // Logout doesn't need active state
  }
  
  // Close the nav rail on mobile after selection
  if (window.innerWidth <= 768) {
    document.querySelector('.nav-rail').classList.remove('expanded');
  }
}

// Assuming driverId is stored in localStorage after login
const driverId = localStorage.getItem("driverId");
const driverName = localStorage.getItem("driverName");

// Simulating driver name from login
document.getElementById('driverName').textContent = driverName;

window.onload = function() {
  if (driverId) {
    getPendingTrips(driverId);  // Fetch pending trips on home page
    getCompletedTrips(driverId);  // Fetch completed trips on history page
  }
};


// Logout
//function logout() {
//endSession();
  //localStorage.removeItem('driverData');
  //window.location.href = "index.html";
//}


// Custom Popup Function
function showPopup(title, message) {
  return new Promise((resolve, reject) => {
    const popup = document.getElementById('customPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    hideLoader();
    popup.classList.add('active');
    
     // Create a function to handle closing
    const closePopup = (confirmed) => {
      popup.classList.remove('active');
      if (confirmed) {
          resolve('ok');
      } else {
        reject('cancel');
      }
      
      // Remove event listeners
      document.getElementById('popupOk').removeEventListener('click', confirmHandler);
      document.getElementById('popupClose').removeEventListener('click', cancelHandler);
      popup.removeEventListener('click', outsideClick);
    };

    
    const confirmHandler = () => closePopup(true);
    const cancelHandler = () => closePopup(false);
    
    // Handle outside clicks
    const outsideClick = (e) => {
      if (e.target === popup && !e.target.closest('.popup-container')) {
        cancelHandler();
      }
    };
    
    // Add event listeners
    document.getElementById('popupOk').addEventListener('click', confirmHandler);
    document.getElementById('popupClose').addEventListener('click', cancelHandler);
    popup.addEventListener('click', outsideClick);
  });
}



// Update your logout function
function logout() {
  showPopup('Confirm Logout', 'Are you sure you want to logout?')
    .then(() => {
      forceLogout();
    })
    .catch(() => {
      // User cancelled logout
    });
}

async function generateDriverId() {
  try {
    const response = await fetch(`https://script.google.com/macros/s/AKfycbwqufDfC8tXXM8PodAEk9RKJ32aY0qh9-BmPy6Cv74hM24AzjdNxeAVlR0Rt4IZqggu/exec?action=get-counter&type=Driver`);
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return `DRV-${data.counter}`;
  } catch (error) {
    console.error("Error generating Driver ID:", error);
    // Fallback to timestamp if counter fails
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `DRV-${timestamp}-${random}`.toUpperCase();
  }
}


