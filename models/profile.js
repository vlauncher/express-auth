const db = require('../config/db');
const { DataTypes } = require('sequelize');


const Profile = db.define('Profile',{
    address : {
        type:DataTypes.STRING,
        allowNull:true
    },
    age : {
        type : DataTypes.INTEGER,
        allowNull:true
    }
},{tableName:'profile'})



module.exports= Profile;