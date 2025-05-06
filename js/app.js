// Your Firebase config
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


// Show Google login button
function showGoogleLogin() {
  document.getElementById('loginOptions').classList.add('hidden');
  document.getElementById('googleLogin').classList.remove('hidden');
}

// Show Phone number form
function showPhoneLogin() {
  document.getElementById('loginOptions').classList.add('hidden');
  document.getElementById('phoneLogin').classList.remove('hidden');
}

// Dummy Google sign-in handler
function signInWithGoogle() {
  alert("Google Sign-in flow will run here, then collect extra phone number if needed and go to dashboard.");
  // firebase.auth().signInWithPopup(provider)...
}

// Dummy send OTP
function sendOTP() {
  alert("OTP sent to " + document.getElementById('phoneNumber').value);
  // firebase.auth().signInWithPhoneNumber...
}

// Dummy verify OTP
function verifyOTP() {
  alert("OTP verified");
  document.getElementById('phoneLogin').classList.add('hidden');
  document.getElementById('registrationForm').classList.remove('hidden');
}

// Dummy complete registration
function completeRegistration() {
  alert("Registration completed. Redirecting to dashboard...");
  // Save to Firebase/Firestore if needed
  window.location.href = "dashboard.html";
}
