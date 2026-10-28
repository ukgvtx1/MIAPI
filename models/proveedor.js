const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Proveedor', {
    razon_social: { type: DataTypes.STRING, allowNull: false },
    contacto: { type: DataTypes.STRING },
    telefono: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING }
}, { tableName: 'proveedores', timestamps: true });
