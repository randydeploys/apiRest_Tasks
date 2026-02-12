import { findTaskAndCheckOwner } from '../helpers/checkOwner.js';
import Task from '../models/task.js';
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator.js";


export const getAll = async (req, res) => {
    try {
        // 1. FILTRES
        const filter = { user: req.user.userId };

        if (req.query.priority) {
            filter.priority = req.query.priority;
        }
        if (req.query.completed !== undefined) {
            filter.completed = req.query.completed === 'true';
        }

        // 2. TRI
        const sortField = req.query.sort || 'createdAt';
        const sortOrder = req.query.order === 'asc' ? 1 : -1;


        // 3. PAGINATION
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1;
        const skip = (page - 1) * limit;

        // 4. REQUÊTE
        const [tasks, total] = await Promise.all([
            Task.find(filter)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit),
            Task.countDocuments(filter)
        ]);

        // 5. RÉPONSE
        res.json({
            data: tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const create = async (req, res) => {
    try {

        // Validation Zod
        const result = createTaskSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.flatten().fieldErrors
            });
        }


        const task = await Task.create({
            ...result.data,
            user: req.user.userId
        });


        return res.status(201).json({
            success: true,
            data: task
        });

    } catch (error) {
        console.error("Create Task Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }

        if (task.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Interdit : ce n'est pas ta tâche" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const update = async (req, res) => {
    try {
        // 1. Validation Zod
        const result = updateTaskSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.flatten().fieldErrors,
            });
        }

        // 2. Vérifier existence + propriétaire (le helper fait tout)
        const { error, message } = await findTaskAndCheckOwner(
            req.params.id,
            req.user.userId
        );
        if (error) return res.status(error).json({ message });

        // 3. Mettre à jour (utiliser result.data au lieu de req.body)
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            result.data, // ← données déjà validées et nettoyées par Zod
            { new: true, runValidators: true }
        );

        res.json({ success: true, data: updatedTask });
    } catch (error) {
        console.error("Update Task Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
export const deleteTask = async (req, res) => {
    try {
        const { error, message, task } = await findTaskAndCheckOwner(
            req.params.id,
            req.user.userId
        );
        if (error) return res.status(error).json({ message });

        await task.deleteOne(); // ← on réutilise le document directement
        res.json({ message: "Tâche supprimée" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default { getAll, create, update, deleteTask, getById };
