const express = require('express');
const { Categoria, Producto, Usuario, Movimiento } = require('../models');
const sequelize = require('../config/db');
const { sendError, parseId, findOr404 } = require('./_helpers');

const router = express.Router();
const include = [
    { model: Producto, as: 'producto', attributes: ['id', 'nombre'] },
    { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
];

router.get('/', async (req, res) => {
    try { res.json(await Movimiento.findAll({ include, order: [['fecha_hora', 'DESC']] })); }
    catch (error) { sendError(res, error); }
});

router.post('/', async (req, res) => {
    const { producto_id, usuario_id, tipo_movimiento, cantidad, observaciones } = req.body;
    const amount = Number(cantidad);
    if (!Number.isInteger(amount) || amount === 0 || !['Entrada', 'Salida', 'Ajuste'].includes(tipo_movimiento)) {
        return res.status(400).json({ error: 'Tipo de movimiento o cantidad inválida' });
    }
    if ((tipo_movimiento === 'Entrada' || tipo_movimiento === 'Salida') && amount < 1) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor que 0' });
    }
    try {
        const movement = await sequelize.transaction(async (transaction) => {
            const producto = await Producto.findByPk(producto_id, { transaction, lock: transaction.LOCK.UPDATE });
            if (!producto) throw Object.assign(new Error('El producto no existe'), { status: 400 });
            if (!(await Usuario.findByPk(usuario_id, { transaction }))) {
                throw Object.assign(new Error('El usuario no existe'), { status: 400 });
            }
            const delta = tipo_movimiento === 'Entrada' ? amount : tipo_movimiento === 'Salida' ? -amount : amount;
            if (producto.stock + delta < 0) throw Object.assign(new Error('Stock insuficiente'), { status: 400 });
            await producto.update({ stock: producto.stock + delta }, { transaction });
            return Movimiento.create({ producto_id, usuario_id, tipo_movimiento, cantidad: amount, observaciones }, { transaction });
        });
        res.status(201).json(await Movimiento.findByPk(movement.id, { include }));
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        sendError(res, error);
    }
});

router.put('/:id/anular', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    try {
        await sequelize.transaction(async (transaction) => {
            const movement = await Movimiento.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
            if (!movement) throw Object.assign(new Error('Movimiento no encontrado'), { status: 404 });
            if (movement.anulado) throw Object.assign(new Error('El movimiento ya está anulado'), { status: 400 });
            const producto = await Producto.findByPk(movement.producto_id, { transaction, lock: transaction.LOCK.UPDATE });
            const delta = movement.tipo_movimiento === 'Entrada' ? -movement.cantidad :
                movement.tipo_movimiento === 'Salida' ? movement.cantidad : -movement.cantidad;
            if (producto.stock + delta < 0) throw Object.assign(new Error('Stock insuficiente para anular el movimiento'), { status: 400 });
            await producto.update({ stock: producto.stock + delta }, { transaction });
            await movement.update({ anulado: true }, { transaction });
        });
        res.json(await Movimiento.findByPk(id, { include }));
    } catch (error) {
        if (error.status) return res.status(error.status).json({ error: error.message });
        sendError(res, error);
    }
});

module.exports = router;
