var builder = require('botbuilder');

exports.getWelcomeCard = function getWelcomeCard(session) {
    var attachment = [];
    var imageURL = "http://kellycontosobankweb.azurewebsites.net/Resources/logo.PNG";
    var card = new builder.HeroCard(session)
        .images([
            builder.CardImage.create(session, imageURL)]);
    attachment.push(card);
             //Displays restaurant hero card carousel in chat box 
    var message = new builder.Message(session)
        .attachments(attachment);
    session.send(message);
    session.send("Hello, welcome to Contoso Bank Ltd. How can I help you today?");
}

exports.getSetupCard = function getSetupCard(session, info) {
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
                            "text": "Please confirm setup details are correct",
                            "size": "large"
                        },
                        {
                            "type": "TextBlock",
                            "text": "Email: " + info.email
                        },
                        {
                            "type": "TextBlock",
                            "text": "First name: " + info.firstName
                        },
                        {
                            "type": "TextBlock",
                            "text": "Last name: " + info.lastName
                        },
                        {
                            "type": "TextBlock",
                            "text": "Password: " + info.password
                        }
                    ]
                }
            ]
        }
    }));
}