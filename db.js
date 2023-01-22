const {Sequelize} = require('sequelize');

module.exports = new Sequelize({
    dialect: 'sqlite',
    storage: 'var/db.sqlite',
    logging: false
});
