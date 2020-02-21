const bcrypt = require('bcrypt');

//.....function returns a string of 6 alphanumeric characters....
function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// //-----returns true if email already exists in database-------

// function getUserByEmail(email, users) {
//   for (let user in users) {
//     if (users[user].email === email) {
//       return users[user].id;
//     }
//   }
//   return false;
// }

module.exports = {generateRandomString};
