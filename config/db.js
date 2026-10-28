const { Sequelize } = require("sequelize"); 
require('dotenv').config();

// Crear la instancia con s minúscula
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

// Exportar la instancia en minúscula
module.exports = sequelize;