#!/usr/bin/env node

let app = require('commander');
app.version("0.1.0");

app.option("--username <username>", "the client username for the watson api");
app.option("--passphrase <passphrase>", "the client password used for the watson API");
app.option("--url <url>", "the watson api endpoint (https://gateway-fra.watsonplatform.net/conversation/api)");
app.option("--workspace_id <workspace_id>", "the client workspace id");
app.option("--page_limit <page_limit>", "the number of results per page");
app.option("--filter <filter>", "return data filters");

app.parse(process.argv);

require("./conversation/output-json").printJson(app);
