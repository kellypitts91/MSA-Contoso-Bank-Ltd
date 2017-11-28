var request = require('request'); //node module for http post requests

exports.retreiveMessage = function (session) {

    request.post({
        url: 'https://southcentralus.api.cognitive.microsoft.com/customvision/v1.0/Prediction/7c981c43-a288-4d58-8f65-239dc9d322c8/url?iterationId=ce534a89-72e4-4d01-af3f-ebe0762f4eff',
        json: true,
        headers: {
            'Content-Type': 'application/json',
            'Prediction-Key': 'd234aa7d83dc4779aced0ff5ef5b37e8'
        },
        body: { 'Url': session.message.text }
    }, function (error, response, body) {
        console.log(validResponse(body));
        session.send(validResponse(body));
        session.send("Is there anything else I can help you with?");
    });
}

function validResponse(body) {

    if (body && body.Predictions && body.Predictions[0].Tag) {
        return "This image contains " + body.Predictions[0].Tag
    } else {
        console.log('Sorry, I am unsure what that picture contains, please try again!');
    }
}
