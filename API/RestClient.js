var request = require('request');

exports.getAccountInfo = function getData(url, session, accNumber, accPassword, callback) {
    request.get(url, {
        'headers':
            {
                'ZUMO-API-VERSION': '2.0.0'
            }
    },
        function handleGetReponse(err, res, body) {
            if (err) {
                console.log(err);
            } else {
                callback(body, session, accNumber, accPassword);
            }
        });
};

exports.postAccountInfo = function SendData(url, accInfo) {
    var options = {
        url: url,
        method: 'POST',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type': 'application/json'
        },
        json: accInfo
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
        }
        else {
            console.log(error);
        }
    });
};

exports.deleteAccount = function deleteData(url, session, accNumber, id, callback) {
    var options = {
        url: url + "\\" + id,
        method: 'DELETE',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type': 'application/json'
        }
    };

    request(options, function (err, res, body) {
        if (!err && res.statusCode === 200) {
            console.log(body);
            callback(body, session, accNumber);
        } else {
            console.log(err);
            console.log(res);
        }
    })
};

exports.getMoneyData = function getData(url, session, args, callback){
    
    request.get(url, function(err,res,body){
        if(err){
            console.log(err);
        }else {
            callback(body, args, session);
        }
    });
};