const Result = require('../models'); // Đảm bảo đúng đường dẫn model
const { generateReportFromJson, evaluateCommandOutput } = require('../utils/fileUtil');
const path = require('path');
const fs = require('fs');

// Lấy danh sách kết quả
exports.getResults = async (req, res) => {
    try {
        const results = await Result.findAll();
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching results:', error.message);
        res.status(500).json({ error: 'Error fetching results' });
    }
};

// Upload file và lưu kết quả
exports.uploadResult = async (req, res) => {
    try {
        const { projectId } = req.body;
        const uploadedFile = req.files?.file; // Sử dụng middleware upload file

        if (!projectId || !uploadedFile) {
            return res.status(400).json({ error: 'Project ID and file are required' });
        }

        // Parse JSON từ file upload
        const jsonData = JSON.parse(uploadedFile.data.toString());
        const reportDir = path.resolve(__dirname, '../../agent/report');
        fs.mkdirSync(reportDir, { recursive: true });

        const fileName = `${jsonData.ip}.docx`;
        const reportPath = path.join(reportDir, fileName);

        let passNum = 0,
            totalNum = 0;

        // Tính toán pass/fail
        jsonData.tasks.forEach((task) => {
            task.commands.forEach((command) => {
                totalNum++;
                const result = evaluateCommandOutput(
                    command.output,
                    command.expected_output,
                    command.operator
                );
                if (result) passNum++;
                command.result = result ? 'PASS' : 'FAIL';
            });
        });

        // Tạo báo cáo
        await generateReportFromJson(jsonData, fileName);

        // Lưu kết quả vào database
        const result = await Result.create({
            name: jsonData.ip,
            ip: jsonData.ip,
            os: jsonData.os || 'Unknown',
            result: passNum === totalNum,
            pass_num: passNum,
            total_num: totalNum,
            projectId,
            creatorId: req.user.id, // Lấy từ middleware xác thực
        });

        res.status(201).json({ message: 'Result uploaded successfully', result, reportPath });
    } catch (error) {
        console.error('Error uploading result:', error.message);
        res.status(500).json({ error: 'Error uploading result' });
    }
};

// Download báo cáo
exports.downloadResult = async (req, res) => {
    try {
        const { id, fileType = 'docx' } = req.query;

        // Tìm kết quả theo ID
        const result = await Result.findByPk(id);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const filePath = path.resolve(__dirname, '../../agent/report', `${result.ip}.${fileType}`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error downloading file:', error.message);
        res.status(500).json({ error: 'Error downloading file' });
    }
};

// Xóa file báo cáo
exports.deleteResult = async (req, res) => {
    try {
        const { id } = req.params;

        // Tìm kết quả theo ID
        const result = await Result.findByPk(id);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        const filePath = path.resolve(__dirname, '../../agent/report', `${result.ip}.docx`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await result.destroy();
        res.status(200).json({ message: 'Result and file deleted successfully' });
    } catch (error) {
        console.error('Error deleting result:', error.message);
        res.status(500).json({ error: 'Error deleting result' });
    }
};

// Cập nhật thông tin kết quả
exports.editResult = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, projectId } = req.body;

        // Tìm và cập nhật thông tin kết quả
        const result = await Result.findByPk(id);
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        if (name) result.name = name;
        if (projectId) result.projectId = projectId;

        await result.save();
        res.status(200).json({ message: 'Result updated successfully', result });
    } catch (error) {
        console.error('Error updating result:', error.message);
        res.status(500).json({ error: 'Error updating result' });
    }
};
