var fx = require("money");
var builder = require('botbuilder');
var upperCase = require('upper-case')
var rest = require("../API/RestClient");

exports.getConversion = function (session, args) {
    console.log(fx);
    getData(session, args);
}

function getData(session, args){
    var url = "https://openexchangerates.org/api/latest.json?app_id=084caa8140894a91a9f78ff7c48a3d70&base=USD";
    rest.getMoneyData(url, session, args, getCurrency);
}

function getCurrency(message, args, session){
    var currencyList = JSON.parse(message);
    var base = currencyList.base;
    var url = "https://openexchangerates.org/api/latest.json?app_id=084caa8140894a91a9f78ff7c48a3d70&base=USD";
    
    rest.getMoneyData(url, session, args, displayMoney);
}

function displayMoney(message, args, session) {
    var rate = JSON.parse(message);
    fx.rates = rate.rates;
    fx.base = rate.base;

    try{
        var conversion = fx.convert(args.Amount, {from: upperCase(args.From), to: upperCase(args.To)});
        //rounding to 2dp
        conversion = Math.round(conversion * 100) / 100;
    
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
                                "text": "Currency conversion",
                                "size": "large"
                            },
                            {
                                "type": "TextBlock",
                                "text": "From: " + args.From
                            },
                            {
                                "type": "TextBlock",
                                "text": "To: " + args.To
                            },
                            {
                                "type": "TextBlock",
                                "text": "Amount to convert: " + args.Amount
                            },
                            {
                                "type": "TextBlock",
                                "text": "Result: " + conversion + " " + args.To
                            }
                        ]
                    }
                ]
            }
        }));
    } catch(ex) {
        session.send("Sorry, I did not understand the currencies you want to convert. Please try again.");
    }
    
}
