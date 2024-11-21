const User = require('../models/user');

// Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
    try {
        const { group_id } = req.query;

        // Lấy tất cả người dùng
        let users = await User.find();

        // Lọc theo group_id nếu có
        if (group_id) {
            users = users.filter(user => user.groups && user.groups.includes(group_id));
        }

        res.status(200).json({ data: users });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);

        // Lưu người dùng vào cơ sở dữ liệu
        await user.save();

        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(400).json({ message: 'Error creating user', details: error.message });
    }
};

// Cập nhật thông tin người dùng (partial update)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Cập nhật thông tin người dùng
        const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(400).json({ message: 'Error updating user', details: error.message });
    }
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
    try {
        const user = req.user; // Lấy từ middleware xác thực

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        res.status(500).json({ message: 'Error fetching current user' });
    }
};
