const express = require('express');
const { Categoria, Proveedor, Producto } = require('../models');
const { sendError, parseId, findOr404 } = require('./_helpers');

const router = express.Router();
const include = [
    { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
    { model: Proveedor, as: 'proveedor', attributes: ['id', 'razon_social'] }
];
const fields = ['nombre', 'descripcion', 'precio', 'stock', 'categoria_id', 'proveedor_id'];

async function validateRelations(body, res) {
    if (!Number.isInteger(Number(body.categoria_id)) || !(await Categoria.findByPk(body.categoria_id))) {
        res.status(400).json({ error: 'La categoría no existe' });
        return false;
    }
    if (body.proveedor_id !== undefined && body.proveedor_id !== null &&
        (!Number.isInteger(Number(body.proveedor_id)) || !(await Proveedor.findByPk(body.proveedor_id)))) {
        res.status(400).json({ error: 'El proveedor no existe' });
        return false;
    }
    return true;
}

router.get('/', async (req, res) => {
    try { res.json(await Producto.findAll({ include, order: [['id', 'ASC']] })); }
    catch (error) { sendError(res, error); }
});
router.post('/', async (req, res) => {
    try {
        if (!(await validateRelations(req.body, res))) return;
        const values = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
        const producto = await Producto.create(values);
        res.status(201).json(await Producto.findByPk(producto.id, { include }));
    } catch (error) { sendError(res, error); }
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const producto = await findOr404(Producto, id, res, { include });
        if (producto) res.json(producto);
    } catch (error) { sendError(res, error); }
});
router.put('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const producto = await findOr404(Producto, id, res);
        if (!producto) return;
        if (req.body.categoria_id !== undefined && !(await validateRelations(req.body, res))) return;
        if (req.body.proveedor_id !== undefined) {
            if (req.body.proveedor_id !== null && !(await Proveedor.findByPk(req.body.proveedor_id))) {
                return res.status(400).json({ error: 'El proveedor no existe' });
            }
        }
        const values = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
        await producto.update(values);
        res.json(await Producto.findByPk(id, { include }));
    } catch (error) { sendError(res, error); }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const producto = await findOr404(Producto, id, res);
        if (!producto) return;
        const { Movimiento } = require('../models');
        if (await Movimiento.count({ where: { producto_id: id } })) {
            return res.status(409).json({ error: 'No se puede eliminar el producto porque tiene movimientos' });
        }
        await producto.destroy();
        res.json({ message: 'Producto eliminado' });
    } catch (error) { sendError(res, error); }
});
module.exports = router;
