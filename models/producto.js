const {DataTypes} = require ('sequelize');
const sequelize = require('../config/db');
const { toDefaultValue } = require('sequelize/lib/utils');

const producto = sequelize.define('producto',{
    nombre: {
        type:DataTypes.STRING,
        allowNull:false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    precio:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    stock:{
        type: DataTypes.INTEGER,
        toDefaultValue: 0
    }

}, {
    timestamps: true    
});

module.exports = producto;