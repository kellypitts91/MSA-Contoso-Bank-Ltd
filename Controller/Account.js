var rest = require('../API/RestClient');
var builder = require('botbuilder');

//TODO -- display bank information in a card
exports.displayAccountInfo = function getAccountInfo(accNumber, session){
    var url = 'http://kellycontosobank.azurewebsites.net/tables/Account';
    rest.getAccountInfo(url, session, accNumber, handleAccountResponse)
};

function handleAccountResponse(message, accNumber, session) {
    //message = tuple in database
    var details = JSON.parse(message);
    var found = false;
    var pos = 0;
    //going through all tuples in the database to find the correct account number
    for(var i = 0; i < details.length; i++) {
        if(details[i].accNumber == accNumber) {
            found = true;
            pos = i;
        }
    }
    if(found) {
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
                                "text": "Account Information for: " + details[pos].accNumber, //displays the users account number
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
        session.send("Sorry, that account number does not exist.");
    }
}

//Sets up a new Account
exports.sendAccountInfo = function postAccountInfo(session, accountInfo){
    var url = 'http://kellycontosobank.azurewebsites.net/tables/Account';
    rest.postAccountInfo(url, accountInfo);
};

