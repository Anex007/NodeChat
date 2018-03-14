var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var mongo_escape = require('mongo-escape').escape;
var crypto = require('crypto');

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

router.get('/', function(req, res, next) {
   res.render('login', { message:'Nan' });
});


router.post('/', function(req, res, next) {
   // Do a check for all the correct data and don't forget the sql-injection
   var url = 'mongodb://localhost:27017/chatroom';

   var db = req.app.locals.db;
   var collection = db.collection('users');
   var to_search = {username: mongo_escape(req.body.username), password: hash(mongo_escape(req.body.password))};


   if(req.session.tries > 10){
	res.render('login', {message: 'This account has been blocked, Contact the admin in charge'});
	return;
   }

   // Need to add the sql filter and the post data in the corresponding JSON values
   collection.findOne(to_search, function(err, found){

	    if(err) console.log('Error while logging in, ',err);

	    if(found){
		

		// Adding the session.auth and also a cookie that's been generated for you and don't forget to save them to a database too
/*		var cook = makeCookie(80);
		res.cookie('_t_sd', cook, {expire: new Date()+1000*60*60*24*2});
		req.session.cookie = cook;
*/		req.session.auth = true;
		req.session.user = found._id;
		req.session.chatroom = found.chatrooms;
		//db.collection.('cookies').update({req.session});

		req.session.tries = 0;
		res.redirect('/chatroom');

	    }else{
		if(req.session.tries) req.session.tries++;
		else req.session.tries = 1;
		res.render('login', {message: 'The username or password is incorrect'});
	    }


    });
});



module.exports = router;
