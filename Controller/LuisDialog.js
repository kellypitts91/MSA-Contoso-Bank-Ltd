var builder = require('botbuilder');
var isNumeric = require("isnumeric");
var account = require("./Account");
var about = require("./AboutAccounts");
var acc = 1; //testing for now

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
            if (!session.conversationData["accNumber"]) {
                builder.Prompts.text(session, "Please enter your account number if you have one, otherwise type \'c\' to continue.");    
            } else {
                next(); // Skip if we already have this info.
            }
        }, function (session, results){
            //checking user entered a valid number - this means they do have an account
            if(results.response) {
                if(isNumeric(results.response)) {
                    session.conversationData["accNumber"] = results.response;
                    //start retrieving data here
                    session.send("Retrieving information about account " + results.response);
                    account.displayAccountInfo(session, results.response);
                } else {
                    //user does not have an account
                    session.beginDialog('SetUpAccount');  
                }
            } else {
                session.beginDialog('AboutAccounts');
            }
        }
    ]).triggerAction( {
        matches: 'Account'
    });

    bot.dialog('SetUpAccount', [

        function(session, args) {
            session.dialogData.args = args || {};
            builder.Prompts.confirm(session, "You do not have an Account. Would you like to set up a new account?");
        },
        function(session, results) {
            //user wants to set up a new account, proceed to ask for set up information
            if(results.response) {
                builder.Prompts.text(session, "Please enter your first name. ");
            } else {
                //user does not have an account and they do not wish to create a new account
                session.beginDialog('AboutAccounts');
            }
        },
        function(session, results) {
            session.dialogData.firstName = results.response;
            builder.Prompts.text(session, "Please enter your last name.");
        }, function(session, results) {
            session.dialogData.lastName = results.response;
            builder.Prompts.text(session, "Please enter a password.");
        }, function(session, results) {
            session.dialogData.password = results.response;
            var msg = `Please confirm details. First name: ${session.dialogData.firstName}, Last name: ${session.dialogData.lastName}, Password: ${session.dialogData.password}`;
            builder.Prompts.confirm(session, msg);
        }, function(session, results) {
            if(results.response) {
                //come back to this
                account.assignAccountNumber(session, session.conversationData["accNumber"]);
                //session.conversationData["accNumber"] = acc;
                console.log("HERE! " + session.conversationData["accNumber"]);
                //create key/value pairs with users information
                var accountInfo = {
                    accNumber: acc,
                    firstName: `${session.dialogData.firstName}`,
                    lastName: `${session.dialogData.lastName}`,
                    password: `${session.dialogData.password}`, //need to encrypt this <-----------------
                    balance: 0
                }
                session.send("Setting up account for " + accountInfo.firstName + " " + accountInfo.lastName);
                account.sendAccountInfo(session, accountInfo);
                session.send("Account has been setup successfully. Is there anything else I can help you with?");
                acc++; //doesn't work - need to get value then increase -- work on later
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
        }
    };

    bot.dialog('AboutAccounts', [
        function(session, args) {
            session.dialogData.args = args || {};
            //procceed to ask what they would like to know about accounts
            builder.Prompts.choice(session, "What would you like to know about Accounts?", accountChoice);

        }, function(session, results) {
            //Getting the type of account the user wants more information on
            var acc = accountChoice[results.response.entity];
            session.send("Getting information about " + acc.Description);
            session.sendTyping();
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
            }
        }
    ]);
}