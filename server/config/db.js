const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'guardianes_lenguaje';
    
    if (!uri) {
      console.warn('⚠️ No se ha configurado MONGODB_URI en .env');
      return;
    }

    await mongoose.connect(uri, {
      dbName: dbName
    });
    
    console.log(`Conectado a MongoDB Atlas (Base de datos: ${dbName})`);
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
