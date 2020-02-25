const bcrypt = require('bcrypt');

//.....function returns a string of 6 alphanumeric characters.
function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getUserByEmail(email, users) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return undefined;
}

//loops through the data and checks to see if the value of user_id is qual to id
function getUrls(user_id, urlDatabase) {
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

module.exports = { generateRandomString, getUserByEmail, getUrls, isUserLogged };


