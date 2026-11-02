const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/db');
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
app.use('/categorias', require('./routes/categorias'));
app.use('/proveedores', require('./routes/proveedores'));
app.use('/productos', require('./routes/productos'));
app.use('/movimientos', require('./routes/movimientos'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/dashboard', require('./routes/dashboard'));

// --- RUTAS BÁSICAS DE PRUEBA ---
app.get('/', (req, res) => {
    res.send('¡API Backend funcionando exitosamente!');
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