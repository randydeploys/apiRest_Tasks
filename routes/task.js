import express from 'express';
const router = express.Router();
import taskController from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

router.get('/', auth, taskController.getAll);
router.get('/:id', auth, taskController.getById);
router.post('/', auth, taskController.create);
router.put('/:id', auth, taskController.update);
router.delete('/:id', auth, taskController.deleteTask);

export default router;