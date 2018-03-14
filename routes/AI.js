var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

/* GET home page. */
router.get('/genetic', function(req, res, next) {
  res.render('genetic');
});

	
module.exports = router;
