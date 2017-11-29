/*
 * Sourced and modified from https://ciphertrick.com/2016/01/18/salt-hash-passwords-using-nodejs-crypto/
 */

'use strict';
var crypto = require('crypto');

var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
};

exports.hashPassword = function saltHashPassword(password, salt) {
    if (!salt) {
        salt = genRandomString(16); /** Gives us salt of length 16 */
    }

    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        password: value
    };
};
