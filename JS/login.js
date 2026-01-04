// Modified login.js
// Changes: 
// - Retrieve 'users' array instead of single 'user'
// - Find matching user by email and password
// - If found, store 'currentUser' and set 'loggedIn' to true
// - Update success message and redirect (kept redirect to "/Templates/tets.html" as in original, assume it's a typo for test or target page)

// Function to toggle password visibility

function viewPassword() {
    let passwordFields = document.querySelectorAll('.password');
    const isChecked = document.getElementById("checkbox").checked;

    passwordFields.forEach(function(field) {
        if (isChecked === true) {
            field.type = 'text';
            field.style.borderColor = "green"; 
        } else {
            field.type = 'password';
            field.style.borderColor = ""; 
        }
    });
}

const checkbox = document.getElementById("checkbox");
checkbox.addEventListener("change", viewPassword);

// Display message 
function showAlert(message, isError = true) {
    const msgBox = document.getElementById('auth-message');
    msgBox.innerText = message;
    msgBox.style.display = 'block';
    msgBox.style.color = isError ? '#f20f0fff' : '#47f20fff';
    
    // Auto-hide after 3 seconds
    setTimeout(() => { msgBox.style.display = 'none'; }, 10000);
}

function user() {
    const inputPw = document.getElementById("password").value;
    const inputEm = document.getElementById("email").value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = users.find(u => u.email === inputEm && u.password === inputPw);
  
    if (foundUser) {
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        localStorage.setItem('loggedIn', 'true');
        showAlert("Login Successful! Redirecting...", false);
        setTimeout(() => { window.location.href = "/Templates/map.html"; }, 800);
    } else {
        showAlert("Invalid credentials. Please try again.");
    }
}

const btnLogin = document.getElementById("login");
btnLogin.addEventListener("click", (e) => {
    e.preventDefault();
    user();
});