import Task from "../models/task.js";

export const findTaskAndCheckOwner = async (taskId, userId) => {
    const task = await Task.findById(taskId);
    if (!task) return { error: 404, message: "Tâche non trouvée" };
    if (task.user.toString() !== userId) return { error: 403, message: "Interdit" };
    return { task };
};
