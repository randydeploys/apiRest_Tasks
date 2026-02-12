import { z } from "zod";

export const createTaskSchema = z.object({
    title: z
        .string()
        .min(2, "Title is too short")
        .max(50, "Title is too long")
        .trim(),

    description: z
        .string()
        .min(5, "Description is too short")
        .trim()
        .optional(),

    priority: z
        .enum(["low", "medium", "high"])
        .optional()
        .default("medium")
});

export const updateTaskSchema = z.object({
    title: z.string().min(2).max(50).trim().optional(),
    description: z.string().min(5).trim().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    completed: z.boolean().optional()
});