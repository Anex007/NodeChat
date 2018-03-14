var express = require('express');
var router = express.Router();
var multer = require('multer');
var mongodb = require('mongodb');

function getExt(filename){
	var exts = filename.split('.');
	return exts[exts.length-1];
}

const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function(req, file, cb){
		cb(null, Date.now() + '.' + getExt(file.originalname)); 
	}
});

function checkFileType(file, cb){
	const extReg = /\.(png|jpg|jpeg|gif)$/i;
	const mimeReg = /^image\/(png|jpeg|jpg|gif)$/i;
	var compExt = extReg.test(file.originalname);
	var compMime = mimeReg.test(file.mimetype);
	if(compExt && compMime){
		console.log('Compatible');
		return cb(null, true);
	}else{
		cb('Error: images only!');
		console.log(true);
	}
}

var upload = multer({
	storage: storage,
	fileFilter: function(req, file, cb){
			checkFileType(file, cb);
		    },
	limits: {fileSize: 2000000}
}).single('avatar');


router.get('/:user', function(req, res, next){
	const users = req.app.locals.db.collection('users');
	try{
	users.findOne({_id: mongodb.ObjectID.createFromHexString(req.params.user)}, function(err, result){
		if(err) {
			console.log(err);
		} else {
			res.send({username: result.username, avatar: result.avatar});
		}
	});
	}catch(e){
		console.log(e);
		console.log('[Error] USER_ID: ', req.params.user);
		res.status = 400;
		res.send('Stop Sending invalid UserID cunt');
	}

});

router.all('/:user', function(req, res, next){
  console.log('was here');
  if(req.session.auth){
	next();
  }else{
	res.redirect('/login');
  }
});

router.post('/:user', function(req, res) {
	upload(req, res, (err) => {
		if(err) {
			console.log(err, 'Attempting File Uploads');	
			res.send('Not a comaptible File!!');
		}else{
			//Here goes the success things
			const users = req.app.locals.db.collection('users');
			try{
			users.updateOne({_id: mongodb.ObjectID.createFromHexString(req.params.user)}, {"$set": {avatar: "uploads/"+req.file.filename}}, function(err){
				if(err){
					console.log('Something happened while updating the user profile picture ', err);
				}
			});
			res.redirect('/chatroom');
			} catch(e){
				console.log(e);
				console.log('[Error] USER_ID: ', req.params.user);
				res.send('Stop sending invalid UserId cunt');
			}
		}
	});
  
});

module.exports = router;
