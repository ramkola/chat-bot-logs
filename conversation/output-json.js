let cfg = require("./config");
let watson = require('watson-developer-cloud');
let fs = require('fs');

// The version of the Watson API to use
const API_VERSION_DATE = "2017-05-26";
/**
 * Outputs the json response from the watson API
 * @returns {null}
 */
module.exports.printJson = function printJson(cmd) {
  // parse or configuration context based on user flags and env options
  cfg.fromCommanderConfig(cmd)
      .then(logConversion);
};

function logConversion(config) {

  let params = {
    workspace_id: config.workspace_id,
    page_limit: config.page_limit,
    filter: config.filter
  };

  // create the the watson conversion
  let conversion = new watson.ConversationV1({
    url: config.url,
    username: config.username,
    password: config.passphrase,
    version_date: API_VERSION_DATE
  });

  conversion.listLogs(params, function(err, response) {
    if (err) {
      console.error(err);
    } else {
      let responses = response.logs.map(function(item) {
        return [
          item.response.context.conversation_id,
          item.response.intents[0] ? item.response.intents[0].intent : "",
          item.response.intents[0] ? item.response.intents[0].confidence : "",
          item.request.context.name,
          item.request.context.email,
          item.request_timestamp,
          item.response_timestamp,
          item.response.input.text || "",
          item.response.entities[0] ? item.response.entities[0].entity + '|' + item.response.entities[0].value + '|' + item.response.entities[0].confidence : "",
          "\n"
        ];
      });

      let data = JSON.stringify(responses, null, 2);
      console.log(data);

      responses.unshift(["",
                "conversation_id",
                "intents",
                "confidence",
                "name",
                "email",
                "request_timestamp",
                "response_timestamp",
                "utterance",
                "entities\n"]);

      fs.writeFile("./test.csv", responses, 'utf8', function(err) {
       if(err) {}
       });

    }
  });
}