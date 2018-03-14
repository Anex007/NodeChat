var express = require('express');
var router = express.Router();
var mongo_escape = require('mongo-escape').escape;
var crypto = require('crypto');
var sanitizer = require('sanitizer');
var mongodb = require('mongodb');

function hash(pwd){
  return crypto.createHash('sha256').update(pwd).digest('base64');
}

function makeCookie(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%-=+[]&!#@*(){}^";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('join', {message: 'Nan'});
});

// Make sure to check if there was an error and the redirect did not work and continued execution of the function
router.post('/', function(req, res, next) {

    var databs = req.app.locals.db;
    var invites = databs.collection('invites');
    // Clean the post data from sql injections and validate.
    var to_search = {invite: mongo_escape(req.body.invite) };

    invites.findOne(to_search, function(err, results){
	if(err){
	   console.log('Error occured while connecting to invite collection', err);
	   res.render('join', {message: 'Something wrong happened :('});


	} 
	if (results){

	   // Need to add the check if used = uses
	   if(results.uses == results.used){		
		res.render('join', {'message':"Sorry that invite has been used up. Ask the admin for a new invite"});
		return;
	   }


	   // It was found to be in the database. Now add the username and password to the database.
           // Make sure to add hashed passwords.
	   var user = { _id: new mongodb.ObjectID() , username: sanitizer.escape(mongo_escape(req.body.username)), password: hash(mongo_escape(req.body.password)), ip: req.headers['x-forwarded-for'], chatrooms : results.more_info };

	   var users = databs.collection('users');
	   users.findOne({username: user.username}, function(err, found){
		if(err) {
		    console.log('Unable to connect to users collection', err);
		    res.render('join', {message: 'Something Wrong happened :('});
		    return;
		}
		if(found && found.username){
		    res.render('join', {message:'Username Already Exists.'});
		    return;
		}	
	

	   	// If everything goes to be success add the following
	   	// -> Update the invite collection.		Done
	   	// -> add the user to the users database. 	Done
	   	// -> set session and cookie details.		Done

	   	users.insert(user, function(err, n_results){
			if(err) {
				console.log('Error while adding new user to the colection', err);
			}
	   	});


	   	invites.update(to_search, {"$inc":{used: 1}, "$push":{"used_ppl":user._id}}, function(err, n_results){
			if(err){
				console.log('Error while updating', err);
			}
	   	});

	   	// Make sure to make a cookie and save the cookie and session to the database.
	   	var cook = makeCookie(80);
	   	res.cookie('_t_sd', cook);
	   	req.session.auth = true;
		req.session.chatroom = user.chatrooms;
		req.session.user = user._id;
	   	res.redirect('/chatroom');
		
	});

	} else {
	   res.render('join', {message:'Nice try, you can\'t join without an invite. This will be logged!!'});
	   console.log('Some prick of IP: '+ req.headers['X-forwarded-for'] +' tried out a wrong invite.');
	}
    });

});

module.exports = router;
