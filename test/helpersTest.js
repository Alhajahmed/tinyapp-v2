const { assert } = require("chai");

// Importing helper functions
const {
  getUserByEmail,
  urlForUser,
  generateRandomString,
} = require("../helpers.js");

// data for testing
const testUsers = {
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

// data for testing
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

describe("getUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it("should return undefined for non-existent email", function () {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.equal(user, undefined);
  });
});

describe("generateRandomString", function () {
  it("should return a random string of 6 characters", function () {
    const randomString = generateRandomString();
    assert.equal(randomString.length, 6);
  });
});

it("should return an object with URLs associated with a specific user ID", function () {
  const userId = "userRandomID";
  const filteredURL = urlForUser(userId, urlDatabase);
  assert.equal(filteredURL["b2xVn2"].userId, userId);
});

describe("urlForUser", function () {
  it("should return an empty object for a user ID with no associated URLs", function () {
    const userId = "nonexistentID";
    const filteredURL = urlForUser(userId, urlDatabase);
    assert.deepEqual(filteredURL, {});
  });
});
