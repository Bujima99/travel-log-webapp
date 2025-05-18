
// Your Firebase confg
  var firebaseConfig = {
    apiKey: "AIzaSyAhSLSI_QA-VhXmzGhu_SLDFEvASz9rCek",
    authDomain: "travel-log-webapp-cfbcc.firebaseapp.com",
    projectId: "travel-log-webapp-cfbcc",
    storageBucket: "travel-log-webapp-cfbcc.firebasestorage.app",
    messagingSenderId: "3684158120",
    appId: "1:3684158120:web:8fbbaacfb9216b29b9509d",
    measurementId: "G-N1LJJYEWQ2"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let loaderMinimumTime = 500; // 500ms minimum show time
    let loaderShownTime;
 // Loader s
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

function showLogin() {
  document.getElementById('loginTab').classList.add('active');
  document.getElementById('signupTab').classList.remove('active');
  document.getElementById('loginSection').classList.remove('inactive');
  document.getElementById('signupSection').classList.remove('active');
}

function showSignup() {
  document.getElementById('signupTab').classList.add('active');
  document.getElementById('loginTab').classList.remove('active');
  document.getElementById('loginSection').classList.add('inactive');
  document.getElementById('signupSection').classList.add('active');
}

// Sign Up User
function signupUser() {
  const firstName = document.getElementById("signupFirstName").value.trim();
  const lastName = document.getElementById("signupLastName").value.trim();
  const phone = document.getElementById("signupPhone").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const newPassword = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;

  if (!firstName || !lastName || !phone || !username || !newPassword || !confirmPassword) {
    showPopup('Authentication Error', 'Please fill all fields.');
    return;
  }

  if (newPassword !== confirmPassword) {
     showPopup('Authentication Error', 'Passwords do not match.');
    return;
  }

  const driverId = "DRV-" + Date.now();

  const data = {
    type: "registerDriver",
    driverId: driverId,
    driverName: firstName + " " + lastName,
    driverPhone: phone,
    driverUsername: username,
    driverPassword: newPassword
  };

  showLoader();
  fetch("https://script.google.com/macros/s/AKfycby6qC6DKPeZfVgNobLn-Qo68YMLI02uUfCO5dMbwOsNDcxBJ8CaIBSORuscUfNsnLsV7w/exec", {
    method: "POST",
    body: JSON.stringify(data),
    mode: 'no-cors',
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(resp => {
     showPopup('Success', 'Registration complete!');
    localStorage.setItem("driverId", driverId);
    localStorage.setItem("driverName", firstName + " " + lastName);
    window.location.href = "./index.html";
  })
  .catch(err => {
    console.error("Error registering driver:", err);
     showPopup('Error', 'Registration failed.');
  }).finally(() => {
        hideLoader(); // Now this will only run after everything is complete
    });
}

function checkClassicLogin() {
  const username = document.getElementById("usernameInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!username || !password) {
    showPopup('Error', 'Please enter both username and password.');
    return;
  }

showLoader();
  // Fetch driver data from Google Sheets web app endpoint
fetch("https://script.google.com/macros/s/AKfycby6qC6DKPeZfVgNobLn-Qo68YMLI02uUfCO5dMbwOsNDcxBJ8CaIBSORuscUfNsnLsV7w/exec?action=drivers")
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
      showPopup('Success', `Welcome ${user.username}!`);
      const driverData = {
        name: user.username, // Replace with actual data
        id: user.DriverID,  // Replace with actual data
        phoneNumber: user.DriverPhone // Replace with actual data
    };
    
    handleSuccessfulLogin(driverData);
      
      window.location.href = "./dashboard.html";
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
        phoneNumber: driverData.phoneNumber
    }));
    
    // Redirect to dashboard
    window.location.href = './dashboard.html';
}


// Show Google login button
function showGoogleLogin() {
  document.getElementById('loginOptions').classList.add('hidden');
  document.getElementById('googleLogin').classList.remove('hidden');
}

// Initialize recaptcha verifier
let recaptchaVerifier;

// Show Phone number form
function showPhoneLogin() {
  document.getElementById('loginOptions').classList.add('hidden');
  document.getElementById('phoneLogin').classList.remove('hidden');
  // Only initialize once
  if (!recaptchaVerifier) {
    recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'normal',
      'callback': (response) => {
        console.log("Recaptcha verified");
      },
      'expired-callback': () => {
        console.log("Recaptcha expired");
      }
    });
    recaptchaVerifier.render();
}
}

// Google Sign-In
function signInWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      var user = result.user;
      onGoogleSignInSuccess(user);
    })
    .catch(error => {
      console.error(error);
    });
}

// Send OTP
function sendOTP() {
  const phoneNumber = document.getElementById('phoneNumber').value;
  const appVerifier = recaptchaVerifier;

  firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      // SMS sent
      window.confirmationResult = confirmationResult;
      alert("OTP sent to " + phoneNumber);
    })
    .catch((error) => {
      console.error("Error during sign-in:", error);
      alert("Error sending OTP: " + error.message);
    });
}

