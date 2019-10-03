var bcrypt = require('bcrypt');
var validator = require("email-validator");
var mysql      = require('mysql');
var connection = require('../models/app.model');
var schema = require('./passwordValidator');
const uuidv1 = require('uuid/v1');

exports.register = function(req,res){
    
    console.log("req",req.body);
    if(req.body.firstname==null || req.body.lastname==null|| (req.body.firstname).trim().length<1 ||(req.body.lastname).trim().length<1 || req.body.password==null || req.body.email==null){

        return res.status(400).send({message: 'Bad Request'
    })};

    if(!validator.validate(req.body.email)){return res.status(400).send({ message: 'Bad Request, invalid Email'})};

    if(!schema.validate(req.body.password)){return  res.status(400).send({  message: 'Bad Request, invalid Password'})};

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    var today = new Date();    
    var uuid =uuidv1();
    var users={
      id:uuid,
      firstname: req.body.firstname,
      lastname:req.body.lastname,
      email:req.body.email,
      password:hash,
      created:today,
      modified:today
    }
    
    var selectSql ="SELECT count(email) AS Count  FROM users WHERE email = ?";
    var insert =[users.email ];
    var result =  mysql.format(selectSql,insert);
    connection.query(result, function (error, result, fields) {
        var count = result[0].Count;
       console.log("------------"+count)
        if(count>=1){
<<<<<<< HEAD
           return res.status(400).send({  message: 'Bad Request' });
=======
           return res.status(400).send({message: 'Bad Request, Invalid Input' });
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada
        }else{
            connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
                if (error) {
                  console.log("Bad Request",error);
                  res.send({
                    "code":400,
                    "failed":"Bad Request"
                  })
                }else{
                    var sql ='SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
                    var insert =[users.email]
                    var result =  mysql.format(sql,insert);
    
                    connection.query(result, function (error, result, fields) {
                        if (error) {
                            console.log("Bad Request",error);
                            res.send({
                            "code":400,
                            "failed":"Bad Request"
                        })
                    }
                    else{
                        res.status(201).send(result[0]);
                    }
                });
                }
            });
        }  
    });

  };
<<<<<<< HEAD

// get user information with basic auth

exports.login = function(req,res){
      
    var token = req.headers['authorization'];

    if (!token) return res.status(400).send({  message: 'Bad Request'});
    
    var tmp = token.split(' ');
    var buf = new Buffer(tmp[1], 'base64');
    var plain_auth = buf.toString();
    var creds = plain_auth.split(':');

    var username = creds[0];
    var password = creds[1];
    
    
    if (username==null || password==null) {
          return res.status(400).send({  message: 'Bad Request'});
        }
        console.log("user" +  username, "password " + password );
        connection.query('SELECT * FROM users WHERE email = ?',username, function (error, results, fields) {
            if (error) {
                res.status(400).send({  message: 'Bad Request'})
            }else{
                if(results.length >0){
                    if(bcrypt.compareSync(password,results[0].password) || password==results[0].password){
                        var sql ='SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
                        var insert =[username]
                        var result =  mysql.format(sql,insert);
        
                        connection.query(result, function (error, result, fields) {
                            if (error) {
                                console.log("Bad Request",error);
                                res.status(400).send({  message: 'Bad Request'})
                        }
                        else{
                            res.send(result);
                        }
                    });
                }
                else{
                    res.status(400).send({  message: 'Bad Request'})
                }
            }
            else{
                res.status(400).send({  message: 'Bad Request'})
                }
            }
        });
};


// update user information

