const sequelize = require('../config/db');
const Categoria = require('./categoria');
const Proveedor = require('./proveedor');
const Producto = require('./producto');
const Usuario = require('./usuario');
const Movimiento = require('./movimiento');

Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos', onDelete: 'RESTRICT' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria', onDelete: 'RESTRICT' });
Proveedor.hasMany(Producto, { foreignKey: 'proveedor_id', as: 'productos', onDelete: 'RESTRICT' });
Producto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor', onDelete: 'RESTRICT' });
Producto.hasMany(Movimiento, { foreignKey: 'producto_id', as: 'movimientos', onDelete: 'RESTRICT' });
Movimiento.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto', onDelete: 'RESTRICT' });
Usuario.hasMany(Movimiento, { foreignKey: 'usuario_id', as: 'movimientos', onDelete: 'RESTRICT' });
Movimiento.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario', onDelete: 'RESTRICT' });

module.exports = { sequelize, Categoria, Proveedor, Producto, Usuario, Movimiento };
