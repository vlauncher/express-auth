const { DataTypes } = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const Profile = require('./profile');

const User = db.define('User',{
    first_name : {
        type: DataTypes.STRING,
        allowNull:false
    },
    last_name : {
        type: DataTypes.STRING,
        allowNull:false
    },
    email : {
        type: DataTypes.STRING,
        allowNull:false,
        unique:true,
        validate: {
            isEmail:true
        }
    },
    password : {
        type: DataTypes.STRING,
        allowNull:false,
        validate:{
            min:6,
            max:100
        }
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
      },
},{tableName:'users',freezeTableName:true,
    hooks:{
        beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password,10);
        },
        beforeUpdate: hashPasswordHook,
    },
    
})

User.prototype.comparePassword = function (password, callback) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) {
        return callback(err);
      }
      callback(null, isMatch);
    });
  };

User.prototype.validatePassword = async (password)=>{
    return await bcrypt.compare(password,this.password)
}

// Hash password hook
function hashPasswordHook(user) {
    if (user.changed('password')) {
      bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
          throw err;
        }
        user.password = hash;
        user.passwordChangedAt = new Date();
      });
    }
  }

Profile.belongsTo(User)
User.hasOne(Profile)

module.exports = User;