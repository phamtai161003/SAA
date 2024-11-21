const Project = require('../models/project');

// Lấy danh sách tất cả Project
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('creator', 'username email') // Lấy thông tin creator
            .exec();
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        res.status(500).json({ message: 'Error fetching projects' });
    }
};

// Tạo mới một Project
exports.createProject = async (req, res) => {
    try {
        const project = new Project({
            ...req.body,
            creator: req.user.id, // Gán creator từ thông tin user đăng nhập
        });
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error.message);
        res.status(400).json({ message: 'Error creating project' });
    }
};

// Cập nhật Project
exports.updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Kiểm tra quyền cập nhật
        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa dự án này.' });
        }

        Object.assign(project, req.body);
        await project.save(); // updatedAt sẽ tự động cập nhật nếu dùng timestamps
        res.status(200).json(project);
    } catch (error) {
        console.error('Error updating project:', error.message);
        res.status(400).json({ message: 'Error updating project' });
    }
};

// Xóa Project
exports.deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Kiểm tra quyền xóa
        if (project.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa dự án này.' });
        }

        await project.deleteOne();
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error.message);
        res.status(500).json({ message: 'Error deleting project' });
    }
};
