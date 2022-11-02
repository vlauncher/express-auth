const { Sequelize } = require('sequelize');


const db = new Sequelize({
    dialect:"sqlite",
    storage: "express-auth.sqlite3"
})

db.sync()

module.exports = db;