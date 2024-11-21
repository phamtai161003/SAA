const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authenticate = require('./middlewares/authenticate'); // Middleware xác thực
const apiRoutes = require('./routes/api'); // Import route chính

const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:8000', // Chỉ định frontend được phép truy cập
    methods: 'GET,POST,PUT,DELETE',  // Chỉ định các phương thức được phép
    credentials: true,              // Để cho phép gửi cookie hoặc header Authorization
}));
app.use(express.json());

// Route không yêu cầu xác thực
app.use('/api/auth', apiRoutes.authRoutes);

// Route yêu cầu xác thực
app.use('/api', authenticate, apiRoutes.protectedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
