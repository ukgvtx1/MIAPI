const express = require('express');
const { Categoria, Producto } = require('../models');
const { sendError, parseId, findOr404 } = require('./_helpers');

const router = express.Router();
const productCount = '(SELECT COUNT(*) FROM productos AS p WHERE p.categoria_id = Categoria.id)';

router.get('/', async (req, res) => {
    try {
        const categorias = await Categoria.findAll({
            attributes: { include: [[Categoria.sequelize.literal(productCount), 'cantidad_productos']] },
            order: [['id', 'ASC']]
        });
        res.json(categorias);
    } catch (error) { sendError(res, error); }
});

router.post('/', async (req, res) => {
    try {
        const categoria = await Categoria.create({ nombre: req.body.nombre, descripcion: req.body.descripcion });
        res.status(201).json(categoria);
    } catch (error) { sendError(res, error); }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const categoria = await findOr404(Categoria, id, res);
        if (categoria) res.json(categoria);
    } catch (error) { sendError(res, error); }
});

router.put('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const categoria = await findOr404(Categoria, id, res);
        if (!categoria) return;
        await categoria.update({ nombre: req.body.nombre, descripcion: req.body.descripcion });
        res.json(categoria);
    } catch (error) { sendError(res, error); }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const categoria = await findOr404(Categoria, id, res);
        if (!categoria) return;
        if (await Producto.count({ where: { categoria_id: id } })) {
            return res.status(409).json({ error: 'No se puede eliminar la categoría porque tiene productos' });
        }
        await categoria.destroy();
        res.json({ message: 'Categoría eliminada' });
    } catch (error) { sendError(res, error); }
});

module.exports = router;
