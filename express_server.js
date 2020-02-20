const express = require("express");
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//...................... GET Method ..........................................

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
// });

//  app.get("/urls", (req, res) => {
//   let templateVars = { urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);    
}); 

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL] ,
      user: users[req.cookies["user_id"]] };
    res.render("urls_show", templateVars );
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req,res) => {
  let templateVars = {  
    user: users[req.cookies["user_id"]],
    urls : urlDatabase 
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

  
  //let hashedPassword = bcrypt.hashSync(password, 10)

// adds the new user
users[newUserID] = {
    id: newUserID,
    email: email,
    password: password
}


 console.log(users);
// new cookie for user 
//req.session["user_id"] = newUserID;
res
.cookie("user_id", newUserID)
.redirect('/urls');


})

//...................... POST Method ............................................

// app.post("/urls", (req, res) => {
//   console.log(req.body);
//   let key = generateRandomString();
//   res.send({key});
// });

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//........................ Delete ..............................................

app.post("/urls/:shortURL/delete", (req, res) => {
  let key = req.params.shortURL
  delete urlDatabase[key];
  res.redirect("/urls");
});

//............................ Edit ............................................

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL]["longURL"] = req.params.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
});

//................................Submit........................................

// Update a longURL 
app.post("/urls/:shortURL/edit", (req, res) => {
  let key = req.params.shortURL;
  urlDatabase[key] = req.body.newlongURL;
  res.redirect(`/urls/${key}`);
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
      
      if (loginEmail === user.email && loginPassword === user.password) {
        res.cookie["user_id"] = user.id;
        let templateVars = {  
          user: users[user.id],
          urls : urlDatabase 
        };
          res.render("urls_index", templateVars);
          return;
      }
  }

  res.status(403);
  res.send("Login does not exist.");
});

//...........................Logout.................................................

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});
//....................... Listen................................................

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});