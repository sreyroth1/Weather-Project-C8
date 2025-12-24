// Function click hit and show password.
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

  const storedUser = JSON.parse(localStorage.getItem('user'));
  
  if (storedUser && inputEm === storedUser.email && inputPw === storedUser.password) {
    showAlert("Login Successful! Redirecting log in...", false);
    localStorage.setItem('login', 'true');
    setTimeout(() => { window.location.href = "/Templates/tets.html"; }, 800);
  } else {
    showAlert("Invalid credentials. Please try again.");
  }
  
}

const btnLogin = document.getElementById("login");
btnLogin.addEventListener("click", (e)=> {
    e.preventDefault();
    user();
})



