const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, getUserByEmail, getUrls, isUserLogged } = require('./helpers.js');


cookieSession.key
const app = express();
app.set("view engine", "ejs"); //set ejs as the view engine
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

const urlDatabase = {
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// All users from registration page.
const users = {

  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },

  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
}

//...................................Urls...................................

//Render the page to create a new Url
app.get("/urls/new", (req, res) => {

  if (req.session.user_id === undefined) {
    res.redirect("/login");
    return;
  }

  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

// This get returns the page for edition of the url.
// it checks if the shorturl exist in order to render the page
app.get("/urls/:shortURL", (req, res) => {

  if (urlDatabase[req.params.shortURL] === undefined ||
    urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    res.render('not_found');
    return;
  }

  let templateVars = {
    isLogged: isUserLogged(req.session.user_id),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

// Redirect the shortUrl to longUrl
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.render('not_found');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;

  // It appends https in case longUrl doesn't have http on the URL.
  if (longURL.startsWith("http://") || longURL.startsWith("https://")) {
    res.redirect(longURL);

  } else {
    res.redirect("https://" + longURL);
  }

});

// URLs page showing user's Url's list.
app.get("/urls", (req, res) => {
  let userUrls = getUrls(req.session.user_id, urlDatabase);
  let templateVars = {
    user: users[req.session.user_id],
    urls: userUrls,
    isLogged: isUserLogged(req.session.user_id)
  };
  res.render('urls_index', templateVars);
});

//Homepage takes you to login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

//.......................... Registration page...........................................

//It renders the register page.
app.get("/register", (req, res) => {
  res.render('register');
})

//It handles registration page info
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let newUserID = generateRandomString();

  //Check for empty string
  if (email === "" || password === "") {
    res.status(400).send("Please supply email and password");
    return;
  }
  let existingUser = getUserByEmail(email, users);
  if (existingUser != undefined) {
    res.status(400).send("Existing user email, please register");  //if email already in use
    return;
  }
  // Add new user
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  }
  req.session.user_id = newUserID;
  res.redirect('/urls');
});

//...................... POST Method ............................................

app.post("/urls", (req, res) => {
  shortURL = generateRandomString(); // call randomString to generate short URL.
  longURL = req.body.longURL;
  let objectUrl = { longURL: longURL, userID: req.session.user_id };
  urlDatabase[shortURL] = objectUrl;
  res.redirect(`/urls/${shortURL}`);
});

//........................ Delete ..............................................

//redirect after delete
app.post("/urls/:shortURL/delete", (req, res) => {
  let key = req.params.shortURL;
  if (urlDatabase[key].userID === req.session.user_id) {
    delete urlDatabase[key];
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("You are not authorized to delete this url!");
  }
});

//............................ Edit ............................................

app.post('/urls/:shortURL', (req, res) => {
  let key = req.params.shortURL;
  if (urlDatabase[key].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL]["longURL"] = req.params.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.status(403);
    res.send("You are not authorized to edit this url!");
  }
});

// ...................... Update a longURL..........................................

app.post("/urls/:shortURL/edit", (req, res) => {
  let key = req.params.shortURL;
  if (urlDatabase[key].userID === req.session.user_id) {
    let key = req.params.shortURL;
    urlDatabase[key].longURL = req.body.newlongURL;
    res.redirect(`/urls/${key}`);
  } else {
    res.status(403);
    res.send("You are not authorized to edit this url!");
  }
});

//..........................Login..................................................

// It renders the login page.
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;
  for (let object in users) {
    let user = users[object];

    if (loginEmail === user.email && bcrypt.compareSync(loginPassword, user.password)) {

      req.session.user_id = user.id;
      res.redirect("/urls");
      return;
    }
  }
  res.status(403);
  res.send("Login does not exist.");
});

//...........................Logout.................................................

//redirect after logout

app.post("/logout", (req, res) => { //Delete the id cookie and log the user out (ie redirect to /urls)
  req.session = null;
  res.redirect("/urls");
});

//....................... Listen................................................

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
