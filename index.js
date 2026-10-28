const express = require('express');
const cors = require('cors');
const { DataTypes } = require('sequelize');
const { sequelize, Categoria, Producto } = require('./models');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/categorias', require('./routes/categorias'));
app.use('/proveedores', require('./routes/proveedores'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/productos', require('./routes/productos'));
app.use('/movimientos', require('./routes/movimientos'));
app.use('/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 3006;

async function syncDatabase() {
    // The column must be nullable during the first sync so legacy products can be migrated.
    await sequelize.sync({ alter: true });

    const [categoria] = await Categoria.findOrCreate({
        where: { nombre: 'Sin categoría' },
        defaults: { descripcion: 'Categoría asignada a productos existentes sin categoría' }
    });
    const productos = await Producto.findAll({ attributes: ['id', 'categoria_id'] });
    for (const producto of productos) {
        if (!producto.categoria_id || !(await Categoria.findByPk(producto.categoria_id))) {
            await producto.update({ categoria_id: categoria.id });
        }
    }

    Producto.rawAttributes.categoria_id.allowNull = false;
    Producto.refreshAttributes();
    await sequelize.getQueryInterface().changeColumn('productos', 'categoria_id', {
        type: DataTypes.INTEGER,
        allowNull: false
    });
    await sequelize.sync({ alter: true });
}

syncDatabase()
    .then(() => {
        console.log('Base de datos conectada y sincronizada.');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar con la base de datos:', error);
    });
