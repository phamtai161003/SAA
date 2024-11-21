const { sequelize } = require('./models'); // Đường dẫn đúng đến models/index.js

const syncDatabase = async () => {
    try {
        await sequelize.authenticate(); // Kiểm tra kết nối
        console.log('Connection has been established successfully.');

        await sequelize.sync({ force: true }); // Xóa và tạo lại bảng
        console.log('Database synced successfully.');

        process.exit(0); // Thoát chương trình
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

syncDatabase();
