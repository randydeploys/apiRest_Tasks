import express from 'express';
import dotenv from 'dotenv';
const app = express();
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import profileRoutes from './routes/profile.js';
import connectDB from './config/db.js';
import taskRoutes from './routes/task.js';

dotenv.config();

// Connexion à la base de données
connectDB();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);



app.get('/', (req, res) => {
  res.json({ message: 'API fonctionne !' });
});

app.listen(process.env.PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${process.env.PORT}`);
});