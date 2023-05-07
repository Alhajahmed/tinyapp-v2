/**
 * Generates a random string of 6 characters
 * @returns {string} Random string
 */
function generateRandomString() {
  let str = Math.random().toString(36).replace("0.", "");
  return str.substring(0, 6);
}
/**
 * Finds a user by email in the users object
 * @param {string} email - User's email
 * @param {object} users - Object containing user information
 * @returns {object| null} User object if found, otherwise null
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
 * Filters and returns an object containing URLs associated with a specific user ID
 * @param {string} id - User ID
 * @param {object} urlDatabase - Object containing URL information
 * @returns {object} Filtered URL object for the specified user ID
 */
function urlForUser(id, urlDatabase) {
  const filteredURL = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === id) {
      filteredURL[urlId] = urlDatabase[urlId];
    }
  }
  return filteredURL;
}

// Export helper functions
module.exports = { getUserByEmail, generateRandomString, urlForUser };
