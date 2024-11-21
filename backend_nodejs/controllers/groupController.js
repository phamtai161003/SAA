const Group = require('../models/group');

// Lấy danh sách tất cả các group
const getGroups = async (req, res) => {
    try {
        const groups = await Group.findAll();
        res.status(200).json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Lấy chi tiết một group
const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findByPk(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        console.error('Error fetching group:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Tạo mới một group
const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Group name is required' });
        }
        const newGroup = await Group.create({ name, description });
        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Error creating group:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Cập nhật một group
const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const group = await Group.findByPk(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        group.name = name || group.name;
        group.description = description || group.description;
        await group.save();

        res.status(200).json(group);
    } catch (error) {
        console.error('Error updating group:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Xóa một group
const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await Group.findByPk(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await group.destroy();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
};
