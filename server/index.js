const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const playerRoutes = require('./routes/playerRoutes');
const npcRoutes = require('./routes/npcRoutes');
const questionRoutes = require('./routes/questionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');
const authRoutes = require('./routes/authRoutes');

// Cargar variables de entorno
dotenv.config();

// Inicializar base de datos
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/npcs', npcRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Guardianes del Lenguaje en funcionamiento');
});

const PORT = process.env.PORT || 5000;

// Exportar para Vercel Serverless Functions
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo localmente en el puerto ${PORT}`);
  });
}
