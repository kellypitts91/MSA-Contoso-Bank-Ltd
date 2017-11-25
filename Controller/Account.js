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
    console.log(details);
    //console.log(message);
    var found = false;
    var i, pos = 0;
    console.log("len = " + details.length);
    //going through all tuples in the database to find the correct account number
    for(i = 0; i < details.length; i++) {
        console.log(details[i].accNumber + " " + accNumber);
        if(details[i].accNumber == accNumber) {
            found = true;
            pos = i;
        }
        console.log(i);
    }
    if(found) {
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
                                "text": "Account Information for: "+details[pos].accNumber,
                                "size": "large"
                            },
                            {
                                "type": "TextBlock",
                                "text": "Name: " + details[pos].firstName + " " + details[pos].lastName
                            }, 
                            {
                                "type": "TextBlock",
                                "text": "Account Balance: " + details[pos].balance
                            }
                        ]
                    }
                ]
            }
        }));
        session.send("Is there anything else I can help you with?");
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

