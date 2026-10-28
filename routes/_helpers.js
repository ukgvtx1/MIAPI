const { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } = require('sequelize');

function sendError(res, error) {
    if (error instanceof UniqueConstraintError) return res.status(409).json({ error: 'El valor ya existe' });
    if (error instanceof ForeignKeyConstraintError) return res.status(409).json({ error: 'No se puede eliminar porque tiene registros dependientes' });
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
    console.error(error);
    return res.status(500).json({ error: error.message || 'Error interno del servidor' });
}

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function findOr404(Model, id, res, options) {
    const item = await Model.findByPk(id, options);
    if (!item) {
        res.status(404).json({ error: 'Registro no encontrado' });
        return null;
    }
    return item;
}

module.exports = { sendError, parseId, findOr404 };
