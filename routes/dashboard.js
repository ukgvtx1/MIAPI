const express = require('express');
const { Categoria, Proveedor, Producto, Movimiento, Usuario } = require('../models');

const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const [total_productos, total_categorias, total_proveedores, bajo_stock, movimientos_recientes, categorias] = await Promise.all([
            Producto.count(), Categoria.count(), Proveedor.count(), Producto.count({ where: { stock: { [require('sequelize').Op.lte]: 10 } } }),
            Movimiento.findAll({
                limit: 5, order: [['fecha_hora', 'DESC']],
                include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }, { model: Usuario, as: 'usuario', attributes: ['nombre'] }]
            }),
            Categoria.findAll({ attributes: ['nombre'], include: [{ model: Producto, as: 'productos', attributes: ['stock'] }] })
        ]);
        res.json({
            total_productos, total_categorias, total_proveedores, bajo_stock, movimientos_recientes,
            stock_por_categoria: categorias.map((categoria) => ({
                categoria: categoria.nombre,
                stock_total: categoria.productos.reduce((sum, producto) => sum + producto.stock, 0)
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
});
module.exports = router;
