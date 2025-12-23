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

