const { Category, Task, Command } = require('../models');
const { generateCategoryFile, deleteCategoryFile } = require('../utils/fileUtils');
const slugify = require('slugify');

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [
                {
                    model: Task,
                    as: 'tasks',
                    include: [{ model: Command, as: 'commands' }],
                },
                { model: Category, as: 'children' },
            ],
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Task,
                    as: 'tasks',
                    include: [{ model: Command, as: 'commands' }],
                },
                { model: Category, as: 'children' },
            ],
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Error fetching category' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, cmd, expectOutput, parentId } = req.body;

        let parent = null;
        if (parentId) {
            parent = await Category.findByPk(parentId);
            if (!parent) {
                return res.status(404).json({ error: 'Parent category not found' });
            }
        }

        const slug = slugify(name, { lower: true, strict: true }); // Tạo slug hợp lệ
        const category = await Category.create({ name, slug, cmd, expectOutput, parentId });

        // Generate JSON for root category
        const rootCategory = parent ? await parent.getRoot() : category;
        if (rootCategory) {
            await generateCategoryFile(rootCategory);
        }

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Error creating category' });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, cmd, expectOutput } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const updatedData = { name, cmd, expectOutput };
        if (name) {
            updatedData.slug = slugify(name, { lower: true, strict: true }); // Cập nhật slug nếu thay đổi name
        }

        const updatedCategory = await category.update(updatedData);

        // Generate JSON for root category
        const rootCategory = await category.getRoot();
        if (rootCategory) {
            await generateCategoryFile(rootCategory);
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Error updating category' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, { include: [{ model: Category, as: 'children' }] });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Delete JSON file if root category
        if (!category.parentId) {
            await deleteCategoryFile(category);
        }

        // Delete category
        const rootCategory = category.parentId ? await category.getRoot() : null;
        await category.destroy();

        // Regenerate JSON for parent if applicable
        if (rootCategory) {
            await generateCategoryFile(rootCategory);
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Error deleting category' });
    }
};
