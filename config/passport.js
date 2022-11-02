const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/users');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField:'email'},(email,password,done)=>{
            // Match User
            User.findOne({where:{email:email}})
            .then(user=>{
                if(!user){
                    return done(null,false,{msg:"Email not registered"})
                }
                // Match Password
                bcrypt.compare(password,user.password,(err,isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        return done(null,user)
                    } else {
                        return done(null,false,{msg:'Password incorrect'} )
                    }
                });
            })
            .catch(err => console.log(err));
        })
    )
    passport.serializeUser((user,done)=>{
        done(null,user.id)
    })
    passport.deserializeUser((id,done)=>{
        User.findByPk(id).then((user)=>{
            done(null,user);
        });
    });
}