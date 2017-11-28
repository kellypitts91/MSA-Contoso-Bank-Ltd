var builder = require('botbuilder');

exports.getChequeInfo = function (session) {
    var msg = "Debit account information goes here."
    displayInfo(session, "Cheque", msg);
}

exports.getCreditInfo = function (session) {
    var msg = "Credit card account information goes here."
    displayInfo(session, "Credit card", msg);
}

exports.getSavingsInfo = function (session) {
    var msg = "Savings account information goes here."
    displayInfo(session, "Saving", msg);
}

//function to display the different types of accounts with descriptions about them
function displayInfo(session, type, description) {
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
                            "text": type + " Account Information: ",
                            "size": "large"
                        },
                        {
                            "type": "TextBlock",
                            "text": description
                        }
                    ]
                }
            ]
        }
    }));
}