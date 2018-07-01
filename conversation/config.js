/**
 * The configuration object
 */
class Config {
  constructor() {

    this.url = "";  // The url of the watson API endpoint
    this.passphrase = ""; // the passphrase used to check the clients authorization
    this.username = ""; // the username used to identify the clients authorization
    this.workspace_id = ""; // The waston workspace id
    this.page_limit = ""; // Maximum results per page
    this.filter = "";  // Return data filters see https://console.bluemix.net/docs/services/conversation/filter-reference.html#filter-query-reference
  }
}

/**
 * Returns a configuration object base on parameters flags
 * passed to the application CLI by the user
 *
 * @returns {Promise<Config>} The configuration derived from ARGV
 * @constructor
 */
module.exports.fromCommanderConfig = function fromCommanderConfig(app) {
  let config = new Config();
  config.url = app.url || process.env.CHAT_LOGS_URL || "";
  config.passphrase = app.passphrase || process.env.CHAT_LOGS_PASSPHRASE || "";
  config.username = app.username || process.env.CHAT_LOGS_USERNAME || "";
  config.workspace_id = app.workspace_id || process.env.CHAT_LOGS_WORKSPACE_ID || "";
  config.page_limit = app.page_limit || process.env.CHAT_LOGS_PAGE_LIMIT || "";
  config.filter = app.filter || process.env.CHAT_LOGS_FILTER || "";

  if (config.passphrase === "-") {

    return new Promise(function(resolve) {
      let b = new Buffer([]);

      process.stdin.on("data", function(chunk) {
        b = Buffer.concat([b,chunk]);
      });

      process.stdin.on("close", function() {
        config.passphrase = b.toString().trim();
        return resolve(config);
      });
    });

  } else {
    return Promise.resolve(config);
  }
};