// Verify OTP
function verifyOTP() {
  const otp = document.getElementById("otp").value;
  window.confirmationResult.confirm(otp)
    .then((result) => {
      alert("Phone verified");
      document.getElementById('phoneLogin').classList.add('hidden');
      document.getElementById('registrationForm').classList.remove('hidden');
    })
    .catch((error) => {
      console.error(error);
      alert("Invalid OTP: " + error.message);
    });
}

// Complete Registration (for now just redirect)
// Global variable to track logged in phone or Google user info
let loggedInPhone = "";
let loggedInGoogleName = "";

// After Google Sign-In Success
function onGoogleSignInSuccess(user) {
  loggedInGoogleName = user.displayName;
  document.getElementById("loginOptions").classList.add("hidden");
  document.getElementById("googleLogin").classList.add("hidden");
  document.getElementById("registrationForm").classList.remove("hidden");
}

// After Phone OTP Verification Success
function onPhoneVerificationSuccess(phoneNumber) {
  loggedInPhone = phoneNumber;
  document.getElementById("loginOptions").classList.add("hidden");
  document.getElementById("phoneLogin").classList.add("hidden");
  document.getElementById("registrationForm").classList.remove("hidden");
}

// Complete Registration
function completeRegistration() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const username = document.getElementById("username").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!firstName || !lastName || !username || !newPassword || !confirmPassword) {
    showPopup('Authentication Error', 'Please fill all fields.');
    return;
  }

  if (newPassword !== confirmPassword) {
    showPopup('Authentication Error', 'Passwords do not match.');
    return;
  }

  const driverId = "DRV-" + Date.now();

  const data = {
    type: "registerDriver",
    driverId: driverId,
    driverName: firstName + " " + lastName,
    driverPhone: loggedInPhone || "Google User",
    driverUsername: username,
    driverPassword: newPassword
  };

  fetch("https://script.google.com/macros/s/AKfycby6qC6DKPeZfVgNobLn-Qo68YMLI02uUfCO5dMbwOsNDcxBJ8CaIBSORuscUfNsnLsV7w/exec", {
    method: "POST",
    body: JSON.stringify(data),
    mode: 'no-cors',
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.text())
  .then(resp => {
     showPopup('Success', 'Registration complete!');
    localStorage.setItem("driverId", driverId);
    localStorage.setItem("driverName", firstName + " " + lastName);
    window.location.href = "dashboard.html";
  })
  .catch(err => {
    console.error("Error registering driver:", err);
     showPopup('Error', 'Registration failed.');
  });
}



function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
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
      loadServiceEntries();
      break;
    case: 'profile':
      loadProfileData();
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


// Save pending journey
function saveAsPending() {
  const journey = {
    vehicleNumber: document.getElementById('vehicleNumber').value,
    vehicleName: document.getElementById('vehicleName').value,
    startPoint: document.getElementById('startPoint').value,
    startKm: document.getElementById('startKm').value,
    startTime: document.getElementById('startTime').value,
  };
  let pending = JSON.parse(localStorage.getItem('pendingJourneys') || '[]');
  pending.push(journey);
  localStorage.setItem('pendingJourneys', JSON.stringify(pending));
  showPopup('Sucess', 'Journey saved as pending.');
  document.getElementById('journeyForm').reset();
}

// Load pending journeys
function loadPendingJourneys() {
  let pending = JSON.parse(localStorage.getItem('pendingJourneys') || '[]');
  const tbody = document.getElementById('pendingTable').querySelector('tbody');
  tbody.innerHTML = "";
  pending.forEach((journey, index) => {
    let row = tbody.insertRow();
    row.innerHTML = `
      <td>${journey.vehicleNumber}</td>
      <td>${journey.startPoint}</td>
      <td>${journey.startKm}</td>
      <td>${journey.startTime}</td>
      <td><button onclick="editJourney(${index})">Edit</button></td>
    `;
  });
}

function editJourney(index) {
  let pending = JSON.parse(localStorage.getItem('pendingJourneys'));
  const journey = pending[index];
  showSection('addJourney');

  document.getElementById('vehicleNumber').value = journey.vehicleNumber;
  document.getElementById('vehicleName').value = journey.vehicleName;
  document.getElementById('startPoint').value = journey.startPoint;
  document.getElementById('startKm').value = journey.startKm;
  document.getElementById('startTime').value = journey.startTime;

  pending.splice(index, 1);
  localStorage.setItem('pendingJourneys', JSON.stringify(pending));
}

// Logout
function logout() {
  localStorage.removeItem('driverData');
  window.location.href = "index.html";
}

// Initial Load
loadPendingJourneys();

