const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function () {

  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserIdOutput = "userRandomID";
    assert.equal(user.id, expectedUserIdOutput, 'Failed, the user is different.');
  });

  it('should return undefined', function () {
    const user = getUserByEmail("notexistemail@example.com", testUsers)
    const expectedUserIdOutput = null;
    assert.equal(user, expectedUserIdOutput, 'Failed.');
  });

});
