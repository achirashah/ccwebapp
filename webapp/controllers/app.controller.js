var bcrypt = require('bcrypt');
var validator = require("email-validator");
var mysql = require('mysql');
var connection = require('../models/app.model');
var schema = require('./passwordValidator');
const uuidv1 = require('uuid/v1');
var Client = require('node-statsd-client').Client;
const logger = require('../config/winston');
var client = new Client("localhost", 8125);



exports.register = function (req, res) {
       logger.info("Register Recipe");
       client.count("Rgister Api call", 10);
    client.increment('Register');
    var start = new Date();
setTimeout(function () {
    client.timing('random.timeout', start);
}, 100 * Math.random());

client.count("num_logged_users", 1);



    console.log("req", req.body);
    if (req.body.firstname == null || req.body.lastname == null || (req.body.firstname).trim().length < 1 || (req.body.lastname).trim().length < 1 || req.body.password == null || req.body.email == null) {

        return res.status(400).send({
            message: 'Bad Request, Parameters are not correct'
        })
    };

    if (!validator.validate(req.body.email)) { return res.status(400).send({ message: 'Bad Request, invalid Email' }) };

    if (!schema.validate(req.body.password)) { return res.status(400).send({ message: 'Bad Request, invalid Password' }) };

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    var today = new Date();
    var uuid = uuidv1();
    var users = {
        id: uuid,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hash,
        created: today,
        modified: today
    }

    var selectSql = "SELECT count(email) AS Count  FROM users WHERE email = ?";
    var insert = [users.email];
    var result = mysql.format(selectSql, insert);
    connection.query(result, function (error, result, fields) {
        var count = result[0].Count;
        console.log("------------" + count)
        if (count >= 1) {
            return res.status(400).send({ message: 'Bad Request, Invalid email' });
        }
        connection.query('INSERT INTO users SET ?', users, function (error, results, fields) {
            if (error) {
                console.log("Bad Request, cannot insert user", error);
                res.send({
                    "code": 400,
                    "failed": "Bad Request"
                })
            }
            var sql = 'SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
            var insert = [users.email]
            var result = mysql.format(sql, insert);

            connection.query(result, function (error, result, fields) {
                if (error) {
                    console.log("Bad Request", error);
                    res.send({
                        "code": 400,
                        "failed": "Bad Request"
                    })
                }
                res.status(201).send(result[0]);
            });
        });
    });
};
exports.update = function (req, res) {

    var today = new Date();
    var token = req.headers['authorization'];
    if (!token) return res.status(401).send({ message: 'Unauthorized, please provide authentication' });

    var tmp = token.split(' ');
    var buf = new Buffer(tmp[1], 'base64');
    var plain_auth = buf.toString();
    var creds = plain_auth.split(':');

    var username = creds[0];
    var password = creds[1];
    console.log("Update creds" + username + " " + password)
    var updateSql = "update users set ";
    var parm = "";
    var insertParam = [];
    var keys = Object.keys(req.body);

    if (username == null || password == null) return res.status(400).send({ message: 'Bad Request, wrong authoraztion provided' });

    connection.query('SELECT * FROM users WHERE email = ?', username, function (error, results, fields) {
        if (error) {
            return res.status(404).send({ message: 'Not found, email not found for this user' });

        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password)) {
                    console.log("-----------Updating----------------------")
                    for (var i = 0; i < keys.length; i++) {
                        parm = parm + keys[i] + "= ?, ";
                        if (keys[i] == "password") {
                            if (!schema.validate(req.body.password)) { return res.status(400).send({ "failed": "Bad Request, invalid Password" }) };
                            var salt = bcrypt.genSaltSync(10);
                            var hash = bcrypt.hashSync(req.body[keys[i]], salt);
                            insertParam.push(hash);
                        } else {
                            if ((req.body[keys[i]]).trim().length < 1) { return res.status(400).send({ "failed": "Bad Request, feilds Cannot be empty" }) };
                            insertParam.push(req.body[keys[i]]);
                        }
                    }
                    if (insertParam.length == 0) return res.status(400).send({ message: 'Bad Request, No parameter found to update' });

                    insertParam.push(today);
                    insertParam.push(username)
                    var updateSqlQuery = updateSql + parm + "modified =? WHERE email = ?"
                    var updateresult = mysql.format(updateSqlQuery, insertParam);
                    connection.query(updateresult, function (error, result, fields) {
                        if (error) {
                            return res.status(400).send({ message: 'Bad Request' });
                        } else {
                            var sql = 'SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
                            var insert = [username]
                            var result = mysql.format(sql, insert);

                            connection.query(result, function (error, result, fields) {
                                if (error) {
                                    console.log("Bad Request", error);
                                    res.status(401).send({
                                       message: "Not found, user not found"
                                    })
                                }
                                else {
                                    res.status(204).send({ message: 'No Content' });
                                }
                            });
                        }
                    });

                } else {
                    return res.status(401).send({ message: 'Unauthorized, password do not match to current user' });
                }
            }
            else {
                return res.status(404).send({ message: 'User Not Found' });
            }

        }
    });
}

exports.login = function (req, res) {

    var token = req.headers['authorization'];

    if (!token) return res.status(401).send({ message: 'Unauthorization' });

    var tmp = token.split(' ');
    var buf = new Buffer(tmp[1], 'base64');
    var plain_auth = buf.toString();
    var creds = plain_auth.split(':');

    var username = creds[0];
    var password = creds[1];


    if (username == null || password == null) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    console.log("user" + username, "password " + password);
    connection.query('SELECT * FROM users WHERE email = ?', username, function (error, results, fields) {
        if (error) {
            return res.status(404).send({ message: 'Not found, email provide is not in available' });
        } else {
            if (results.length > 0) {
                if (bcrypt.compareSync(password, results[0].password) || password == results[0].password) {
                    var sql = 'SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
                    var insert = [username]
                    var result = mysql.format(sql, insert);

                    connection.query(result, function (error, result, fields) {
                        if (error) {
                            console.log("Bad Request", error);
                            return res.status(404).send({ message: 'Not Found, cannot get any user for this email' });
                        }
                        else {
                            res.send(result[0]);
                        }
                    });
                }
                else {
                    return res.status(401).send({ message: 'Unauthorized, password does not match the current user' });
                }
            }
            else {
                return res.status(404).send({ message: 'Not found, user not found for this email' });
            }
        }
    });
};