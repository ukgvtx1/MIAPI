// models/Usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs'); // <--- 1. Importar bcryptjs

const Usuario = sequelize.define('Usuario', {
    nombre: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true } // Opcional pero recomendado para validar formato de correo
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('Administrador', 'Almacenero', 'Supervisor'),
        allowNull: false,
        defaultValue: 'Almacenero'
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
        // 2. Antes de guardar en la base de datos, ciframos la contraseña
        beforeCreate: async (usuario) => {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
        },
        // 3. Si se actualiza la contraseña, la volvemos a cifrar
        beforeUpdate: async (usuario) => {
            if (usuario.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                usuario.password = await bcrypt.hash(usuario.password, salt);
            }
        }
    }
});

module.exports = Usuario;