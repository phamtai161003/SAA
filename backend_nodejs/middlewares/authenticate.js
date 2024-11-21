const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Gắn thông tin người dùng vào request
        next(); // Tiếp tục xử lý route
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token.' });
        }
        console.error('Authentication error:', err);
        res.status(500).json({ message: 'Internal server error during authentication.' });
    }
};

module.exports = authenticate;
