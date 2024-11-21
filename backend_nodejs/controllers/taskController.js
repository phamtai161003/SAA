const { Task, Category } = require('../models');
const { generateCategoryFile } = require('../utils/fileUtils');
const slugify = require('slugify');

exports.createTask = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { name, combine, scored, remediation, note } = req.body;

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Generate a unique slug
        let baseSlug = slugify(name, { lower: true, strict: true });
        let slug = baseSlug;
        let counter = 1;
        while (await Task.findOne({ where: { slug, categoryId } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const task = await Task.create({ name, slug, combine, scored, remediation, note, categoryId });

        // Regenerate the category JSON file
        const rootCategory = await category.getRoot();
        if (rootCategory) {
            await generateCategoryFile(rootCategory);
        }

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error.message);
        res.status(500).json({ error: 'Error creating task' });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await task.update(req.body);

        // Regenerate the category JSON file
        const category = await task.getCategory();
        if (category) {
            const rootCategory = await category.getRoot();
            if (rootCategory) {
                await generateCategoryFile(rootCategory);
            }
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({ error: 'Error updating task' });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findByPk(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const category = await task.getCategory();
        await task.destroy();

        // Regenerate the category JSON file
        if (category) {
            const rootCategory = await category.getRoot();
            if (rootCategory) {
                await generateCategoryFile(rootCategory);
            }
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ error: 'Error deleting task' });
    }
};

exports.getTasksByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const tasks = await Task.findAll({ where: { categoryId } });
        if (tasks.length === 0) {
            return res.status(404).json({ error: 'No tasks found for this category' });
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({ error: 'Error fetching tasks' });
    }
};
