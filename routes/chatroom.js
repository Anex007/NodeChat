var express = require('express');
var router = express.Router();
const mongodb = require('mongodb');
const mongo_escape = require('mongo-escape').escape;
const mongo_unescape = require('mongo-escape').unescape;
const sanitizer = require('sanitizer');

// Make sure to initialize every chatroom with some message to show at the beggining.
// Add some caching to store the previous last message's id so that we don't have to process any more to save resources


router.get('/', function(req, res, next){
  if(req.session.auth){

     //req.session.status = 

     const db = req.app.locals.db;
     if(req.query.ajax_1 || req.query.ajax_2){
	if(req.app.locals.l_id == req.query.l_id){
		console.log(req.app.locals.l_id +' : '+ req.query.l_id);
		res.send('Nomsg');
		return;
	}

	var sort;
	// AJAX Get for current messages will be "$gt" and previous messages will be "$lt"
	req.query.ajax_2 ? sort = "$lt" : sort = "$gt" ;

	try{
		var l_msg = {_id : mongodb.ObjectID.createFromHexString(mongo_escape(req.query.l_id))};
	}catch(e){
		res.status = 400;
		res.send('Not a valid ID!!!');
		return;
	}
	var roomdb = db.collection(req.session.chatroom);
	roomdb.findOne(l_msg, function(err, result){
	  if(err) console.log('Something happened while finding 1 chat from chatroom', err);
		if(result){
			var to_find = {};
			to_find.time = {};
			to_find.time[sort] = new Date(result.time);
	
			roomdb.find(to_find).toArray(function(err2, results){
				if(err2) console.log('Smthin hpnd while finding last chats', err);
				if(results.length){	
				   if(req.query.ajax_2){
					res.send(results.reverse());
					return;
				   }
				   req.app.locals.l_id = results[results.length-1]['_id'];
				   res.send(results);
				} else {
				   res.send('Nomsg');
				}
			});

		}else{	
			res.status = 400;
			res.send('Could not find the Chat you last have');
		}
	});
	
     }else{
	// Non AJAX Get here. 
	// Need to add user functionality here too.
	console.log('chatroom ',req.session.chatroom);
     	var roomdb = db.collection(req.session.chatroom);
     	roomdb.find({}).sort({time: -1}).limit(50).toArray(function(err, chat){
			var n_chat = chat.reverse();
			var invites = db.collection('invites');
			invites.findOne({more_info: req.session.chatroom}, function(err, results){
				if(err) console.log('Error while getting users table', err);
				res.render('chatroom', {chat: n_chat, users: results.used_ppl, me: req.session.user});
			});
    	});
     	
    }
  }else{
     res.redirect('/login');
  }

});


router.post('/', function(req, res, next){
  if(req.session.auth){ 
      var msg = sanitizer.escape(mongo_escape(req.body.content));
      if(!msg){
	res.status = 400;
	res.send('Stop Sending nothing fuckwit');
	return;
      }

      if(msg.length>1000){
	res.status = 400;
	res.send('The length of the message is more than 1000 characters');
	return;
      }
      const db = req.app.locals.db;
      var roomdb = db.collection(req.session.chatroom);
      var to_insert = {_id: new mongodb.ObjectID(), from: req.session.user, content: msg, time: new Date()};
      req.app.locals.l_id = to_insert.l_id;
      roomdb.insertOne(to_insert, function(err, n){
	if(err) {
	   console.log('Something happened while inserting the chatroom collection ', err)
     	   res.status = 500;
	   res.send('Cannot Send data for some reason contact the admin Now!!!');
	}
      });
      res.redirect('/chatroom');

  }else{
     res.redirect('/login');
  }

});


module.exports = router;