exports.update = function(req,res){
=======
  
  exports.update = function(req,res){
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada
    var today = new Date();

    var token = req.headers['authorization'];

<<<<<<< HEAD
    if (!token) return res.status(400).send({  message: 'Bad Request'});
=======
    if (!token) return res.status(400).send({  message: 'Bad Request' });
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada

    var tmp = token.split(' ');
    var buf = new Buffer(tmp[1], 'base64');
    var plain_auth = buf.toString();
    var creds = plain_auth.split(':');

    var username = creds[0];
    var password = creds[1];
    console.log("Update creds"+ username + " "+ password)
    var updateSql = "update users set ";
    var parm = "";
    var insertParam =[];
    var keys = Object.keys(req.body);
<<<<<<< HEAD
    if (username==null || password==null) return res.status(400).send({  message: 'Bad Request'});
    
      connection.query('SELECT * FROM users WHERE email = ?',username, function (error, results, fields) {
          if (error) {
              return res.status(400).send({  message: 'Bad Request'});
=======
    if (username==null || password==null) return res.status(400).send({ message: 'Bad Request' });
    
      connection.query('SELECT * FROM users WHERE email = ?',username, function (error, results, fields) {
          if (error) {
            return res.status(404).send({ message: 'Bad Request' });
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada
          }else{
            if(results.length >0){
              if(bcrypt.compareSync(password,results[0].password) ){
                console.log("-----------Updating----------------------")
                  for (var i = 0; i < keys.length; i++) {
<<<<<<< HEAD
                      if(keys[i]=="email" || keys[i]=="modified"||keys[i]=="created"){
                          return res.status(400).send({  message: 'Bad Request'});
                      }          
=======
                              
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada
                      parm = parm + keys[i]+"= ?, ";
                      if(keys[i]=="password"){
                        if(!schema.validate(req.body.password)){return res.status(400).send({"failed":"Bad Request, invalid Password"})};
                          var salt = bcrypt.genSaltSync(10);
                          var hash = bcrypt.hashSync(req.body[keys[i]], salt);
                          insertParam.push(hash);
                        }else{
                            if((req.body[keys[i]]).trim().length<1){ return res.status(400).send({"failed":"Bad Request, feilds Cannot be empty"})};
                            insertParam.push(req.body[keys[i]]);
                        }
                  }
<<<<<<< HEAD
                  if (insertParam.length==0) return res.status(400).send({  message: 'Bad Request'})
=======
                  if (insertParam.length==0) return res.status(400).send({ message: 'Bad Request' });
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada

                  insertParam.push(today);
                  insertParam.push(username)
                  var updateSqlQuery = updateSql+ parm + "modified =? WHERE email = ?"
                  var updateresult =mysql.format(updateSqlQuery,insertParam);
                      connection.query(updateresult, function (error, result, fields) {
                          if (error) {
<<<<<<< HEAD
                            res.status(400).send({  message: 'Bad Request'})
=======
                              return res.status(400).send({ message: 'Bad Request' });
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada
                          }else{
                            var sql ='SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
                            var insert =[username]
                            var result =  mysql.format(sql,insert);
            
                            connection.query(result, function (error, result, fields) {
                                if (error) {
                                    console.log("Bad Request",error);
                                    res.send({
                                    "code":400,
                                    "failed":"Bad Request"
                                })
                            }
                            else{
<<<<<<< HEAD
                                res.status(204).send({  message: 'No Content' }); 
=======
                                res.status(204).send({  message: 'No Content' });
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada
                            }
                        });
                          }
                      });
               
              }else{
<<<<<<< HEAD
                res.status(400).send({  message: 'Bad Request'})
          } 
            }
            else{
                res.status(400).send({  message: 'Bad Request'})
=======
                return res.status(401).send({ message: 'Unauthorized' });
          } 
            }
            else{
                return res.status(404).send({ message: 'Content Not Found' });
>>>>>>> ce03ff02ed458b77dcbd1d6a0400c2cf5650bada
            }
              
            }
        });  
  }

  exports.login = function(req,res){
      
    var token = req.headers['authorization'];

    if (!token) return res.status(401).send({ message: 'Unauthorization' });
    
    var tmp = token.split(' ');
    var buf = new Buffer(tmp[1], 'base64');
    var plain_auth = buf.toString();
    var creds = plain_auth.split(':');

    var username = creds[0];
    var password = creds[1];
    
    
    if (username==null || password==null) {
        return res.status(400).send({ message: 'Bad Request' });
        }
        console.log("user" +  username, "password " + password );
        connection.query('SELECT * FROM users WHERE email = ?',username, function (error, results, fields) {
            if (error) {
                return res.status(404).send({ message: 'Bad Request' });
            }else{
                if(results.length >0){
                    if(bcrypt.compareSync(password,results[0].password) || password==results[0].password){
                        var sql ='SELECT id , firstname, lastname, email, created, modified  FROM users WHERE email = ?';
                        var insert =[username]
                        var result =  mysql.format(sql,insert);
        
                        connection.query(result, function (error, result, fields) {
                            if (error) {
                                console.log("Bad Request",error);
                                return res.status(404).send({ message: 'Bad Request' });
                        }
                        else{
                            res.send(result);
                        }
                    });
                }
                else{
                    return res.status(401).send({ message: 'Unauthorized' });
                }
            }
            else{
                return res.status(404).send({ message: 'Bad Request' });
                }
            }
        });
};