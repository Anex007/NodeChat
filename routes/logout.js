var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next){
   if(req.session.auth){
	req.session.destroy();
	// If there's more cookie handling do it here

   }

   res.redirect('/login');

});

module.exports = router;
