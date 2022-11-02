var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../models/users');

/* GET Register Page */
router.get('/register', function(req, res, next) {
  res.render('users/register');
});

/* Handle Registeration */
router.post('/register', async function(req,res,next){
  const {first_name,last_name,email,password,re_password} = req.body;
  let errors = [];
  try {
    // Check required fields
    if(!(first_name || last_name || email || password || re_password)){
      errors.push({msg:"Please fill in all fields."})
    }
    // check Passwords
    if(password !== re_password){
      errors.push({msg:"Passwords do not match"})
    }
    // Check password length
    if(password.length < 6){
      errors.push({msg:"Passwords should be atleast 6 characters"});
    }
    if(errors.length > 0){
      res.render('users/register',{errors,first_name,last_name,email,password,re_password})
    }
    // Check user exists
    const userExists = await User.findOne({where:{email:email}})
    if(userExists){
      errors.push({msg:"Email Already Exists"})
      res.render('users/register',{errors,first_name,last_name,email,password,re_password})
    } else {
      const user = await User.create({
        first_name,
        last_name,
        email,
        password
      })
      req.flash('success_msg','Registeration Success');
      res.redirect('/users/login');
    }

    
  } catch (error) {
    errors.push({msg:error})
    res.render('users/register',{errors,first_name,last_name,email,password,re_password})
  }
  
});

/* GET Login Page */
router.get('/login', function(req, res, next) {
  res.render('users/login');
});

/* Handle Login */
router.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
    succesRedirect : '/',
    succesMessage : 'Login Success',
    failureRedirect: '/users/login',
    failureFlash:true 
  })(req,res,next);
});

/* GET Login Page */
router.get('/logout', function(req, res, next) {
  res.render('users/logout');
});

module.exports = router;
