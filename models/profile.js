const db = require('../config/db');
const { DataTypes } = require('sequelize');


const Profile = db.define('Profile',{
    address : {
        type:DataTypes.STRING,
        allowNull:false
    },
    age : {
        type : DataTypes.INTEGER,
        allowNull:false
    }
},{tableName:'users'})



module.exports= Profile;