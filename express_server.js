const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString } = require('./helpers.js');
const { getUserByEmail } = require('./helpers.js');


cookieSession.key
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));

const urlDatabase = {
  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

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

  "martaRandomId": {
    id: "martaRandomId",
    email: "martaluizavelino@gmail.com",
    password: bcrypt.hashSync("teste", 10)
  },
}

//...................................Urls...................................


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

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    isLogged: isUserLogged(req.session.user_id),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect("https://" + urlDatabase[shortURL].longURL);

});

// app.get("/u/:shortURL", function(req, res) {
//   let shortURL = req.params.shortURL;
//   // console.log("u/short", shortURL, urlDatabase[shortURL])
//   res.redirect("https://" + urlDatabase[shortURL].longURL);
// });

function getUrls(user_id) {
  let userUrls = {};
  for (let object in urlDatabase) {
    if (urlDatabase[object].userID === user_id) {
      userUrls[object] = urlDatabase[object];
    }
  }
  return userUrls;
}

function isUserLogged(user_id) {
  let isLogged;
  if (user_id === undefined) {
    isLogged = false;
  } else {
    isLogged = true;
  }
  return isLogged;
}

app.get("/urls", (req, res) => {

  let userUrls = getUrls(req.session.user_id);

  let templateVars = {
    user: users[req.session.user_id],
    urls: userUrls,
    isLogged: isUserLogged(req.session.user_id)
  };
  res.render('urls_index', templateVars);
});

//.......................... Registration page...........................................

app.get("/register", (req, res) => {
  res.render('register');
})

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let newUserID = generateRandomString();
  console.log(email, password, newUserID);

  if (email === "" || password === "") {
    res.status(400).send("Please supply email and password");
    return;
  }

  //functions to validate user's email and password
  for (let property in users) {
    if (email === users[property].email) {
      res.status(400).send("Existing user email, please register");
      return;
    }
  }

  // adds the new user
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  }
  console.log(users);
  // new cookie for user 
  //req.session["user_id"] = newUserID;
  // res.session[user_id] = newUserID;
  res.redirect('/urls');

});

//...................... POST Method ............................................

// app.post("/urls", (req, res) => {
//   console.log(req.body);
//   let key = generateRandomString();
//   res.send({key});
// });

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  longURL = req.body.longURL;
  let objectUrl = { longURL: longURL, userID: req.session.user_id };
  urlDatabase[shortURL] = objectUrl;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//........................ Delete ..............................................

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

// Update a longURL 
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;
  for (let object in users) {
    let user = users[object];
    //if (loginEmail && user.email === loginEmail && bcrypt.compareSync(loginPassword, user.password)) {

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

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//....................... Listen................................................

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// ------ YOU CAN DELETE AFTER .........
app.get("/registered", (req, res) => {
  res.send(users);
})