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

// Google Sign-In
function signInWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      alert("Signed in as " + user.displayName);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error(error);
      alert("Error during sign-in: " + error.message);
    });
}

// Send OTP
function sendOTP() {
  const phoneNumber = document.getElementById("phoneNumber").value;
  firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      alert("OTP sent");
    })
    .catch((error) => {
      console.error(error);
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
function completeRegistration() {
  alert("Registration completed. Redirecting to dashboard...");
  window.location.href = "dashboard.html";
}
