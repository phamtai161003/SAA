const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Đường dẫn đến file agent
const AGENT_FILES = {
    linux: path.resolve('C:/Users/phamd/OneDrive/Đồ án SAA/SAA/agent/linux/linux.py'),
    windows: path.resolve('C:/Users/phamd/OneDrive/Đồ án SAA/SAA/agent/windows/windows.py'),
};

// Tính SHA-256
const calculateSha256 = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
};

// Lấy SHA-256 của agent
exports.getAgentSha = async (req, res) => {
    const osType = req.query.os;

    if (!osType || !AGENT_FILES[osType]) {
        return res.status(400).json({ error: 'Unsupported or missing OS type' });
    }

    const filePath = AGENT_FILES[osType];

    try {
        const sha256 = await calculateSha256(filePath);
        res.status(200).json({ os: osType, sha256 });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: 'Agent file not found' });
        }
        console.error('Error calculating SHA-256:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Tải xuống agent
exports.downloadAgent = (req, res) => {
    const osType = req.query.os;

    if (!osType || !AGENT_FILES[osType]) {
        return res.status(400).json({ error: 'Unsupported or missing OS type' });
    }

    const filePath = AGENT_FILES[osType];

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Agent file not found' });
    }

    res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
            console.error('Error sending file:', err.message);
            res.status(500).json({ error: 'Error sending file' });
        }
    });
};

// Upload agent mới
exports.uploadAgent = (req, res) => {
    const osType = req.body.os;
    const file = req.files?.file; // Sử dụng middleware express-fileupload

    if (!file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    if (!osType || !AGENT_FILES[osType]) {
        return res.status(400).json({ error: 'Unsupported or missing OS type' });
    }

    const filePath = AGENT_FILES[osType];

    // Lưu file mới
    file.mv(filePath, (err) => {
        if (err) {
            console.error('Error saving file:', err.message);
            return res.status(500).json({ error: 'Error saving file' });
        }

        res.status(201).json({ message: 'Agent uploaded successfully', os: osType });
    });
};
