const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/db');
const autenticar = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();

// --- CONFIGURACIÓN DE SEGURIDAD ---
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limitador = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 peticiones por IP
    message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.'
});
app.use('/api/', limitador);

// ¡IMPORTANTÍSIMO: Esto debe ir ANTES de las rutas para que lea el JSON del Body!
app.use(express.json());

// --- RUTAS DE AUTENTICACIÓN Y CRUD ---
app.use('/api/auth', require('./routes/auth'));

// --- RUTAS BÁSICAS DE PRUEBA ---
app.get('/', (req, res) => {
    res.send('¡API Backend funcionando exitosamente!');
});

// --- RUTAS CRUD PARA PRODUCTOS ---
// 1. POST: Crear un nuevo producto
app.post('/productos', async (req, res) => {
    try {
        const nuevoProducto = await Producto.create(req.body);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Obtener todos los productos
app.get('/productos', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        const productos = await Producto.findAll();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. PUT: Actualizar un producto existente
app.put('/productos/:id', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        await Producto.update(req.body, {
            where: { id: req.params.id }
        });
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. DELETE: Eliminar un producto
app.delete('/productos/:id', autenticar(['Administrador', 'Almacenero']), async (req, res) => {
    try {
        await Producto.destroy({
            where: { id: req.params.id }
        });
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SINCRONIZACIÓN Y ARRANQUE ---
const PORT = process.env.PORT || 3006;

// force: false evita que se borren los datos cada vez que se reinicia el servidor
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