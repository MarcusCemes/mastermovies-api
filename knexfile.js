// Re-export settings from typescript

require("dotenv").config();

console.log("\n ℹ If you update seeds/migrations/config, build first!\n")

try {

  const settings = require("./build/database/config.js");
  module.exports = settings.getKnexOptions();

} catch (err) {
  console.error("Could not read database settings. Try building first");
  throw err;
}
