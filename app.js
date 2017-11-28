var restify = require('restify');
var builder = require('botbuilder');
var luis = require('./controller/LuisDialog');
var hash = require('./Controller/HashPassword');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    // appId: "4c694950-0731-499a-b94d-1b2c3c6e9f57",
    // appPassword: "bpdeKIR8849@@hesOZZY1}%"
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});

luis.startDialog(bot);

// hash.hashPassword('MYPASSWORD');
// hash.hashPassword('MYPASSWORD');