const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

module.exports = sequelize.define('Movimiento', {
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo_movimiento: {
        type: DataTypes.ENUM('Entrada', 'Salida', 'Ajuste'),
        allowNull: false
    },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    fecha_hora: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    observaciones: { type: DataTypes.TEXT },
    anulado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'movimientos', timestamps: true });
