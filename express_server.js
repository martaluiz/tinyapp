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
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);    
});

app.get("/urls/:shortURL", (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL] ,
      username : req.cookies["username"] };
    res.render("urls_show", templateVars );
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req,res) => {
  let templateVars = {  username : req.cookies["username"],
                        urls : urlDatabase };
  res.render('urls_index', templateVars);
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

app.post("/login", (req, res) => {
  //console.log(req.body.userName);
  res.cookie("username",req.body.username);
  res.redirect("/urls");
});

//...........................Logout.................................................

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  // res.cookie("username",req.body.username);
  res.redirect("/urls");
});
//....................... Listen................................................

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});