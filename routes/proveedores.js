const express = require('express');
const { Proveedor, Producto } = require('../models');
const { sendError, parseId, findOr404 } = require('./_helpers');

const router = express.Router();
const fields = ['razon_social', 'contacto', 'telefono', 'email'];

router.get('/', async (req, res) => {
    try { res.json(await Proveedor.findAll({ order: [['id', 'ASC']] })); }
    catch (error) { sendError(res, error); }
});
router.post('/', async (req, res) => {
    try {
        const proveedor = await Proveedor.create(Object.fromEntries(fields.map((field) => [field, req.body[field]])));
        res.status(201).json(proveedor);
    } catch (error) { sendError(res, error); }
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const proveedor = await findOr404(Proveedor, id, res);
        if (proveedor) res.json(proveedor);
    } catch (error) { sendError(res, error); }
});
router.put('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const proveedor = await findOr404(Proveedor, id, res);
        if (!proveedor) return;
        await proveedor.update(Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])));
        res.json(proveedor);
    } catch (error) { sendError(res, error); }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const proveedor = await findOr404(Proveedor, id, res);
        if (!proveedor) return;
        if (await Producto.count({ where: { proveedor_id: id } })) {
            return res.status(409).json({ error: 'No se puede eliminar el proveedor porque tiene productos' });
        }
        await proveedor.destroy();
        res.json({ message: 'Proveedor eliminado' });
    } catch (error) { sendError(res, error); }
});
module.exports = router;
