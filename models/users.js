const { DataTypes } = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

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
},{tableName:'users',freezeTableName:true,
    hooks:{
        beforeCreate: async (user) => {
            user.password = await bcrypt.hash(user.password,10);
        }
    },
    
})

User.prototype.validatePassword = async (password)=>{
    return await bcrypt.compare(password,this.password)
}

module.exports = User;