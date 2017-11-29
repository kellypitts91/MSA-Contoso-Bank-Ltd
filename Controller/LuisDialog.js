var builder = require('botbuilder');
var account = require('./Account');
var about = require('./AboutAccount');
var customVision = require('./CognitiveServices');
var locat = require('./Location');
var hash = require('./HashPassword');
var fx = require('../API/ForexAPI');
var welcome = require('./WelcomeMessage');

exports.startDialog = function (bot) {

    var helpMessage = "Is there anything else I can help you with?";
    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/b1a7037d-b8fd-4f2a-b48f-70e8b9dcf16d?subscription-key=feb6aa68c4ec41068ddb70aa0c6c0749&verbose=true&timezoneOffset=720&q=');
    bot.recognizer(recognizer);

    bot.dialog('WelcomeIntent',
        function (session) {
            welcome.getWelcomeCard(session);
        }).triggerAction({
            matches: 'WelcomeIntent'
        });

    bot.dialog('Account', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            //getting all accounts at start to determine the account id
            //account.getAllAccounts(session, session.conversationData["email"]);
            if (!isAttachment(session)) {
                if (!session.conversationData["email"]) {
                    builder.Prompts.text(session, "Please enter your email address to view your account details, otherwise type \'c\' to continue.");
                } else {
                    next(); // Skip if we already have this info.
                }
            }
        }, function (session, results, next) {
            //checking user entered a valid number - this means they do have an account
            if (results.response) {
                // if (isNumeric(results.response)) {
                //     session.dialogData.user = results.response;
                //     builder.Prompts.text(session, "Please enter your password");
                //     next();
                // } else {
                //     //user does not have an account
                //     if (results.response == "c") {
                //         session.beginDialog('SetUpAccount');
                //     } else {
                //         session.send("How can I help you?");
                //     }
                // }
                if (results.response == "c") {
                    session.beginDialog('SetUpAccount');
                } else {
                    session.dialogData.user = results.response;
                    builder.Prompts.text(session, "Please enter your password");
                    next();
                }
            } else {
                session.beginDialog('AboutAccount');
            }
        }, function (session, results) {
            session.conversationData["email"] = session.dialogData.user;
            //start retrieving data here
            session.send("Retrieving information for " + session.dialogData.user);
            account.displayAccountInfo(session, session.dialogData.user, results.response);
        }
    ]).triggerAction({
        matches: 'Account'
    });

    bot.dialog('SetUpAccount', [

        function (session, args, next) {
            session.dialogData.args = args || {};
            if (!isAttachment(session)) {
                builder.Prompts.confirm(session, "Please confirm, would you like to set up a new account?");
                next();
            }
        },function (session, results, next) {
            //user wants to set up a new account, proceed to ask for set up information
            if (results.response) {
                builder.Prompts.text(session, "Please enter your email address.");
                next();
            } else {
                //user does not have an account and they do not wish to create a new account
                session.beginDialog('AboutAccount');
            }
        },
        function (session, results, next) {
            session.dialogData.email = results.response;
            if (results.response) {
                builder.Prompts.text(session, "Please enter your first name. ");
                next();
            }
        },
        function (session, results, next) {
            session.dialogData.firstName = results.response;
            builder.Prompts.text(session, "Please enter your last name.");
            next();
        }, function (session, results, next) {
            session.dialogData.lastName = results.response;
            builder.Prompts.text(session, "Please enter a password.");
            next();
        }, function (session, results, next) {
            session.dialogData.password = results.response;
            var info = {
                email: `${session.dialogData.email}`,
                firstName: `${session.dialogData.firstName}`,
                lastName: `${session.dialogData.lastName}`,
                password: `${session.dialogData.password}`
            }
            var msg = "Please confirm the following details are correct";
            builder.Prompts.confirm(session, msg);
            welcome.getSetupCard(session, info);
            next();
        }, function (session, results) {
            if (results.response === true) {
                var hashSalt = hash.hashPassword(session.dialogData.password);
                //create key/value pairs with users information
                var accountInfo = {
                    email: `${session.dialogData.email}`,
                    firstName: `${session.dialogData.firstName}`,
                    lastName: `${session.dialogData.lastName}`,
                    password: hashSalt.password,
                    salt: hashSalt.salt,
                    balance: 0
                }
                session.send("Setting up account for " + accountInfo.firstName + " " + accountInfo.lastName);
                account.sendAccountInfo(session, accountInfo);
                session.send("Account has been setup successfully.");
                session.send("You can login to your dashboard with the email address and password you provided");
                session.send(helpMessage);
            } else if (results.response === false) {
                //restart
                if (!isAttachment(session)) {
                    session.beginDialog('SetUpAccount');
                }
            } //else do nothing -- could be undefined
        }
    ]).triggerAction({
        matches: 'SetUpAccount',
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

    bot.dialog('AboutAccount', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            //procceed to ask what they would like to know about accounts
            if (!isAttachment(session)) {
                builder.Prompts.choice(session, "What would you like to know about Accounts?", accountChoice);
                next();
            }
        }, function (session, results) {
            //Getting the type of account the user wants more information on
            var acc = accountChoice[results.response.entity];
            if (results.response.entity != "None") {
                session.send("Getting information about " + acc.Description);
            }
            switch (results.response.entity) {
                case "Balance":
                    account.displayAccountInfo(session, session.conversationData["email"], session.dialogData.password);
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
                    session.send("You selected \'none\'. " + helpMessage)
                    break;
            }
        }
    ]).triggerAction({
        matches: 'AboutAccount'
    });

    bot.dialog('DeleteAccount', [
        function (session, args, next) {
            session.dialogData.args = args || {};
            if (!isAttachment(session)) {
                if (!session.conversationData["email"]) {
                    builder.Prompts.text(session, "Please login to delete your account.");
                } else {
                    next(); // Skip if we already have this info.
                }
            }
        },
        function(session, results) {
            if(!results.response) {
                builder.Prompts.confirm(session, "Are you sure you want to delete your account?");
            }
        },
        function (session, results) {
            if (results.response) {
                //delete account here
                session.send("Deleting %s account now...", session.conversationData["email"]);
                account.deleteAccount(session, session.conversationData["email"]);
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
        function (session, args, next) {
            session.dialogData.args = args || {};
            console.log(session.dialogData.args.intents);
            //getting location entity - either Auckland or Wellington for testing
            if(typeof session.dialogData.args.intents !== "undefined") {
                var location = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'location');
                if (!isAttachment(session)) {
                    //getting location information
                    if (location) {
                        session.send("Pulling up the location details for our %s branch...", location.entity);
                        locat.findLocation(session, location.entity);
                    } 
                }
            } else {
                builder.Prompts.choice(session, "Please select one of the following options to view contact details.", contact);
                next();
            }
        }, function (session, results) {
            var details = contact[results.response.entity];

            switch (results.response.entity) {
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
                    session.send("You selected \'none\'. " + helpMessage);
                    session.endDialog();
                    break;
            }
        }
    ]).triggerAction({
        matches: 'Location'
    });

    var options = {
        "Account Balance": {
            Description: "I can show you your account balance"
        },
        "Set up a new account": {
            Description: "I can help you set up a new account"
        },
        "About Different Accounts": {
            Description: "Information about the accounts available."
        },
        "Delete your account": {
            Description: "I can delete an account for you"
        },
        "Branch Locations": {
            Description: "Branch location and contact details"
        },
        "Currancy conversion": {
            Description: "Convert from one currency to another"
        }
    };

    bot.dialog('Conversion', 
        function(session, args) {
            session.dialogData.args = args || {};
            console.log(session.dialogData.args.intent.entities);
            var to = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'currency::to currency');
            var from = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'currency::from currency');
            if (!isAttachment(session)) {
                if(to && from) {
                    var currency = {
                        To: to.entity,
                        From: from.entity,
                        Amount: 1 //have option for later on to allow user to enter an amount to convert
                    }
                    
                    //converting currency
                    session.send("Converting %s to %s...", from.entity, to.entity);
                    fx.getConversion(session, currency);
                } else {
                    session.send("To convert from one currency to another. Type something like \'convert from usd to nzd\'.");
                }
            }
        }).triggerAction({
            matches: 'Conversion'
    });

    bot.dialog('Help', [
        function (session, args) {
            session.dialogData.args = args || {};
            if (!isAttachment(session)) {
                session.send("I am here to help you. I can get you information on the following areas.");
                builder.Prompts.choice(session, "Choose from the following options for more information", options);
            }
        }, function (session, results) {
            var response = options[results.response.entity];

            switch (results.response.entity) {
                case "Account Balance":
                    session.beginDialog('Account');
                    break;
                case "Set up a new account":
                    session.beginDialog('SetUpAccount');
                    break;
                case "About Different Accounts":
                    session.beginDialog('AboutAccount');
                    break;
                case "Delete your account":
                    session.beginDialog('DeleteAccount');
                    break;
                case "Branch Locations":
                    session.beginDialog('Location');
                    break;
                case "Currancy conversion":
                    session.beginDialog('Conversion');
                    break;
                default:
                    session.send(helpMessage);
                    break;
            }
        }
    ]).triggerAction({
        matches: 'Help'
    });

    bot.dialog('Goodbye', [
        function (session) {
            session.send("Thank you for choosing Contoso Bank Ltd, have a nice day.");
            //sign the user out
            session.conversationData["email"] = null;
        }
    ]).triggerAction({
        matches: "Goodbye"
    });
}

function isAttachment(session) {
    var msg = session.message.text;
    if ((session.message.attachments && session.message.attachments.length > 0) || msg.includes("http")) {
        //call custom vision
        customVision.retreiveMessage(session);
        return true;
    }
    else {
        return false;
    }
}