function startJourney() {
  const travelId = crypto.randomUUID();
  const date = new Date().toLocaleDateString();

  const data = {
    travelId: travelId,
    date: date,
    driverName: localStorage.getItem("driverName"),
    driverId: localStorage.getItem("driverId"),
    driverPhone: localStorage.getItem("driverPhone"),
    vehicleNumber: document.getElementById("vehicleNumber").value,
    vehicleName: document.getElementById("vehicleName").value,
    startPoint: document.getElementById("startPoint").value,
    startKm: parseInt(document.getElementById("startKm").value),
    startTime: document.getElementById("startTime").value,
    passengerCount: parseInt(document.getElementById("passengerCount").value),
    passengerName: document.getElementById("passengerName").value,
    passengerPhone: document.getElementById("passengerPhone").value,
    endPoint: "",
    endTime: "",
    endKm: "",
    status: "Pending"
  };

  fetch("https://script.google.com/macros/s/AKfycby6qC6DKPeZfVgNobLn-Qo68YMLI02uUfCO5dMbwOsNDcxBJ8CaIBSORuscUfNsnLsV7w/exec", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(res => alert("Journey Started!"));
}


function getPendingTrips(driverId) {
  fetch("https://script.google.com/macros/s/AKfycby6qC6DKPeZfVgNobLn-Qo68YMLI02uUfCO5dMbwOsNDcxBJ8CaIBSORuscUfNsnLsV7w/exec?driverId=" + driverId)
    .then(res => res.json())
    .then(data => {
      const pendingTrips = data.filter(j => j.status === "Pending");
      displayPendingTrips(pendingTrips);  // Function to update UI
    })
    .catch(error => console.error("Error fetching pending trips:", error));
}

function displayPendingTrips(pendingTrips) {
  const pendingListTable = document.getElementById("pendingTripsTable");  // Assuming you have a table in HTML
  pendingListTable.innerHTML = "";  // Clear existing rows
  
  pendingTrips.forEach(trip => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trip.travelId}</td>
      <td>${trip.date}</td>
      <td>${trip.vehicleNumber}</td>
      <td>${trip.startPoint}</td>
      <td><button onclick="viewPendingTrip('${trip.travelId}')">View</button></td>
    `;
    pendingListTable.appendChild(row);
  });
}

function viewPendingTrip(travelId) {
  // Redirect to a form or display the form with the selected pending trip details.
  console.log("Viewing pending trip: ", travelId);
}

function getCompletedTrips(driverId) {
  fetch("https://script.google.com/macros/s/AKfycby6qC6DKPeZfVgNobLn-Qo68YMLI02uUfCO5dMbwOsNDcxBJ8CaIBSORuscUfNsnLsV7w/exec?driverId=" + driverId)
    .then(res => res.json())
    .then(data => {
      const completedTrips = data.filter(j => j.status === "Completed");
      displayCompletedTrips(completedTrips);  // Function to update UI
    })
    .catch(error => console.error("Error fetching completed trips:", error));
}

function displayCompletedTrips(completedTrips) {
  const completedListTable = document.getElementById("completedTripsTable");  // Assuming you have a table in HTML
  completedListTable.innerHTML = "";  // Clear existing rows
  
  completedTrips.forEach(trip => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${trip.travelId}</td>
      <td>${trip.date}</td>
      <td>${trip.vehicleNumber}</td>
      <td>${trip.startPoint}</td>
      <td>${trip.endPoint}</td>
      <td><button onclick="viewCompletedTrip('${trip.travelId}')">View</button></td>
    `;
    completedListTable.appendChild(row);
  });
}

function viewCompletedTrip(travelId) {
  // Redirect to a form or display the form with the selected completed trip details.
  console.log("Viewing completed trip: ", travelId);
}

// Custom Popup Function
function showPopup(title, message) {
  return new Promise((resolve) => {
    const popup = document.getElementById('customPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupMessage = document.getElementById('popupMessage');
    
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    hideLoader();
    popup.classList.add('active');
    
    // Create a function to handle closing
    const closePopup = () => {
       console.log("Popup closed by user action");
      popup.classList.remove('active');
      resolve(); // Resolve the promise when popup is closed
      showSection('home');
      
      // Remove event listeners to prevent memory leaks
      document.getElementById('popupOk').removeEventListener('click', closePopup);
      document.getElementById('popupClose').removeEventListener('click', closePopup);
      popup.removeEventListener('click', outsideClick);
      location.reload();
    };
    
    // Handle outside clicks
    const outsideClick = (e) => {
     if (e.target === popup && !e.target.closest('.popup-container')) {
        closePopup();
      }
    };
    
    // Add event listeners
    document.getElementById('popupOk').addEventListener('click', closePopup);
    document.getElementById('popupClose').addEventListener('click', closePopup);
    popup.addEventListener('click', outsideClick);
  });
}
