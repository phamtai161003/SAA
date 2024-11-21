const bcrypt = require('bcrypt');
const User = require('./models/user'); // Đảm bảo đường dẫn đúng đến model User
const sequelize = require('./database'); // Đảm bảo đường dẫn đúng đến file db.js

const createSuperUser = async () => {
    try {
        // Kết nối cơ sở dữ liệu
        await sequelize.authenticate();
        console.log('Database connected.');

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash('Phamtaiqh1@', 10);

        // Tạo superuser
        const superuser = await User.create({
            username: 'superuser',
            email: 'superuser@example.com',
            password: hashedPassword,
            is_superuser: true,
            is_staff: true,
            is_active: true,
        });

        console.log('Superuser created successfully:', superuser);
        process.exit(0);
    } catch (error) {
        console.error('Error creating superuser:', error);
        process.exit(1);
    }
};

createSuperUser();
