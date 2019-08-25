// Re-export settings from typescript

require("dotenv").config();

try {

  const settings = require("./build/database/config.js");
  module.exports = settings.getKnexOptions();

} catch (err) {
  console.error("Could not read database settings. Try building first");
  throw err;
}
