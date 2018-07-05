let cfg = require("./config");
let watson = require('watson-developer-cloud');
let fs = require('fs');
let fetch = require('node-fetch');


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

  new Promise((res,rej) => {
    conversion.listLogs(params, (err, response) => {
      if (err) {
        rej(err);
      } else {
        res(response);
      }
    })
  })
    .then((response) => {
      if (response.pagination.next_url ) {
        console.log('more results found...');
        return fetchResults (response.pagination.next_url, config, response.logs);
      } else {
        return response.logs;
      }
    })
    .then((result) => {
      let responses = convertData (result);
      writeCSV (responses);
    })
    .catch((err) => {
      console.error('error', err);
    });
}

function convertData (logs) {
  return logs.map(function(item) {
    let fullConversation = item.response.input.text ? item.response.input.text : "";
    fullConversation += ' CHATBOT: ';
    fullConversation += item.response.output.text[0] ? item.response.output.text[0] : "";
    fullConversation += item.response.output.text[1] ? item.response.output.text[1] : "";
    fullConversation = fullConversation.replace(/(\n)|(,)/g,'');
    fullConversation = fullConversation.replace(/<[^>]*>/g,'');
    return [
      item.response.context.conversation_id,
      item.response.intents[0] ? item.response.intents[0].intent : "",
      item.response.intents[0] ? item.response.intents[0].confidence : "",
      item.request.context.name ? item.request.context.name.replace(/(\n)|(,)/g,'') : "",
      item.request.context.email ? item.request.context.email.replace(/(\n)|(,)/g,''): "",
      item.request_timestamp,
      item.response_timestamp,
      fullConversation,
      item.response.entities[0] ? item.response.entities[0].entity + ' | ' + item.response.entities[0].value + ' | ' + item.response.entities[0].confidence : "",
      "\n"
    ];
  });
}

function writeCSV (responses) {
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

  fs.writeFile("./chatbotlogs.csv", responses, 'utf8', function(err) {
    console.log('All done. CSV file created');
   if(err) {
     console.error('unable to save csv file. ' + err);
   }
  });
}

// recursive function to fetch paginated results
const fetchResults = (url, config, results = []) => {
  return fetch( config.url + url, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(config.username + ':' + config.passphrase).toString('base64')
    }
  })
    .then(res => res.json())
    .then((result) => {
    // destructure the result object to get logs + pagination sub-objects
    const { logs, pagination } = result;
    // check if we have more pages
    if ( pagination && pagination.next_url ) {
      console.log('getting next page.....');
      // call this function again with the next_url, passing in the results+logs we already have saved
      return fetchResults(pagination.next_url, config, [...results, ...logs]);
    } else {
      console.log('all pages collected');
      return [...results, ...logs];
    }
  });
};
