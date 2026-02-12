import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Utilisateur déjà existant' });
        }

        //Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //Création du nouvel utilisateur
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Génération d'un token JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ user: { id: user._id, name, email }, token });

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // 3. Générer le token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user: { id: user._id, name: user.name }, token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




export default router;