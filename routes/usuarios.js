const express = require('express');
const bcrypt = require('bcryptjs');
const { Usuario, Movimiento } = require('../models');
const { sendError, parseId, findOr404 } = require('./_helpers');

const router = express.Router();
const publicAttributes = { exclude: ['password'] };
const allowed = ['nombre', 'email', 'rol'];

router.get('/', async (req, res) => {
    try { res.json(await Usuario.findAll({ attributes: publicAttributes, order: [['id', 'ASC']] })); }
    catch (error) { sendError(res, error); }
});
router.post('/', async (req, res) => {
    try {
        if (!req.body.password) return res.status(400).json({ error: 'El password es obligatorio' });
        const usuario = await Usuario.create({
            nombre: req.body.nombre, email: req.body.email,
            password: await bcrypt.hash(req.body.password, 10), rol: req.body.rol
        });
        const response = usuario.toJSON();
        delete response.password;
        res.status(201).json(response);
    } catch (error) { sendError(res, error); }
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const usuario = await findOr404(Usuario, id, res, { attributes: publicAttributes });
        if (usuario) res.json(usuario);
    } catch (error) { sendError(res, error); }
});
router.put('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const usuario = await findOr404(Usuario, id, res);
        if (!usuario) return;
        const values = Object.fromEntries(allowed.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
        if (req.body.password !== undefined) values.password = await bcrypt.hash(req.body.password, 10);
        await usuario.update(values);
        const response = usuario.toJSON();
        delete response.password;
        res.json(response);
    } catch (error) { sendError(res, error); }
});
router.delete('/:id', async (req, res) => {
    try {
        const id = parseId(req.params.id);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const usuario = await findOr404(Usuario, id, res);
        if (!usuario) return;
        if (await Movimiento.count({ where: { usuario_id: id } })) {
            return res.status(409).json({ error: 'No se puede eliminar el usuario porque tiene movimientos' });
        }
        await usuario.destroy();
        res.json({ message: 'Usuario eliminado' });
    } catch (error) { sendError(res, error); }
});
module.exports = router;
