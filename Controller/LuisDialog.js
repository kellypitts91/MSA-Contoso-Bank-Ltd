var builder = require('botbuilder');
var isNumeric = require('isnumeric');
var account = require('./Account');
var about = require('./AboutAccounts');
var customVision = require('./CognitiveServices');
var locat = require('./Location');
var intAcc = 3; //testing for now

exports.startDialog = function(bot) {

    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8590ed2a-342d-467d-81c0-81a1ed2297a6?subscription-key=41e137af8106487081a7102d6e3cc0e6&verbose=true&timezoneOffset=0&q=');
    
    bot.recognizer(recognizer);

    // bot.dialog('WelcomeIntent', 
    //     function (session, args, next) {
    //         session.send("Hello, welcome to Contoso Bank Ltd. How can I help you today?");
    //     }).triggerAction( {
    //         matches: 'WelcomeIntent'
    // });

    bot.dialog('Account', [
        function(session, args, next) { 
            session.dialogData.args = args || {}; 
            //getting all accounts at start to determine the account id
            //account.getAllAccounts(session, session.conversationData["accNumber"]);
            if (!session.conversationData["accNumber"]) {
                builder.Prompts.text(session, "Please enter your account number if you have one, otherwise type \'c\' to continue.");    
            } else {
                next(); // Skip if we already have this info.
            }
        }, function (session, results, next){
            //checking user entered a valid number - this means they do have an account
            if(results.response) {
                if(isNumeric(results.response)) {
                    session.dialogData.user = results.response;
                    builder.Prompts.text(session, "Please enter your password");
                    next();
                } else {
                    //user does not have an account
                    if(results.response == "c") {
                        session.beginDialog('SetUpAccount');  
                    } else {
                        session.send("How can I help you?");
                    }
                }
            } else {
                session.beginDialog('AboutAccounts');
            }
        }, function(session, results) {
            session.conversationData["accNumber"] = session.dialogData.user;
            //start retrieving data here
            session.send("Retrieving information about account " + session.dialogData.user);
            account.displayAccountInfo(session, session.dialogData.user, results.response);
        }
    ]).triggerAction( {
        matches: 'Account'
    });

    bot.dialog('SetUpAccount', [

        function(session, args, next) {
            session.dialogData.args = args || {};
            builder.Prompts.confirm(session, "Would you like to set up a new account?");
            next();
        },
        function(session, results, next) {
            //user wants to set up a new account, proceed to ask for set up information
            if(results.response) {
                builder.Prompts.text(session, "Please enter your first name. ");
                next();
            } else {
                //user does not have an account and they do not wish to create a new account
                session.beginDialog('AboutAccounts');
            }
        },
        function(session, results, next) {
            session.dialogData.firstName = results.response;
            builder.Prompts.text(session, "Please enter your last name.");
            next();
        }, function(session, results, next) {
            session.dialogData.lastName = results.response;
            builder.Prompts.text(session, "Please enter a password.");
            next();
        }, function(session, results, next) {
            session.dialogData.password = results.response;
            var msg = `Please confirm details. First name: ${session.dialogData.firstName}, Last name: ${session.dialogData.lastName}, Password: ${session.dialogData.password}`;
            builder.Prompts.confirm(session, msg);
            next();
        }, function(session, results) {
            if(results.response) {
                //come back to this
                //account.assignAccountNumber(session, session.conversationData["accNumber"]);
                session.conversationData["accNumber"] = intAcc;
                //console.log("HERE! " + session.conversationData["accNumber"]);
                //create key/value pairs with users information
                var accountInfo = {
                    accNumber: 4,                                   //need a way to increment account number
                    firstName: `${session.dialogData.firstName}`,
                    lastName: `${session.dialogData.lastName}`,
                    password: `${session.dialogData.password}`,     //need to encrypt this <-----------------
                    balance: 0
                }
                session.send("Setting up account for " + accountInfo.firstName + " " + accountInfo.lastName);
                account.sendAccountInfo(session, accountInfo);
                session.send("Account has been setup successfully. Your account number is: " + intAcc);
                session.send("Is there anything else I can help you with?");
            } else {
                //restart
                session.beginDialog('SetUpAccount');  
            }
        }
    ]).triggerAction({
        matches: /^cancel$|^goodbye$|^stop$|^end$|^bye$/i,
        confirmPrompt: "This will cancel your setup. Are you sure?"
    });

    var accountChoice = {
        "Balance": {
            Description: "Account balance"
        },
        "Cheque": {
            Description: "Cheque/Debit Account"
        },
        "Credit": {
            Description: "Credit card Account"
        },
        "Savings": {
            Description: "Savings Account"
        },
        "None": {
            Description: "None"
        }
    };

    bot.dialog('AboutAccounts', [
        function(session, args, next) {
            session.dialogData.args = args || {};
            //procceed to ask what they would like to know about accounts
            builder.Prompts.choice(session, "What would you like to know about Accounts?", accountChoice);
            next();
        }, function(session, results) {
            //Getting the type of account the user wants more information on
            var acc = accountChoice[results.response.entity];
            session.send("Getting information about " + acc.Description);
            switch(results.response.entity) {
                case "Balance":
                    account.displayAccountInfo(session, session.conversationData["accNumber"]);
                    break;
                case "Cheque":
                    about.getChequeInfo(session);
                    break;
                case "Credit":
                    about.getCreditInfo(session);
                    break;
                case "Savings":
                    about.getSavingsInfo(session);
                    break; 
                case "None":
                    //do nothing
                    break;
            }
        }
    ]);

    bot.dialog('DeleteAccount', [
        function(session, args, next){
            session.dialogData.args = args || {};
            if (!session.conversationData["accNumber"]) {
                builder.Prompts.text(session, "Please login to delete your account.");    
            } else {
                next(); // Skip if we already have this info.
            }
        },
        function(session, results) {
            if(!results.response) {
                //delete account here
                session.send("Deleting %s account now...", session.conversationData["accNumber"]);
                account.deleteAccount(session, session.conversationData["accNumber"]);
            } else {
                //need to login
                session.beginDialog('Account');
            }
        }
    ]).triggerAction({
        matches: 'DeleteAccount'
    });

    var contact = {
        "Auckland": "Auckland",
        "Wellington": "Wellington",
        "Christchurch": "Christchurch",
        "None": "None"
    };
    bot.dialog('Location', [
        function(session, args, next) {
            session.dialogData.args = args || {};
            console.log(session.dialogData.args.intents);
            //getting location entity - either Auckland or Wellington for testing
            var location = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'location');
            
            //getting location information
            if(location) {
                session.send("Pulling up the location details for our %s branch...", location.entity);
                locat.findLocation(session, location.entity);
            } else {
                builder.Prompts.choice(session, "Please select one of the following options to view contact details.", contact);
                next();
            }
        }, function(session, results) {
            var details = contact[results.response.entity];

            switch(results.response.entity) {
                case "Auckland":
                    locat.findLocation(session, "auckland");
                    break;
                case "Wellington":
                    locat.findLocation(session, "wellington");
                    break;
                case "Christchurch":
                    locat.findLocation(session, "christchurch");
                    break;
                case "None":
                    session.send("Is there anything else I can help you with?");
                    session.endDialog();
                    break;
            }
        }
    ]).triggerAction({
        matches: 'Location'
    });
}



