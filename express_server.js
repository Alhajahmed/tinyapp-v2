// Import required modules
const express = require("express"); // Express framework for web application
const bcrypt = require("bcryptjs"); // Password hashing library
const cookieSession = require("cookie-session"); // Middleware for managing session data

// Import helper functions
const {
  getUserByEmail,
  generateRandomString,
  urlForUser,
} = require("./helpers");

const app = express(); // Create an instance of Express application
const PORT = 8080; // Specify the default port for the server

// Set the view engine to EJS for rendering dynamic views
app.set("view engine", "ejs");

// ---------- Middleware configuration ----------
// Parse URL-encoded bodies (forms)
app.use(express.urlencoded({ extended: true }));

// Configure cookie session middleware
app.use(
  cookieSession({
    name: "my_session",
    keys: ["my_Private_Key"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Database for storing shortened URLs and their associated user IDs
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "user2RandomID",
  },
};

// User database for storing user information
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10), // Hashed password using bcrypt
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10), // Hashed password using bcrypt
  },
};

// Handler for the root route ("/")
app.get("/", (req, res) => {
  res.send("Hello!"); // Send a simple "Hello!" message
});

// Handler for the "/urls.json" route
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // Send the urlDatabase as a JSON response
});

// Handler for the "/hello" route
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n"); // response with "Hello World" in bold
});

// Handler for the "/urls" route
app.get("/urls", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  const templateVars = {
    // Get the URLs associated with the current user
    urls: urlForUser(req.session["user_id"], urlDatabase),
    user,
  };
  if (!user) {
    // Send a message if the user is not logged in
    return res.send("You must login/register first");
  }
  // Render the "urls_index" template with the provided template variables
  res.render("urls_index", templateVars);
});

// Handler for the "/urls/new" route
app.get("/urls/new", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  if (!user) {
    // Redirect to the "/login" page if the user is not logged in
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
  };
  // Render the "urls_new" template with the provided template variables
  res.render("urls_new", templateVars);
});

// Handler for the "/urls/:id" route
app.get("/urls/:id", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  if (!urlDatabase[req.params.id]) {
    // Send a message if the specified URL doesn't exist in the database
    return res.send("URL doesn't exist");
  }
  if (!user) {
    // Send a message if the user is not logged in
    return res.send("You must login/register first");
  }
  if (urlDatabase[req.params.id].userId !== req.session["user_id"]) {
    // Send a message if the user is not authorized to access the URL
    return res.send("Not Autherized to access this page");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user,
  };
  // Render the "urls_show" template with the provided template variables
  res.render("urls_show", templateVars);
});

// Handler for the "/u/:id" route
app.get("/u/:id", (req, res) => {
  // Get the longURL associated with the provided ID
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    // Send a message if the URL is not found in the database
    return res.send("URL not found");
  } else {
    // Redirect to the longURL
    res.redirect(longURL);
  }
});

// Handler for the "/register" route
app.get("/register", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  if (user) {
    // Redirect to the "/urls" page if the user is already logged in
    return res.redirect("urls");
  }
  const templateVars = {
    user: null,
  };
  // Render the "register" template with the provided template variables
  res.render("register", templateVars);
});

// Handler for the "/login" route
app.get("/login", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  if (user) {
    // Redirect to the "/urls" page if the user is already logged in
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  // Render the "login" template with the provided template variables
  res.render("login", templateVars);
});

// Handler for the "/urls" POST route
app.post("/urls", (req, res) => {
  const userId = req.session["user_id"]; // Get the user_id from the session
  const user = users[userId]; // Get the user object based on the user_id
  if (!user) {
    // Send a message if the user is not logged in
    return res.send("You must login");
  }
  const longURL = req.body.longURL; // Get the longURL from the request body
  const shortURL = generateRandomString(); // Generate a random shortURL
  // Add the new URL entry to the urlDatabase
  urlDatabase[shortURL] = {
    longURL,
    userId,
  };
  // Redirect to the page for the newly created URL
  res.redirect(`/urls/${shortURL}`);
});

// Handler for the "/urls/:id/delete" POST route
app.post("/urls/:id/delete", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  // Get the shortURL from the request parameters
  const shortURL = req.params.id;
  // Delete the URL entry from the urlDatabase
  if (!urlDatabase[req.params.id]) {
    // Send a message if the specified URL doesn't exist in the database
    return res.send("URL doesn't exist");
  }
  if (!user) {
    // Send a message if the user is not logged in
    return res.send("You must login/register first");
  }
  if (urlDatabase[req.params.id].userId !== req.session["user_id"]) {
    // Send a message if the user is not authorized to delete the URL
    return res.send("Not authorized to access this page");
  }
  delete urlDatabase[shortURL];
  // Redirect to the "/urls" page after successful deletion
  res.redirect("/urls");
});

// Handler for the "/urls/:id" POST route
app.post("/urls/:id", (req, res) => {
  // Get the user object based on the user_id stored in the session
  const user = users[req.session["user_id"]];
  // Get the shortURL from the request parameters
  const shortURL = req.params.id;
  // Get the updated longURL from the request body
  const newLongURL = req.body.longURL;
  // Update the longURL in the urlDatabase
  urlDatabase[shortURL].longURL = newLongURL;
  if (!urlDatabase[req.params.id]) {
    // Send a message if the specified URL doesn't exist in the database
    return res.send("URL doesn't exist");
  }
  if (!user) {
    // Send a message if the user is not logged in
    return res.send("You must login/register first");
  }
  if (urlDatabase[req.params.id].userId !== req.session["user_id"]) {
    // Send a message if the user is not authorized to update the URL
    return res.send("Not Autherized to access this page");
  }
  // Redirect to the "/urls/" page after successful update
  res.redirect("/urls/");
});

// Handler for the "/login" POST route
app.post("/login", (req, res) => {
  // Get the email and password from the request body
  const { email, password } = req.body;
  // Find the user based on the email
  const user = getUserByEmail(email, users);
  if (!user) {
    // Send a message if the email is not found
    return res.status(403).send("Email not found");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    // Send a message if the password is incorrect
    return res.status(403).send("Incorrect password");
  }
  req.session.user_id = user.id; // Store the user_id in the session
  res.redirect("/urls"); // Redirect to the "/urls" page after successful login
});

// Handler for the "/logout" POST route
app.post("/logout", (req, res) => {
  req.session = null; // Clear the session
  res.redirect("/login"); // Redirect to the "/login" page after logout
});

// Handler for the "/register" POST route
app.post("/register", (req, res) => {
  // Get the email and password from the request body
  const { email, password } = req.body;
  if (!email || !password) {
    // Send a message if email or password is missing
    return res.status(400).send("Insert your email or password");
  }
  if (getUserByEmail(email, users)) {
    // Send a message if the email already exists in the user database
    return res.status(400).send("Email is already exist");
  }
  const id = generateRandomString(); // Generate a random user ID
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10), // Hash the password before storing it
  };
  req.session.user_id = id; // Store the user_id in the session
  // Redirect to the "/urls" page after successful registration
  res.redirect("/urls");
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});
