import express from 'express';
import dotenv from 'dotenv';
const app = express();
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import profileRoutes from './routes/profile.js';
import connectDB from './config/db.js';
import taskRoutes from './routes/task.js';
import { Server } from "socket.io";
import http from "http";

dotenv.config();

// Connexion à la base de données
connectDB();

//Création du serveur
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // en prod, mets l'URL de ton frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
io.on('connection', (socket) => {
  console.log('🟢 Client connecté :', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`📌 User ${userId} a rejoint sa room`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté :', socket.id);
  });
});

app.set('io', io);

// Middlewares globaux
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tasks', taskRoutes);



app.get('/', (req, res) => {
  res.json({ message: 'API fonctionne !' });
});

server.listen(process.env.PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${process.env.PORT}`);
});