import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${process.env.PORT}`);
});