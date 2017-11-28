var builder = require('botbuilder');

exports.findLocation = function getLocation(session, location) {
    var street, phone;
    var email = "contoso.bank@contosobankltd.co.nz";
    switch (location.toLowerCase()) {
        case "auckland":
            street = "123 Queen Street, Auckland CBD";
            phone = "(09) 646 1234";
            displayLocation(session, "Auckland", street, phone, email);
            break;
        case "wellington":
            street = "321 John Street, Wellington CBD";
            phone = "(04) 475 1526";
            displayLocation(session, "Wellington", street, phone, email);
            break;
        case "christchurch":
            street = "312 Smith Street, Christchurch CBD";
            phone = "(03) 496 8425";
            displayLocation(session, "Christchurch", street, phone, email);
            break;
        default:
            session.send("Sorry, there is no bank located in " + location);
            break;
    }
    session.send("Is there anything else I can help you with?");
}

function displayLocation(session, location, street, phone, email) {
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
                            "text": "Location for " + location,
                            "size": "large"
                        },
                        {
                            "type": "TextBlock",
                            "text": "Street Address: " + street
                        },
                        {
                            "type": "TextBlock",
                            "text": "Phone number: " + phone
                        },
                        {
                            "type": "TextBlock",
                            "text": "Email: " + email
                        }
                    ]
                }
            ]
        }
    }));
}