var express = require('express');
var router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth')


/* GET home page. */
router.get('/',ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Express',user:req.user });
});

module.exports = router;
