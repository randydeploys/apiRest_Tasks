// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,              // supprime les espaces autour
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,            // pas de doublon
    lowercase: true          // stocke en minuscule
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // seulement ces valeurs
    default: 'user'
  },
  age: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);