const { Command, Task } = require('../models');
const { generateCategoryFile } = require('../utils/fileUtils');

exports.createCommand = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { cmd, expect, operator, parser } = req.body;

        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const command = await Command.create({ cmd, expect, operator, parser, taskId });

        // Regenerate the category JSON file
        const category = await task.getCategory();
        if (category) {
            const rootCategory = await category.getRoot();
            if (rootCategory) {
                await generateCategoryFile(rootCategory);
            }
        }

        res.status(201).json(command);
    } catch (error) {
        console.error('Error creating command:', error);
        res.status(500).json({ error: 'Error creating command' });
    }
};

exports.updateCommand = async (req, res) => {
    try {
        const { id } = req.params;

        const command = await Command.findByPk(id);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }

        await command.update(req.body);

        // Regenerate the category JSON file
        const task = await command.getTask();
        if (task) {
            const category = await task.getCategory();
            if (category) {
                const rootCategory = await category.getRoot();
                if (rootCategory) {
                    await generateCategoryFile(rootCategory);
                }
            }
        }

        res.status(200).json(command);
    } catch (error) {
        console.error('Error updating command:', error);
        res.status(500).json({ error: 'Error updating command' });
    }
};

exports.deleteCommand = async (req, res) => {
    try {
        const { id } = req.params;

        const command = await Command.findByPk(id);
        if (!command) {
            return res.status(404).json({ error: 'Command not found' });
        }

        const task = await command.getTask();
        await command.destroy();

        // Regenerate the category JSON file
        if (task) {
            const category = await task.getCategory();
            if (category) {
                const rootCategory = await category.getRoot();
                if (rootCategory) {
                    await generateCategoryFile(rootCategory);
                }
            }
        }

        res.status(200).json({ message: 'Command deleted successfully' });
    } catch (error) {
        console.error('Error deleting command:', error);
        res.status(500).json({ error: 'Error deleting command' });
    }
};

exports.getCommandsByTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const commands = await Command.findAll({ where: { taskId } });
        if (commands.length === 0) {
            return res.status(404).json({ error: 'No commands found for this task' });
        }

        res.status(200).json(commands);
    } catch (error) {
        console.error('Error fetching commands:', error);
        res.status(500).json({ error: 'Error fetching commands' });
    }
};
