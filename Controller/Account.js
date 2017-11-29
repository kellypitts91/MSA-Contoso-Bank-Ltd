var rest = require('../API/RestClient');
var hash = require('./HashPassword');
var builder = require('botbuilder');
var first = true;

//displays bank information in a card
exports.displayAccountInfo = function getAccountInfo(session, email, accPassword) {
    var url = 'http://kellycontosomobileapp.azurewebsites.net/tables/Account';
    rest.getAccountInfo(url, session, email, accPassword, handleAccountResponse);
};

function handleAccountResponse(message, session, email, accPassword) {
    //message = tuple in database
    var details = JSON.parse(message);
    var found = false;
    var pos = 0;
    console.log("details" + details);
    console.log("session = " + email);
    //going through all tuples in the database to find the correct account number
    //checks password first time only
    for (var i = 0; i < details.length; i++) {
        if (details[i].email == email) {
            //getting hash and salt for password
            var storedPasswordHash = details[i].password;
            var enteredPasswordHash = hash.hashPassword(accPassword, details[i].salt).password; //hashing entered password with stored salt
            if (storedPasswordHash == enteredPasswordHash && first) {
                found = true;
                pos = i;
                first = false;
                break;
            }

            //checking account number only second time
            //so don't need to get password again
        } else if (details[i].email == email && !first) {
            found = true;
            pos = i;
            break;
        }
    }
    if (found) {
        //creates a new adaptive card to display the account information to the user
        session.send(new builder.Message(session).addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "type": "AdaptiveCard",
                "version": "0.5",
                "body": [
                    {
                        "type": "Container",
                        "items": [
                            {
                                "type": "TextBlock",
                                "text": "Account Information for: " + details[pos].email, //displays the users account number
                                "size": "large"
                            },
                            {
                                "type": "TextBlock",
                                "text": "Name: " + details[pos].firstName + " " + details[pos].lastName //displays the users name
                            },
                            {
                                "type": "TextBlock",
                                "text": "Account Balance: " + details[pos].balance //displays the users balance
                            }
                        ]
                    }
                ]
            }
        }));
        session.send("Is there anything else I can help you with? Type \'Account\' again for more account options.");
    } else {
        //user not found
        session.send("Sorry, email address or password is incorrect.");
    }
}

//Sets up a new Account
exports.sendAccountInfo = function postAccountInfo(session, accountInfo) {
    var url = 'http://kellycontosomobileapp.azurewebsites.net/tables/Account';
    rest.postAccountInfo(url, accountInfo);
};

exports.deleteAccount = function deleteAccount(session, email, accPassword) {
    var url = 'http://kellycontosomobileapp.azurewebsites.net/tables/Account';
    rest.getAccountInfo(url, session, email, accPassword, function (message, session, email) {
        var details = JSON.parse(message);
        var pos = -1;
        //checking account numbers match and gets the position of the matching account number
        for (var i = 0; i < details.length; i++) {
            if (details[i].email == email) {
                pos = i;
                break;
            }
        }

        //checking the account number has been found
        if (pos != -1) {
            rest.deleteAccount(url, session, email, details[pos].id, handleDeleteResponse);
        } else {
            session.send("Sorry, could not find an account with email address: " + email);
        }
    });
}

function handleDeleteResponse(message, session) {
    session.send("Account deleted successfully");
}

