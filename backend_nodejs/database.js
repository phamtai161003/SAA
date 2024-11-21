const { Sequelize } = require('sequelize');
require('dotenv').config(); // Tải biến môi trường từ file .env

// Kết nối SQLite với thông tin từ file .env
const sequelize = new Sequelize({
    dialect: process.env.DB_DIALECT || 'sqlite', // Sử dụng 'sqlite' từ .env
    storage: process.env.DB_STORAGE || './database.sqlite', // Đường dẫn database từ .env
    logging: process.env.DB_LOGGING === 'true', // Cho phép log query nếu DB_LOGGING=true
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Kết nối thành công đến SQLite.');
    } catch (error) {
        console.error('Lỗi khi kết nối đến cơ sở dữ liệu:', error);
    }
})();

module.exports = sequelize;
