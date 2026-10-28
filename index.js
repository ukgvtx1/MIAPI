const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('dotenv').config();

// 1. PRIMERO DECLARAS EL MODELO Y LA APLICACIÓN EXPRESS
const Producto = require('./models/producto');
const app = express();

// 2. LUEGO LOS MIDDLEWARES
app.use(cors());
app.use(express.json());

// 3. DESPUÉS COLOCAS TUS RUTAS CRUD
app.post('/productos', async (req, res) => {
    try {
        const nuevoProducto = await Producto.create(req.body);
        res.json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/productos', async (req, res) => {
    try {
        const productos = await Producto.findAll();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/productos/:id', async (req, res) => {
    try {
        await Producto.update(req.body, {
            where: { id: req.params.id }
        });
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/productos/:id', async (req, res) => {
    try {
        await Producto.destroy({
            where: { id: req.params.id }
        });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Y AL FINAL LA CONEXIÓN Y EL SERVIDOR
const PORT = process.env.PORT || 3006;

sequelize.sync({ force: false })
    .then(() => {
        console.log('Base de datos conectada y sincronizada.');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(error => {
        console.error('Error al conectar con la base de datos:', error);
    });