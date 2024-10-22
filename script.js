const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");
const signupBtn = document.getElementById("signupBtn");
const loginBtnAction = document.getElementById("loginBtn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

// Sample users for login (replace with your actual logic/backend)
const users = [{ email: "user1@example.com", password: "password123" }];

// Signup logic
signupBtn.addEventListener("click", () => {
  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  if (email && password) {
    // Store new user in local storage (or handle with backend)
    const newUser = { email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created successfully! Redirecting to login...");
    container.classList.remove("active"); // Go back to login
  } else {
    alert("Please fill in all fields.");
  }
});

// Login logic
loginBtnAction.addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  // Get users from local storage
  const storedUsers = JSON.parse(localStorage.getItem("users")) || users;

  const user = storedUsers.find((user) => user.email === email);

  if (user && user.password === password) {
    alert("Login successful! Redirecting to your account...");
    window.location.href = "index1.html"; // Change to your target page
  } else if (!user) {
    alert("Email not registered, redirecting to sign-up page.");
    container.classList.add("active");
  } else {
    alert("Incorrect password.");
  }
});
