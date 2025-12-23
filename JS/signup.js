// This is the variable declared 

const textValidation = document.getElementById("text-validation");

const password = document.getElementById('password');

const username = document.getElementById('username')

const email = document.getElementById('email')

const confirmPassword = document.getElementById('confirm_password')

// This is localstorage when I put the information it will store in browser
const userData = {
  username,
  email,
  password,
  confirmPassword
};

localStorage.setItem("user", JSON.stringify(userData));



// This is code validation password if the password less than 8 text red, and if the passoword more than 8 the text green


password.addEventListener('input', function(){
    const passwordValue = password.value;
    if (passwordValue.length >= 8) {
        textValidation.style.color = 'green';
        textValidation.style.display = 'block';
    }
    else{
        textValidation.style.color = 'red';
        textValidation.style.display = 'block';
    }
})