document.getElementById("contactForm");
document.addEventListener("submit", function (event) {
  event.preventDefault();

  // Get form values
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  // Simple validation
  if (!firstName || !lastName || !email || !message) {
    alert("Please fill in all required fields.");
    return;
  }
  //show a confirmation message
  alert(
    `Thank you, ${firstName} ${lastName}! Your message has been sent. We'll respond to ${email} soon.`
  );

  // Reset form
  document.getElementById("contactForm").reset();
});
