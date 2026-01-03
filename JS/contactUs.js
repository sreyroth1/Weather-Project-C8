const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (event) {
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

  // Show confirmation alert FIRST
  alert(
    `Thank you, ${firstName} ${lastName}! Your message has been sent. We'll respond to ${email} soon.`
  );

  // ✅ Store data AFTER clicking OK
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || [];

  const userInformation = {
    firstName,
    lastName,
    email,
    message,
  };

  userInfo.push(userInformation);
  localStorage.setItem("userInfo", JSON.stringify(userInfo));

  // Reset form
  contactForm.reset();
});

// Mobile menu
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn.addEventListener("click", () => {
  mobileMenu.style.display =
    mobileMenu.style.display === "flex" ? "none" : "flex";
});
