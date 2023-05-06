const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlForUser(req.cookies["user_id"]),
    user,
  };
  if (!user) {
    return res.send("You must login/register first");
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!urlDatabase[req.params.id]) {
    return res.send("URL doesn't exist");
  }
  if (!user) {
    return res.send("You must login/register first");
  }
  if (urlDatabase[req.params.id].userId !== req.cookies["user_id"]) {
    return res.send("Not Autherized to access this page");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.send("URL not found");
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("urls");
  }
  const templateVars = {
    user: null,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (!user) {
    return res.send("You must login");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL,
    userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  if (!urlDatabase[req.params.id]) {
    return res.send("URL doesn't exist");
  }
  if (!user) {
    return res.send("You must login/register first");
  }
  if (urlDatabase[req.params.id].userId !== req.cookies["user_id"]) {
    return res.send("Not Autherized to access this page");
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  if (!urlDatabase[req.params.id]) {
    return res.send("URL doesn't exist");
  }
  if (!user) {
    return res.send("You must login/register first");
  }
  if (urlDatabase[req.params.id].userId !== req.cookies["user_id"]) {
    return res.send("Not Autherized to access this page");
  }
  res.redirect("/urls/");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("Email not found");
  }
  if (password !== user.password) {
    return res.status(403).send("Incorrect password");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Insert your email or password");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email is already exist");
  }
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/**
 *
 * @returns Random string (6 letters)
 */
function generateRandomString() {
  let str = Math.random().toString(36).replace("0.", "");
  return str.substring(0, 6);
}
/**
 * This function finds user by email
 * @param {string} email
 * @param {object} users
 * @returns userObject, null
 */
function getUserByEmail(email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

/**
 *
 * @param {object} up to the user ID
 * @returns object that will be adedd it to the urlDatabase object
 */
function urlForUser(id) {
  const filteredURL = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === id) {
      filteredURL[urlId] = urlDatabase[urlId];
    }
  }
  return filteredURL;
}
