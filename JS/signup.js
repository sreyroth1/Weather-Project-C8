const textValidation = document.getElementById("text-validation");
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm_password');
const form = document.getElementById('signup-form');

form.addEventListener('submit', function (e) {
    e.preventDefault(); // ❗ stop page refresh

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all the information.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Password and Confirm Password do not match!");
        return;
    }

    const userData = {
        username,
        email,
        password
    };

    localStorage.setItem("user", JSON.stringify(userData));

    alert("Sign up successful!");

    // ✅ redirect to another page
    window.location.href = "login.html";
});

passwordInput.addEventListener('input', function () {
    if (passwordInput.value.length >= 8) {
        textValidation.style.color = 'green';
    } else {
        textValidation.style.color = 'red';
    }
    textValidation.style.display = 'block';
});
