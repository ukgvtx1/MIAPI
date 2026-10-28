const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    rol: {
        type: DataTypes.ENUM('Administrador', 'Almacenero', 'Supervisor'),
        allowNull: false,
        defaultValue: 'Almacenero'
    }
}, { tableName: 'usuarios', timestamps: true });
