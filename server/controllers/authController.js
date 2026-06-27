const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Player = require('../models/Player');

// Use placeholder or env variable
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '957786815393-mfcdl1ougpndlspfq5el9eit6ddkc7v3.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'guardianes_secreto_super_seguro_2024';

const client = new OAuth2Client(CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token no proporcionado' });

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const googleId = payload['sub'];
    const email = payload['email'];

    // Check if player exists
    let player = await Player.findOne({ googleId });
    
    if (!player) {
      // Intenta por email temporalmente por compatibilidad si es necesario
      player = await Player.findOne({ email });
    }

    if (!player) {
      // Usuario nuevo, devolver info básica y bandera isNew
      // Generamos un token temporal para que pueda crear la cuenta
      const tempToken = jwt.sign({ googleId, email, isNew: true }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        isNew: true,
        token: tempToken,
        email
      });
    }

    // Usuario existente
    const authToken = jwt.sign({ userId: player.userId, googleId: player.googleId }, JWT_SECRET, { expiresIn: '30d' });
    
    return res.json({
      isNew: false,
      token: authToken,
      player
    });
    
  } catch (error) {
    console.error('Error verificando token de Google:', error);
    res.status(401).json({ message: 'Token inválido o expirado', error: error.message });
  }
};

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: 'No hay token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, googleId, etc }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
